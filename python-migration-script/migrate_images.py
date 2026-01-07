#!/usr/bin/env python3
"""
Script to migrate pothole images from private S3 bucket to public S3 bucket
with manual approval process and MongoDB collection migration.
"""

import os
import sys
import boto3
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import re
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
PRIVATE_AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
PRIVATE_AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
PRIVATE_AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
PRIVATE_AWS_S3_REGION = os.getenv("AWS_S3_BUCKET_REGION", "eu-north-1")

# Public bucket configuration (you'll need to set these)
PUBLIC_AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
PUBLIC_AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
PUBLIC_AWS_S3_BUCKET = "potholes-prod"
PUBLIC_AWS_S3_REGION = "ap-south-1"

MONGODB_URI = os.getenv("MONGODB_URI")

# Local download directory
DOWNLOAD_DIR = "./downloaded_images"


class ImageMigrator:
    def __init__(self):
        """Initialize S3 clients and MongoDB connection."""
        # Private S3 client
        self.private_s3 = boto3.client(
            "s3",
            aws_access_key_id=PRIVATE_AWS_ACCESS_KEY,
            aws_secret_access_key=PRIVATE_AWS_SECRET_KEY,
            region_name=PRIVATE_AWS_S3_REGION,
        )

        # Public S3 client
        self.public_s3 = boto3.client(
            "s3",
            aws_access_key_id=PUBLIC_AWS_ACCESS_KEY,
            aws_secret_access_key=PUBLIC_AWS_SECRET_KEY,
            region_name=PUBLIC_AWS_S3_REGION,
        )

        # MongoDB connection
        self.mongo_client = MongoClient(MONGODB_URI)
        self.db = self.mongo_client.get_database()
        self.complaints_collection = self.db["complaints"]
        self.complaints_public_collection = self.db["complaintsPublic"]

        # Create download directory
        Path(DOWNLOAD_DIR).mkdir(exist_ok=True)

        print("✅ Initialized S3 clients and MongoDB connection")
        print(f"   Private S3 Bucket: {PRIVATE_AWS_S3_BUCKET}")
        print(f"   Public S3 Bucket: {PUBLIC_AWS_S3_BUCKET}")
        print(f"   MongoDB Database: {self.db.name}")
        print()

    def download_images_from_s3(self) -> List[Dict[str, str]]:
        """
        Download all images from potholes folder in private S3 bucket.
        Returns list of dicts with original_key, local_path, and complaint_id.
        """
        print("📥 Starting download from private S3 bucket...")
        downloaded_files = []

        try:
            # List all objects in the potholes folder
            paginator = self.private_s3.get_paginator("list_objects_v2")
            pages = paginator.paginate(Bucket=PRIVATE_AWS_S3_BUCKET, Prefix="potholes/")

            for page in pages:
                if "Contents" not in page:
                    continue

                for obj in page["Contents"]:
                    s3_key = obj["Key"]

                    # Skip if it's just the folder itself
                    if s3_key.endswith("/"):
                        continue

                    # Extract filename from S3 key
                    original_filename = os.path.basename(s3_key)

                    # Remove everything after the last hyphen (including the hyphen)
                    # Example: 3a7e60c7-1edd-423a-94f0-740e30b82d3c-1759030896093.jpg
                    # -> 3a7e60c7-1edd-423a-94f0-740e30b82d3c.jpg
                    match = re.match(r"^(.+)-[^-]+(\.[^.]+)$", original_filename)
                    if match:
                        complaint_id = match.group(1)
                        extension = match.group(2)
                        new_filename = f"{complaint_id}{extension}"
                    else:
                        # If pattern doesn't match, use original filename
                        new_filename = original_filename
                        # Try to extract complaint ID (UUID pattern)
                        uuid_match = re.search(
                            r"([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
                            original_filename,
                            re.IGNORECASE,
                        )
                        complaint_id = uuid_match.group(1) if uuid_match else None

                    if not complaint_id:
                        print(
                            f"   ⚠️  Skipping {original_filename} - couldn't extract complaint ID"
                        )
                        continue

                    # Download file
                    local_path = os.path.join(DOWNLOAD_DIR, new_filename)

                    print(f"   📥 Downloading: {original_filename}")
                    print(f"      -> Saving as: {new_filename}")
                    print(f"      -> Complaint ID: {complaint_id}")

                    self.private_s3.download_file(
                        PRIVATE_AWS_S3_BUCKET, s3_key, local_path
                    )

                    downloaded_files.append(
                        {
                            "original_key": s3_key,
                            "local_path": local_path,
                            "complaint_id": complaint_id,
                            "filename": new_filename,
                        }
                    )

            print(f"\n✅ Downloaded {len(downloaded_files)} images\n")
            return downloaded_files

        except Exception as e:
            print(f"❌ Error downloading images: {e}")
            raise

    def get_all_complaints(self) -> Dict[str, Dict]:
        """
        Get all complaints from MongoDB and index them by complaint ID.
        Returns dict with complaint_id as key and complaint document as value.
        """
        print("📊 Fetching all complaints from MongoDB...")

        try:
            complaints = list(self.complaints_collection.find())
            complaints_dict = {
                complaint["complaintId"]: complaint for complaint in complaints
            }
            print(f"✅ Loaded {len(complaints_dict)} complaints\n")
            return complaints_dict

        except Exception as e:
            print(f"❌ Error fetching complaints: {e}")
            raise

    def display_image(self, image_path: str):
        """Display image using PIL."""
        try:
            img = Image.open(image_path)
            img.show()
        except Exception as e:
            print(f"   ⚠️  Could not display image: {e}")
            print(f"   Please manually check: {image_path}")

    def upload_to_public_s3(self, local_path: str, complaint_id: str) -> str:
        """
        Upload image to public S3 bucket immediately.
        Returns the public URL and verifies the upload.
        """
        filename = os.path.basename(local_path)
        s3_key = f"potholes/{filename}"

        try:
            # Upload file immediately
            print(f"      → Uploading {filename} to S3...")
            self.public_s3.upload_file(
                local_path,
                PUBLIC_AWS_S3_BUCKET,
                s3_key,
                ExtraArgs={
                    "ContentType": "image/jpeg",
                    "ACL": "public-read",  # Make it publicly readable
                    "Metadata": {
                        "complaint-id": complaint_id,
                        "migration-source": "private-bucket",
                    },
                },
            )

            # Verify the upload by checking if object exists
            print(f"      → Verifying upload...")
            self.public_s3.head_object(Bucket=PUBLIC_AWS_S3_BUCKET, Key=s3_key)

            # Generate public URL
            public_url = f"https://{PUBLIC_AWS_S3_BUCKET}.s3.{PUBLIC_AWS_S3_REGION}.amazonaws.com/{s3_key}"

            print(f"      → Upload verified and committed to S3")

            return public_url

        except Exception as e:
            print(f"   ❌ Error uploading to public S3: {e}")
            raise

    def create_public_complaint(self, complaint: Dict, new_image_url: str) -> str:
        """
        Create a new complaint document in complaintsPublic collection immediately.
        Returns the MongoDB document ID.
        """
        try:
            # Create a copy of the complaint
            public_complaint = complaint.copy()

            # Update the image URL
            public_complaint["imageUrl"] = new_image_url

            # Remove _id to let MongoDB generate a new one
            if "_id" in public_complaint:
                del public_complaint["_id"]

            # Insert into complaintsPublic collection immediately
            print(f"      → Writing complaint to MongoDB...")
            result = self.complaints_public_collection.insert_one(public_complaint)

            # Verify the write by reading it back
            print(f"      → Verifying database write...")
            verified_doc = self.complaints_public_collection.find_one(
                {"_id": result.inserted_id}
            )

            if verified_doc and verified_doc.get("imageUrl") == new_image_url:
                print(
                    f"      → Database write verified (MongoDB ID: {result.inserted_id})"
                )
                return str(result.inserted_id)
            else:
                raise Exception("Database verification failed")

        except Exception as e:
            print(f"   ❌ Error creating public complaint: {e}")
            raise

    def process_images(self, downloaded_files: List[Dict], complaints_dict: Dict):
        """
        Main processing loop - iterate through images, display, get approval,
        upload to public S3, and create public complaint records.
        """
        print("🔄 Starting image processing...\n")

        processed_count = 0
        skipped_count = 0
        approved_count = 0

        for idx, file_info in enumerate(downloaded_files, 1):
            complaint_id = file_info["complaint_id"]
            local_path = file_info["local_path"]
            filename = file_info["filename"]

            print(f"{'='*80}")
            print(f"Processing image {idx}/{len(downloaded_files)}")
            print(f"Complaint ID: {complaint_id}")
            print(f"Filename: {filename}")
            print(f"{'='*80}")

            # Check if complaint exists
            if complaint_id not in complaints_dict:
                print(f"⚠️  No complaint found for ID: {complaint_id}")
                print(f"   Skipping this file.\n")
                skipped_count += 1
                continue

            complaint = complaints_dict[complaint_id]

            # Display complaint info
            print(f"\n📋 Complaint Details:")
            print(f"   Phone: {complaint.get('phoneNumber', 'N/A')}")
            print(
                f"   Location: ({complaint.get('latitude', 'N/A')}, {complaint.get('longitude', 'N/A')})"
            )
            print(f"   Status: {complaint.get('status', 'N/A')}")
            print(f"   Language: {complaint.get('language', 'N/A')}")
            print(f"   Report Count: {complaint.get('reportCount', 1)}")
            print(f"   Current Image URL: {complaint.get('imageUrl', 'N/A')}")

            # Display the image
            print(f"\n🖼️  Displaying image: {filename}")
            self.display_image(local_path)

            # Get user approval
            while True:
                response = (
                    input(
                        "\n👉 Do you want to upload this image to public bucket? (yes/no): "
                    )
                    .strip()
                    .lower()
                )

                if response in ["yes", "y"]:
                    print(f"\n✅ Approved! Processing immediately...")
                    print(f"\n   🔄 STEP 1: Upload to Public S3")
                    print(f"   {'─'*60}")

                    try:
                        # Upload to public S3 immediately
                        public_url = self.upload_to_public_s3(local_path, complaint_id)
                        print(f"   ✅ S3 Upload Complete!")
                        print(f"   🔗 Public URL: {public_url}")

                        # Create public complaint record immediately
                        print(f"\n   🔄 STEP 2: Write to MongoDB")
                        print(f"   {'─'*60}")
                        mongo_id = self.create_public_complaint(complaint, public_url)
                        print(f"   ✅ MongoDB Write Complete!")

                        approved_count += 1
                        processed_count += 1

                        print(f"\n   {'='*60}")
                        print(
                            f"   ✅ Image {idx}/{len(downloaded_files)} fully processed and committed!"
                        )
                        print(f"   {'='*60}\n")

                    except Exception as e:
                        print(f"\n❌ Error processing image: {e}\n")
                        skipped_count += 1

                    break

                elif response in ["no", "n"]:
                    print(f"\n⏭️  Skipped. Moving to next image.\n")
                    skipped_count += 1
                    break

                else:
                    print("   ⚠️  Invalid input. Please enter 'yes' or 'no'.")

        # Summary
        print(f"\n{'='*80}")
        print(f"📊 MIGRATION SUMMARY")
        print(f"{'='*80}")
        print(f"Total images downloaded: {len(downloaded_files)}")
        print(f"Successfully processed & committed: {approved_count}")
        print(f"  → Uploaded to S3: {approved_count}")
        print(f"  → Written to MongoDB: {approved_count}")
        print(f"Skipped: {skipped_count}")
        print(f"{'='*80}")
        print(f"✅ All approved images have been immediately uploaded and saved!")
        print(f"{'='*80}\n")

    def cleanup(self):
        """Close MongoDB connection."""
        if self.mongo_client:
            self.mongo_client.close()
            print("✅ Closed MongoDB connection")

    def run(self):
        """Main execution flow."""
        try:
            # Step 1: Download images from private S3
            downloaded_files = self.download_images_from_s3()

            if not downloaded_files:
                print("⚠️  No images found to process. Exiting.")
                return

            # Step 2: Get all complaints from MongoDB
            complaints_dict = self.get_all_complaints()

            # Step 3: Process images with manual approval
            self.process_images(downloaded_files, complaints_dict)

        except KeyboardInterrupt:
            print("\n\n⚠️  Process interrupted by user. Exiting...")
        except Exception as e:
            print(f"\n❌ Fatal error: {e}")
            raise
        finally:
            self.cleanup()


def main():
    """Entry point."""
    # Validate required environment variables
    required_vars = [
        "AWS_ACCESS_KEY",
        "AWS_SECRET_KEY",
        "AWS_S3_BUCKET",
        "PUBLIC_AWS_S3_BUCKET",  # You need to set this!
        "MONGODB_URI",
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these in your .env file or environment.")
        sys.exit(1)

    print("🚀 Starting Image Migration Process\n")

    migrator = ImageMigrator()
    migrator.run()

    print("\n🎉 Migration process completed!")


if __name__ == "__main__":
    main()
