# ⚡ Quick Deploy Guide

## 🚀 Deploy ใน 5 นาที

### 1. เตรียม Environment Variables

```bash
# คัดลอกไฟล์ template
cp .env.example .env.local

# แก้ไขค่าใน .env.local
# - SUPABASE_URL และ SUPABASE_ANON_KEY จาก Supabase dashboard
# - GEMINI_API_KEY จาก Google AI Studio
# - NEXTAUTH_SECRET (สร้างใหม่ด้วย: openssl rand -base64 32)
```

### 2. ทดสอบ Build

```bash
npm install
npm run pre-deploy
```

### 3. Deploy บน Vercel

#### วิธีที่ 1: ใช้ Script (Windows)
```powershell
.\scripts\deploy.ps1
```

#### วิธีที่ 2: ใช้ npm scripts
```bash
# Preview deployment
npm run deploy

# Production deployment  
npm run deploy:prod
```

#### วิธีที่ 3: Manual
```bash
npx vercel
```

### 4. ตั้งค่า Environment Variables ใน Vercel

```bash
# เพิ่ม env vars ทีละตัว
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### 5. ทดสอบ Production

- เข้าไปที่ URL ที่ Vercel ให้มา
- ทดสอบสมัครสมาชิก/เข้าสู่ระบบ
- ทดสอบสร้าง itinerary
- ทดสอบ dark mode toggle

## 🔧 คำสั่งที่มีประโยชน์

```bash
# ดู deployment status
vercel ls

# ดู logs
vercel logs

# Rollback
vercel rollback

# เปิด deployment ใน browser
vercel open
```

## ⚠️ สิ่งที่ต้องระวัง

1. **NEXTAUTH_URL** ต้องเป็น production URL (https://your-app.vercel.app)
2. **API Keys** ห้าม commit ใน Git
3. **Supabase RLS** ต้องตั้งค่าให้ถูกต้อง
4. **Environment Variables** ต้องตั้งค่าใน Vercel Dashboard

## 🆘 หากมีปัญหา

1. ดู logs: `vercel logs`
2. ตรวจสอบ env vars: `vercel env ls`
3. ทดสอบ build ในเครื่อง: `npm run build`
4. ตรวจสอบ Supabase connection

---

**เสร็จแล้ว!** 🎉 เว็บไซต์ของคุณพร้อมใช้งานแล้ว