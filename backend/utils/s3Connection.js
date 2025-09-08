import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import "dotenv/config";

export const s3Client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export async function getObjectURL(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  const url = getSignedUrl(s3Client, command);
  return url;
}

export async function putObject(fileName, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: "image/jpeg",
  });

  try {
    await s3Client.send(command);
    const url = await getObjectURL(fileName);
    return url;
  } catch (err) {
    console.log("Error", err);
    return "FAILED";
  }
}

// Upload media from Dialog360 to S3 with compression
export async function uploadMediaFromDialog360(mediaId, filename) {
  try {
    console.log(`Starting image download and compression for media ID: ${mediaId}`);
    
    // First, get the media URL from Dialog360
    const mediaResponse = await fetch(`https://waba-v2.360dialog.io/${mediaId}`, {
      headers: {
        'D360-API-KEY': process.env.DIALOG360_API_KEY
      }
    });
    
    if (!mediaResponse.ok) {
      throw new Error(`Failed to fetch media from Dialog360: ${mediaResponse.statusText}`);
    }
    
    const originalImageBuffer = await mediaResponse.buffer();
    console.log(`Original image size: ${(originalImageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    // Compress image to ensure it's under 1MB
    let compressedImageBuffer = originalImageBuffer;
    let quality = 85;
    const maxSizeBytes = 1024 * 1024; // 1MB limit
    
    if (originalImageBuffer.length <= maxSizeBytes) {
      compressedImageBuffer = await sharp(originalImageBuffer)
        .jpeg({ quality: 90, progressive: true })
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    } else {
      while (compressedImageBuffer.length > maxSizeBytes && quality > 20) {
        compressedImageBuffer = await sharp(originalImageBuffer)
          .jpeg({ quality: quality, progressive: true })
          .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
        
        console.log(`Compressed to ${(compressedImageBuffer.length / 1024 / 1024).toFixed(2)}MB at ${quality}% quality`);
        
        if (compressedImageBuffer.length > maxSizeBytes) {
          quality -= 10;
        }
      }
      
      if (compressedImageBuffer.length > maxSizeBytes) {
        compressedImageBuffer = await sharp(originalImageBuffer)
          .jpeg({ quality: 60, progressive: true })
          .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
      }
    }
    
    const finalSizeMB = (compressedImageBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`Final compressed image size: ${finalSizeMB}MB`);

    const key = `complaints/${filename}-${Date.now()}.jpg`;
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: compressedImageBuffer,
      ContentType: 'image/jpeg',
      Metadata: {
        'original-size': (originalImageBuffer.length / 1024 / 1024).toFixed(2) + 'MB',
        'compressed-size': finalSizeMB + 'MB',
        'complaint-id': filename,
        'upload-source': 'dialog360'
      }
    });

    await s3Client.send(command);
    console.log(`Successfully uploaded compressed image to S3: ${key}`);
    
    const publicUrl = await getObjectURL(key);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading media from Dialog360 to S3:', error);
    return null;
  }
}

// Download image from Twilio MediaUrl, compress, and upload to S3 (legacy)
export async function uploadMediaFromTwilio(mediaUrl, complaintId) {
  try {
    console.log(`Starting image download and compression for complaint: ${complaintId}`);
    
    // Download image from Twilio
    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const originalImageBuffer = await response.buffer();
    console.log(`Original image size: ${(originalImageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    // Compress image to ensure it's under 1MB
    let compressedImageBuffer = originalImageBuffer;
    let quality = 85; // Start with 85% quality
    const maxSizeBytes = 1024 * 1024; // 1MB limit
    
    // If original image is already under 1MB, try mild compression for optimization
    if (originalImageBuffer.length <= maxSizeBytes) {
      compressedImageBuffer = await sharp(originalImageBuffer)
        .jpeg({ quality: 90, progressive: true })
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    } else {
      // Aggressive compression for large images
      while (compressedImageBuffer.length > maxSizeBytes && quality > 20) {
        compressedImageBuffer = await sharp(originalImageBuffer)
          .jpeg({ quality: quality, progressive: true })
          .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
        
        console.log(`Compressed to ${(compressedImageBuffer.length / 1024 / 1024).toFixed(2)}MB at ${quality}% quality`);
        
        if (compressedImageBuffer.length > maxSizeBytes) {
          quality -= 10;
        }
      }
      
      // If still too large, resize more aggressively
      if (compressedImageBuffer.length > maxSizeBytes) {
        compressedImageBuffer = await sharp(originalImageBuffer)
          .jpeg({ quality: 60, progressive: true })
          .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
          .toBuffer();
      }
    }
    
    const finalSizeMB = (compressedImageBuffer.length / 1024 / 1024).toFixed(2);
    console.log(`Final compressed image size: ${finalSizeMB}MB`);
    
    // Generate unique file name
    const fileName = `potholes/${complaintId}-${Date.now()}.jpg`;
    
    // Upload compressed image to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: compressedImageBuffer,
      ContentType: 'image/jpeg',
      Metadata: {
        'original-size': (originalImageBuffer.length / 1024 / 1024).toFixed(2) + 'MB',
        'compressed-size': finalSizeMB + 'MB',
        'complaint-id': complaintId
      }
    });

    await s3Client.send(command);
    console.log(`Image uploaded successfully to S3: ${fileName}`);
    
    // Get public URL
    const url = await getObjectURL(fileName);
    return url;
    
  } catch (err) {
    console.error("Error uploading media from Twilio:", err);
    return null;
  }
}
