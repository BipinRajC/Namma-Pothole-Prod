# Quick Start Guide - Image Migration

## 🚀 Ready to Migrate? Follow These Steps

### Step 1: Test Your Configuration (Recommended)

Before running the migration, test your setup:

```bash
python3 test_migration.py
```

This will verify:

- ✅ Environment variables are set
- ✅ Private S3 bucket connection
- ✅ Public S3 bucket connection
- ✅ MongoDB connection
- ✅ Python dependencies

### Step 2: Run the Migration

#### Option A: Using the Quick-Start Script (Recommended)

```bash
./run_migration.sh
```

This script will:

- Create a virtual environment
- Install dependencies
- Run the migration with safety checks

#### Option B: Run Directly

```bash
# Install dependencies first
pip install -r requirements.txt

# Run migration
python3 migrate_images.py
```

### Step 3: Approve Images

For each image, the script will:

1. **Show complaint details**

   ```
   📋 Complaint Details:
      Phone: +91XXXXXXXXXX
      Location: (12.9716, 77.5946)
      Status: reported
   ```

2. **Display the image** (opens in default image viewer)

3. **Wait for your approval**

   ```
   👉 Do you want to upload this image to public bucket? (yes/no):
   ```

4. **If you type "yes"** → Immediate upload and save:

   ```
   ✅ Approved! Processing immediately...

      🔄 STEP 1: Upload to Public S3
      → Uploading image to S3...
      → Verifying upload...
      → Upload verified and committed to S3

      🔄 STEP 2: Write to MongoDB
      → Writing complaint to MongoDB...
      → Verifying database write...
      → Database write verified

      ✅ Image fully processed and committed!
   ```

5. **If you type "no"** → Skip to next image

### Step 4: Review Summary

At the end, you'll see:

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

## ⚡ Key Features

### Immediate Processing

- **Each approved image is processed immediately** before moving to next
- S3 upload happens instantly upon approval
- MongoDB write happens instantly after S3 upload
- Both operations are verified before moving on

### Safety Features

- ✅ Original `complaints` collection is NEVER modified
- ✅ All data goes to new `complaintsPublic` collection
- ✅ Each write is verified before proceeding
- ✅ Errors won't stop the process (failed images are skipped)
- ✅ Press Ctrl+C anytime to stop safely

### Data Verification

- **S3 Verification**: Uses `head_object()` to confirm upload
- **MongoDB Verification**: Reads back the document to confirm write
- **URL Validation**: Checks that image URL matches in database

## 📋 Checklist Before Starting

- [ ] `.env` file is configured with all credentials
- [ ] Private S3 bucket has images in `potholes/` folder
- [ ] Public S3 bucket (`potholes-prod`) exists and is accessible
- [ ] MongoDB is accessible and has `complaints` collection
- [ ] You're running in a GUI environment (to display images)
- [ ] Python 3 is installed
- [ ] You have `pip` installed

## 🆘 Troubleshooting

### Images Won't Display

- Make sure you're in a GUI environment (not SSH without X11)
- Images are saved in `./downloaded_images/` - you can check them manually

### S3 Upload Fails

- Check AWS credentials
- Verify public bucket has correct ACL settings
- Ensure bucket policy allows public reads

### MongoDB Write Fails

- Check MONGODB_URI is correct
- Verify network access to MongoDB
- Check MongoDB Atlas IP whitelist if using cloud

### "Missing Environment Variable" Error

- Copy `env.example` to `.env`
- Fill in all required values
- Source the `.env` file or restart terminal

## 🧹 Cleanup After Migration

Once migration is complete, you can:

1. **Delete downloaded images** (optional):

   ```bash
   rm -rf downloaded_images/
   ```

2. **Verify migration in MongoDB**:

   - Check `complaintsPublic` collection
   - Verify image URLs are public S3 URLs

3. **Test public image access**:
   - Open a public URL in browser
   - Confirm images are accessible

## 📚 More Information

- See `MIGRATION_README.md` for detailed documentation
- See `requirements.txt` for Python dependencies
- See `migrate_images.py` for the full script

## 🎯 What Gets Migrated?

### Image Processing

- ✅ Downloads from: `s3://your-private-bucket/potholes/`
- ✅ Uploads to: `s3://potholes-prod/potholes/`
- ✅ Filename change: `uuid-timestamp.jpg` → `uuid.jpg`
- ✅ Public URL: `https://potholes-prod.s3.ap-south-1.amazonaws.com/potholes/uuid.jpg`

### Database Migration

- ✅ Source: `complaints` collection (read-only)
- ✅ Destination: `complaintsPublic` collection (write)
- ✅ Update: `imageUrl` field with public S3 URL
- ✅ All other fields copied as-is

---

**Ready?** Run `python3 test_migration.py` to get started! 🚀
