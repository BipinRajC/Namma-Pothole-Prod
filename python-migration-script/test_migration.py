#!/usr/bin/env python3
"""
Quick test script to validate the migration setup.
This checks your configuration without actually migrating images.
"""

import os
import sys
from dotenv import load_dotenv
import boto3
from pymongo import MongoClient

# Load environment variables
load_dotenv()


def test_configuration():
    """Test all required configurations."""
    print("🧪 Testing Migration Configuration\n")
    print("=" * 80)

    # Test 1: Environment Variables
    print("\n1️⃣  Checking Environment Variables...")
    required_vars = {
        "AWS_ACCESS_KEY": os.getenv("AWS_ACCESS_KEY"),
        "AWS_SECRET_KEY": os.getenv("AWS_SECRET_KEY"),
        "AWS_S3_BUCKET": os.getenv("AWS_S3_BUCKET"),
        "MONGODB_URI": os.getenv("MONGODB_URI"),
    }

    missing = []
    for var, value in required_vars.items():
        if not value:
            missing.append(var)
            print(f"   ❌ {var}: NOT SET")
        else:
            masked = value[:10] + "..." if len(value) > 10 else value
            print(f"   ✅ {var}: {masked}")

    if missing:
        print(f"\n❌ Missing required variables: {', '.join(missing)}")
        return False

    # Test 2: Private S3 Connection
    print("\n2️⃣  Testing Private S3 Connection...")
    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
            region_name=os.getenv("AWS_S3_BUCKET_REGION", "eu-north-1"),
        )

        bucket = os.getenv("AWS_S3_BUCKET")
        response = s3_client.list_objects_v2(
            Bucket=bucket, Prefix="potholes/", MaxKeys=1
        )

        count = response.get("KeyCount", 0)
        print(f"   ✅ Connected to private bucket: {bucket}")
        print(f"   ℹ️  Found {count} object(s) in potholes/ folder")

    except Exception as e:
        print(f"   ❌ Failed to connect to private S3: {e}")
        return False

    # Test 3: Public S3 Connection
    print("\n3️⃣  Testing Public S3 Connection...")
    try:
        public_s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
            region_name="ap-south-1",
        )

        public_bucket = "potholes-prod"
        public_s3.head_bucket(Bucket=public_bucket)
        print(f"   ✅ Connected to public bucket: {public_bucket}")

    except Exception as e:
        print(f"   ❌ Failed to connect to public S3: {e}")
        return False

    # Test 4: MongoDB Connection
    print("\n4️⃣  Testing MongoDB Connection...")
    try:
        mongo_client = MongoClient(
            os.getenv("MONGODB_URI"), serverSelectionTimeoutMS=5000
        )
        db = mongo_client.get_database()

        # Test connection
        mongo_client.server_info()

        # Check collections
        complaints_count = db["complaints"].count_documents({})
        print(f"   ✅ Connected to MongoDB database: {db.name}")
        print(f"   ℹ️  Found {complaints_count} documents in 'complaints' collection")

        # Check if complaintsPublic exists
        if "complaintsPublic" in db.list_collection_names():
            public_count = db["complaintsPublic"].count_documents({})
            print(
                f"   ℹ️  'complaintsPublic' collection exists with {public_count} documents"
            )
        else:
            print(f"   ℹ️  'complaintsPublic' collection will be created")

        mongo_client.close()

    except Exception as e:
        print(f"   ❌ Failed to connect to MongoDB: {e}")
        return False

    # Test 5: Python Dependencies
    print("\n5️⃣  Checking Python Dependencies...")
    try:
        import PIL
        import pymongo
        import boto3

        print(f"   ✅ Pillow (PIL): {PIL.__version__}")
        print(f"   ✅ pymongo: {pymongo.__version__}")
        print(f"   ✅ boto3: {boto3.__version__}")

    except ImportError as e:
        print(f"   ❌ Missing dependency: {e}")
        return False

    # All tests passed
    print("\n" + "=" * 80)
    print("✅ All configuration tests passed!")
    print("=" * 80)
    print("\nYou're ready to run the migration:")
    print("  python3 migrate_images.py")
    print("\nOr use the quick-start script:")
    print("  ./run_migration.sh")
    print()

    return True


if __name__ == "__main__":
    success = test_configuration()
    sys.exit(0 if success else 1)
