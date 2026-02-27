import {
  S3Client,
  PutObjectCommand,
  // GetObjectCommand,
} from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import fetch from "node-fetch";
import sharp from "sharp";
import "dotenv/config";

export const s3Client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION,
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export async function getObjectURL(key) {
  // const command = new GetObjectCommand({
  //   Bucket: process.env.AWS_S3_BUCKET,
  //   Key: key,
  // });

  // const url = getSignedUrl(s3Client, command);
  // const cleanUrl = url.split("?")[0];
  // return cleanUrl;

  const bucketName = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_S3_BUCKET_REGION;
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  return publicUrl;
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

// Upload media from buffer to S3 with compression (for admin evidence uploads)
export async function uploadMediaFromBuffer(
  buffer,
  fileId,
  contentType = "image/jpeg",
) {
  try {
    // Compress image to ensure it's under 1MB
    let compressedImageBuffer = buffer;
    let quality = 85;
    const maxSizeBytes = 1024 * 1024; // 1MB limit

    // If original image is already under 1MB, try mild compression for optimization
    if (buffer.length <= maxSizeBytes) {
      compressedImageBuffer = await sharp(buffer)
        .jpeg({ quality: 90, progressive: true })
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
    } else {
      // Aggressive compression for large images
      while (compressedImageBuffer.length > maxSizeBytes && quality > 20) {
        compressedImageBuffer = await sharp(buffer)
          .jpeg({ quality: quality, progressive: true })
          .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
          .toBuffer();

        if (compressedImageBuffer.length > maxSizeBytes) {
          quality -= 10;
        }
      }

      // If still too large, resize more aggressively
      if (compressedImageBuffer.length > maxSizeBytes) {
        compressedImageBuffer = await sharp(buffer)
          .jpeg({ quality: 60, progressive: true })
          .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
          .toBuffer();
      }
    }

    const finalSizeMB = (compressedImageBuffer.length / 1024 / 1024).toFixed(2);

    // Generate unique file name
    const fileName = `evidence/${fileId}-${Date.now()}.jpg`;

    // Upload compressed image to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: compressedImageBuffer,
      ContentType: "image/jpeg",
      Metadata: {
        "original-size": (buffer.length / 1024 / 1024).toFixed(2) + "MB",
        "compressed-size": finalSizeMB + "MB",
        "file-id": fileId,
        "upload-source": "admin-evidence",
      },
    });

    await s3Client.send(command);

    // Get public URL
    const url = await getObjectURL(fileName);
    return url;
  } catch (err) {
    console.error("Error uploading media from buffer:", err);
    return null;
  }
}

// Upload media from WABA Connect URL to S3 with compression
export async function uploadMediaFromWABA(mediaUrl, complaintId) {
  try {
    // console.log(`Starting image download and compression from WABA Connect for complaint: ${complaintId}`);
    // console.log(`Media URL: ${mediaUrl}`);

    // Download image from WABA Connect URL (no authentication needed)
    const response = await fetch(mediaUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image from WABA Connect: ${response.statusText}`,
      );
    }

    const originalImageBuffer = await response.buffer();
    // console.log(`Original image size: ${(originalImageBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    // Compress image to ensure it's under 1MB
    let compressedImageBuffer = originalImageBuffer;
    let quality = 85; // Start with 85% quality
    const maxSizeBytes = 1024 * 1024; // 1MB limit

    // If original image is already under 1MB, try mild compression for optimization
    if (originalImageBuffer.length <= maxSizeBytes) {
      compressedImageBuffer = await sharp(originalImageBuffer)
        .jpeg({ quality: 90, progressive: true })
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
    } else {
      // Aggressive compression for large images
      while (compressedImageBuffer.length > maxSizeBytes && quality > 20) {
        compressedImageBuffer = await sharp(originalImageBuffer)
          .jpeg({ quality: quality, progressive: true })
          .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
          .toBuffer();

        // console.log(`Compressed to ${(compressedImageBuffer.length / 1024 / 1024).toFixed(2)}MB at ${quality}% quality`);

        if (compressedImageBuffer.length > maxSizeBytes) {
          quality -= 10;
        }
      }

      // If still too large, resize more aggressively
      if (compressedImageBuffer.length > maxSizeBytes) {
        compressedImageBuffer = await sharp(originalImageBuffer)
          .jpeg({ quality: 60, progressive: true })
          .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
          .toBuffer();
      }
    }

    const finalSizeMB = (compressedImageBuffer.length / 1024 / 1024).toFixed(2);
    // console.log(`Final compressed image size: ${finalSizeMB}MB`);

    // Generate unique file name
    const fileName = `potholes/${complaintId}-${Date.now()}.jpg`;

    // Upload compressed image to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: compressedImageBuffer,
      ContentType: "image/jpeg",
      Metadata: {
        "original-size":
          (originalImageBuffer.length / 1024 / 1024).toFixed(2) + "MB",
        "compressed-size": finalSizeMB + "MB",
        "complaint-id": complaintId,
        "upload-source": "waba-connect",
      },
    });

    await s3Client.send(command);
    // console.log(`Image uploaded successfully to S3: ${fileName}`);

    // Get public URL
    const url = await getObjectURL(fileName);
    return url;
  } catch (err) {
    console.error("Error uploading media from WAPI:", err);
    return null;
  }
}
