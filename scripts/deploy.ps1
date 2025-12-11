# 🚀 AI Travel Itinerary - Deploy Script (PowerShell)
# ใช้สำหรับ deploy บน Vercel

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# ตรวจสอบว่าอยู่ใน root directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# ตรวจสอบว่ามี Vercel CLI
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# ตรวจสอบว่า login แล้วหรือยัง
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow
try {
    vercel whoami | Out-Null
    Write-Host "✅ Already logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "Please login to Vercel:" -ForegroundColor Yellow
    vercel login
}

# ทดสอบ build ก่อน deploy
Write-Host "🔨 Testing build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# ถาม user ว่าต้องการ deploy แบบไหน
Write-Host "🤔 Choose deployment type:" -ForegroundColor Cyan
Write-Host "1) Preview deployment (for testing)" -ForegroundColor White
Write-Host "2) Production deployment" -ForegroundColor White
$choice = Read-Host "Enter your choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Deploying to preview..." -ForegroundColor Yellow
        vercel
    }
    "2" {
        Write-Host "🚀 Deploying to production..." -ForegroundColor Yellow
        vercel --prod
    }
    default {
        Write-Host "❌ Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host "📊 You can check your deployment at: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed. Please check the logs above." -ForegroundColor Red
    exit 1
}