#!/usr/bin/env python3
"""
Simple migration script:
  1. Download all images from AWS S3 (potholes/ prefix) — filenames kept as-is
  2. Upload each image to Supabase Storage (S3-compatible) under potholes/
  3. Copy all docs from MongoDB 'newcomplaints' → 'prodcomplaints'
  4. Update imageUrl in 'prodcomplaints' with the new Supabase URLs

Supabase S3 endpoint: https://<project-ref>.supabase.co/storage/v1/s3
Generate S3 keys at: Supabase Dashboard → Settings → Storage → S3 Access Keys
"""

import os
import sys
from pathlib import Path

import boto3
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# ── AWS (source) ────────────────────────────────────────────────────────────
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
AWS_S3_REGION = os.getenv("AWS_S3_BUCKET_REGION", "eu-north-1")

# ── Supabase (destination) ──────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")  # e.g. https://xxx.supabase.co
SUPABASE_S3_ACCESS_KEY = os.getenv("SUPABASE_S3_ACCESS_KEY")
SUPABASE_S3_SECRET_KEY = os.getenv("SUPABASE_S3_SECRET_KEY")
SUPABASE_S3_BUCKET = os.getenv("SUPABASE_S3_BUCKET", "pothole-images")
SUPABASE_S3_REGION = os.getenv("SUPABASE_S3_REGION", "ap-south-1")
SUPABASE_S3_ENDPOINT = f"{SUPABASE_URL}/storage/v1/s3" if SUPABASE_URL else None

# ── MongoDB ─────────────────────────────────────────────────────────────────
MONGODB_URI = os.getenv("MONGODB_URI")

DOWNLOAD_DIR = "./downloaded_images"


def check_env():
    """Validate that all required env vars are set."""
    required = {
        "AWS_ACCESS_KEY": AWS_ACCESS_KEY,
        "AWS_SECRET_KEY": AWS_SECRET_KEY,
        "AWS_S3_BUCKET": AWS_S3_BUCKET,
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_S3_ACCESS_KEY": SUPABASE_S3_ACCESS_KEY,
        "SUPABASE_S3_SECRET_KEY": SUPABASE_S3_SECRET_KEY,
        "MONGODB_URI": MONGODB_URI,
    }
    missing = [k for k, v in required.items() if not v]
    if missing:
        print("Missing required environment variables:")
        for var in missing:
            print(f"  - {var}")
        sys.exit(1)


def main():
    check_env()
    Path(DOWNLOAD_DIR).mkdir(exist_ok=True)

    # ── Clients ─────────────────────────────────────────────────────────────
    aws_s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_S3_REGION,
    )

    supabase_s3 = boto3.client(
        "s3",
        aws_access_key_id=SUPABASE_S3_ACCESS_KEY,
        aws_secret_access_key=SUPABASE_S3_SECRET_KEY,
        endpoint_url=SUPABASE_S3_ENDPOINT,
        region_name=SUPABASE_S3_REGION,
    )

    mongo = MongoClient(MONGODB_URI)
    db = mongo.get_database()

    print(f"AWS bucket:        {AWS_S3_BUCKET} ({AWS_S3_REGION})")
    print(f"Supabase bucket:   {SUPABASE_S3_BUCKET}")
    print(f"Supabase endpoint: {SUPABASE_S3_ENDPOINT}")
    print(f"MongoDB database:  {db.name}\n")

    # ── Step 1: Download all images from AWS S3 ─────────────────────────────
    print("Step 1: Downloading images from AWS S3...\n")

    paginator = aws_s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=AWS_S3_BUCKET, Prefix="potholes/")

    downloaded = []  # list of (filename, local_path)
    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if key.endswith("/"):
                continue

            filename = os.path.basename(key)
            local_path = os.path.join(DOWNLOAD_DIR, filename)

            print(f"  Downloading: {filename}")
            aws_s3.download_file(AWS_S3_BUCKET, key, local_path)
            downloaded.append((filename, local_path))

    print(f"\nDownloaded {len(downloaded)} images.\n")

    if not downloaded:
        print("No images found. Exiting.")
        mongo.close()
        return

    _ = input("Press Enter to continue to Step 2 (upload to Supabase Storage)...")

    # ── Step 2: Upload all images to Supabase Storage ───────────────────────
    print("Step 2: Uploading images to Supabase Storage...\n")

    # Map: filename → new Supabase public URL
    url_map: dict[str, str] = {}

    for filename, local_path in downloaded:
        s3_key = f"potholes/{filename}"

        ext = Path(local_path).suffix.lower()
        content_type = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }.get(ext, "image/jpeg")

        print(f"  Uploading: {filename}")
        supabase_s3.upload_file(
            local_path,
            SUPABASE_S3_BUCKET,
            s3_key,
            ExtraArgs={"ContentType": content_type},
        )

        # Public URL format for Supabase Storage
        new_url = (
            f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_S3_BUCKET}/{s3_key}"
        )
        url_map[filename] = new_url

    print(f"\nUploaded {len(url_map)} images.\n")
    _ = input("Press Enter to continue to Step 3 (copy complaints in MongoDB)...")

    # ── Step 3: Copy newcomplaints → prodcomplaints with updated imageUrl ───
    print("Step 3: Copying newcomplaints → prodcomplaints...\n")

    src_collection = db["newcomplaints"]
    dst_collection = db["prodcomplaints"]

    complaints = list(src_collection.find())
    print(f"  Found {len(complaints)} complaints in newcomplaints.")

    inserted = 0
    updated_urls = 0
    for doc in complaints:
        # Remove _id so MongoDB generates a new one
        doc.pop("_id", None)

        old_url = doc.get("imageUrl")
        if old_url:
            # Extract filename from the old AWS URL
            # e.g. https://bucket.s3.region.amazonaws.com/potholes/abc-123.jpg → abc-123.jpg
            old_filename = old_url.rsplit("/", 1)[-1] if "/" in old_url else None
            if old_filename and old_filename in url_map:
                doc["imageUrl"] = url_map[old_filename]
                updated_urls += 1

        dst_collection.insert_one(doc)
        inserted += 1

    print(f"  Inserted {inserted} documents into prodcomplaints.")
    print(f"  Updated imageUrl for {updated_urls} documents.\n")

    # ── Done ────────────────────────────────────────────────────────────────
    mongo.close()
    print("Done! Migration complete.")


if __name__ == "__main__":
    main()
