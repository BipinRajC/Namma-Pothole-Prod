#!/bin/bash

# Image Migration Quick Start Script
# This script helps you set up and run the image migration process

set -e

echo "🚀 Image Migration Setup & Execution"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python 3 found: $(python3 --version)${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create a .env file with the required configuration."
    echo "You can copy from env.example and fill in your values:"
    echo "  cp env.example .env"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Check if PUBLIC_AWS_S3_BUCKET is configured
if ! grep -q "PUBLIC_AWS_S3_BUCKET=" .env || grep -q "PUBLIC_AWS_S3_BUCKET=$" .env; then
    echo -e "${YELLOW}⚠️  Warning: PUBLIC_AWS_S3_BUCKET is not configured in .env${NC}"
    echo "Please add your public S3 bucket name to .env file:"
    echo "  PUBLIC_AWS_S3_BUCKET=your-public-bucket-name"
    echo ""
    read -p "Do you want to continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install/update Python dependencies
echo "📦 Checking Python dependencies..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing/updating requirements..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check if downloaded_images directory exists and ask to clean
if [ -d "downloaded_images" ]; then
    echo -e "${YELLOW}⚠️  Found existing downloaded_images directory${NC}"
    read -p "Do you want to clean it before starting? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf downloaded_images
        echo -e "${GREEN}✅ Cleaned downloaded_images directory${NC}"
    fi
    echo ""
fi

# Display important information
echo "📋 Important Notes:"
echo "==================="
echo "1. Make sure you're running this in a GUI environment (to display images)"
echo "2. You'll be prompted to approve each image manually"
echo "3. Type 'yes' to upload an image, 'no' to skip it"
echo "4. The script does NOT modify the original 'complaints' collection"
echo "5. Press Ctrl+C at any time to stop the process safely"
echo ""

# Confirm before running
read -p "Ready to start the migration process? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting migration process..."
echo "================================"
echo ""

# Run the migration script
python3 migrate_images.py

# Deactivate virtual environment
deactivate

echo ""
echo "✅ Script execution completed!"
echo ""

# Ask if user wants to clean up downloaded images
if [ -d "downloaded_images" ]; then
    echo "The downloaded_images directory still exists."
    read -p "Do you want to remove it now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf downloaded_images
        echo -e "${GREEN}✅ Removed downloaded_images directory${NC}"
    else
        echo "Downloaded images preserved in: ./downloaded_images/"
    fi
fi

echo ""
echo "🎉 All done!"

