# Image Migration Script

This Python script migrates pothole images from a private S3 bucket to a public S3 bucket with manual approval and MongoDB collection migration.

## Features

1. **Download Images from Private S3**: Downloads all images from the `potholes/` folder in your private S3 bucket
2. **Automatic Renaming**: Removes timestamp suffixes from image filenames (e.g., `3a7e60c7-1edd-423a-94f0-740e30b82d3c-1759030896093.jpg` → `3a7e60c7-1edd-423a-94f0-740e30b82d3c.jpg`)
3. **Complaint Matching**: Uses filename as complaint ID to find matching complaints in MongoDB
4. **Manual Approval**: Displays each image and waits for your approval before processing
5. **Public S3 Upload**: Uploads approved images to a public S3 bucket with public-read ACL
6. **MongoDB Migration**: Creates new documents in `complaintsPublic` collection with updated image URLs

## Prerequisites

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Private S3 Bucket (existing configuration)
AWS_ACCESS_KEY=your_private_access_key
AWS_SECRET_KEY=your_private_secret_key
AWS_S3_BUCKET=your-private-bucket-name
AWS_S3_BUCKET_REGION=eu-north-1

# Public S3 Bucket Configuration
PUBLIC_AWS_ACCESS_KEY=your_public_access_key  # Can be same as private
PUBLIC_AWS_SECRET_KEY=your_public_secret_key  # Can be same as private
PUBLIC_AWS_S3_BUCKET=your-public-bucket-name  # Must be different
PUBLIC_AWS_S3_REGION=eu-north-1

# MongoDB
MONGODB_URI=mongodb://...
```

### 3. Configure Public S3 Bucket

Make sure your public S3 bucket:

- Has public access enabled
- Has a bucket policy that allows public reads
- Is configured to serve images via HTTPS

Example bucket policy for public reads:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-public-bucket-name/*"
    }
  ]
}
```

## Usage

### Run the Migration Script

```bash
python migrate_images.py
```

### Interactive Process

For each image, the script will:

1. Display the complaint details:

   - Phone number (hashed)
   - GPS coordinates
   - Status, language, report count
   - Current image URL

2. Show the image in your default image viewer

3. Prompt you for approval:

   ```
   👉 Do you want to upload this image to public bucket? (yes/no):
   ```

4. If you answer **yes**:

   - **IMMEDIATELY** uploads image to public S3 bucket
   - Verifies the S3 upload was successful
   - **IMMEDIATELY** creates new document in `complaintsPublic` collection
   - Verifies the MongoDB write was successful
   - Shows confirmation that all operations are committed
   - Each image is fully processed and saved before moving to the next

5. If you answer **no**:
   - Skips the image and moves to the next one

### Example Output (When Approved)

```
✅ Approved! Processing immediately...

   🔄 STEP 1: Upload to Public S3
   ────────────────────────────────────────────────────────────
      → Uploading 3a7e60c7-1edd-423a-94f0-740e30b82d3c.jpg to S3...
      → Verifying upload...
      → Upload verified and committed to S3
   ✅ S3 Upload Complete!
   🔗 Public URL: https://potholes-prod.s3.ap-south-1.amazonaws.com/potholes/3a7e60c7-1edd-423a-94f0-740e30b82d3c.jpg

   🔄 STEP 2: Write to MongoDB
   ────────────────────────────────────────────────────────────
      → Writing complaint to MongoDB...
      → Verifying database write...
      → Database write verified (MongoDB ID: 507f1f77bcf86cd799439011)
   ✅ MongoDB Write Complete!

   ============================================================
   ✅ Image 1/150 fully processed and committed!
   ============================================================
```

### Summary Report

At the end, you'll see a summary:

```
📊 MIGRATION SUMMARY
================================================================================
Total images downloaded: 150
Successfully processed & committed: 125
  → Uploaded to S3: 125
  → Written to MongoDB: 125
Skipped: 25
================================================================================
✅ All approved images have been immediately uploaded and saved!
================================================================================
```

## Output Structure

### Downloaded Images

Images are downloaded to `./downloaded_images/` with renamed filenames (UUID only).

### Public S3 Structure

Images are uploaded to: `potholes/{complaint-id}.jpg`

Example:

```
potholes/3a7e60c7-1edd-423a-94f0-740e30b82d3c.jpg
```

### MongoDB Collections

- **complaints** (original): Unchanged
- **complaintsPublic** (new): Contains approved complaints with public image URLs

## Important Notes

1. **Original Data Preserved**: The script does NOT modify the original `complaints` collection
2. **Immediate Writes**: Each approved image is uploaded to S3 and written to MongoDB **immediately** before moving to the next image
3. **Verification**: Both S3 uploads and MongoDB writes are verified to ensure data integrity
4. **Manual Control**: Every image requires your manual approval
5. **Image Display**: Requires a GUI environment to display images (uses PIL Image.show())
6. **Error Handling**: If an error occurs, the script will skip that image and continue

## Troubleshooting

### Image Won't Display

- Make sure you're running in a GUI environment
- Alternatively, check the downloaded file path and view manually

### Missing Complaints

- Images without matching complaints are automatically skipped
- Check the complaint ID extraction regex if needed

### S3 Upload Fails

- Verify AWS credentials and bucket permissions
- Ensure public bucket allows public-read ACL
- Check bucket CORS configuration if needed

### MongoDB Connection Issues

- Verify MONGODB_URI is correct
- Ensure network access to MongoDB
- Check MongoDB Atlas IP whitelist if using cloud

## Script Flow

```
1. Initialize connections (S3 private, S3 public, MongoDB)
2. Download all images from private S3 potholes/ folder
3. Rename images (remove timestamp suffix)
4. Load all complaints from MongoDB
5. For each downloaded image:
   a. Extract complaint ID from filename
   b. Find matching complaint in MongoDB
   c. Display image and complaint details
   d. Wait for user approval (yes/no)
   e. If yes:
      - Upload to public S3
      - Create document in complaintsPublic collection
   f. If no: skip to next image
6. Display summary report
7. Cleanup and close connections
```

## Cleanup

Downloaded images remain in `./downloaded_images/` folder. You can delete this folder after migration is complete:

```bash
rm -rf downloaded_images/
```

## Support

For issues or questions, check:

- AWS S3 console for bucket configuration
- MongoDB Atlas/Compass for collection verification
- Script logs for detailed error messages
