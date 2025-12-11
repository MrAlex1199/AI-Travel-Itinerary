#!/bin/bash

# 🚀 AI Travel Itinerary - Deploy Script
# ใช้สำหรับ deploy บน Vercel

echo "🚀 Starting deployment process..."

# ตรวจสอบว่าอยู่ใน root directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# ตรวจสอบว่ามี Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# ตรวจสอบว่า login แล้วหรือยัง
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# ทดสอบ build ก่อน deploy
echo "🔨 Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# ถาม user ว่าต้องการ deploy แบบไหน
echo "🤔 Choose deployment type:"
echo "1) Preview deployment (for testing)"
echo "2) Production deployment"
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "🚀 Deploying to preview..."
        vercel
        ;;
    2)
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📊 You can check your deployment at: https://vercel.com/dashboard"
else
    echo "❌ Deployment failed. Please check the logs above."
    exit 1
fi