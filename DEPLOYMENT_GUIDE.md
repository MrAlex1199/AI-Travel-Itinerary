# 🚀 คู่มือการ Deploy บน Vercel

## 📋 เตรียมความพร้อมก่อน Deploy

### 1. ตรวจสอบไฟล์ที่จำเป็น

```bash
# ตรวจสอบว่ามีไฟล์เหล่านี้
ls -la
```

ไฟล์ที่ต้องมี:
- `package.json` - dependencies และ scripts
- `next.config.js` - Next.js configuration
- `.env.example` - ตัวอย่าง environment variables
- `README.md` - คำอธิบายโปรเจค

### 2. ตรวจสอบ Environment Variables

สร้างไฟล์ `.env.local` สำหรับ development:

```bash
# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Service (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_AI_API_KEY=your_gemini_api_key

# App Settings
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. ทดสอบ Build ในเครื่อง

```bash
# ติดตั้ง dependencies
npm install

# ทดสอบ build
npm run build

# ทดสอบ production mode
npm start
```

## 🌐 ขั้นตอนการ Deploy บน Vercel

### วิธีที่ 1: Deploy ผ่าน Vercel CLI (แนะนำ)

#### 1. ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login เข้า Vercel

```bash
vercel login
```

#### 3. Deploy โปรเจค

```bash
# ใน root directory ของโปรเจค
vercel

# หรือสำหรับ production deploy
vercel --prod
```

#### 4. ตั้งค่า Environment Variables

```bash
# เพิ่ม environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GEMINI_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# หรือใช้ไฟล์ .env
vercel env pull .env.local
```

### วิธีที่ 2: Deploy ผ่าน Vercel Dashboard

#### 1. เข้าไปที่ [vercel.com](https://vercel.com)

#### 2. เชื่อมต่อ Git Repository
- คลิก "New Project"
- เลือก Git provider (GitHub, GitLab, Bitbucket)
- เลือก repository ของโปรเจค

#### 3. ตั้งค่า Build Settings
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 4. เพิ่ม Environment Variables
ใน Settings > Environment Variables เพิ่ม:

```
SUPABASE_URL = your_supabase_url
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
GEMINI_API_KEY = your_gemini_api_key
NEXTAUTH_SECRET = your_nextauth_secret
NEXTAUTH_URL = https://your-app.vercel.app
```

#### 5. Deploy
คลิก "Deploy" และรอให้ build เสร็จ

## ⚙️ การตั้งค่าเพิ่มเติม

### 1. Custom Domain (ถ้าต้องการ)

```bash
# เพิ่ม custom domain
vercel domains add yourdomain.com
```

### 2. ตั้งค่า Redirects (ถ้าจำเป็น)

สร้างไฟล์ `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 3. ตั้งค่า Analytics (ถ้าต้องการ)

```bash
# เปิดใช้ Vercel Analytics
vercel analytics enable
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Build Error

```bash
# ตรวจสอบ logs
vercel logs

# ทดสอบ build ในเครื่อง
npm run build
```

### 2. Environment Variables ไม่ทำงาน

```bash
# ตรวจสอบ env vars
vercel env ls

# ดึง env vars มาดู
vercel env pull
```

### 3. Database Connection Error

- ตรวจสอบ Supabase URL และ Keys
- ตรวจสอบ IP whitelist ใน Supabase (ถ้ามี)
- ตรวจสอบ RLS policies

### 4. API Routes ไม่ทำงาน

- ตรวจสอบ file structure ใน `app/api/`
- ตรวจสอบ export functions (GET, POST, etc.)
- ดู Network tab ใน Developer Tools

## 📊 การ Monitor และ Maintenance

### 1. ตรวจสอบ Performance

```bash
# ดู analytics
vercel analytics

# ตรวจสอบ logs
vercel logs --follow
```

### 2. การ Update

```bash
# Deploy version ใหม่
git push origin main

# หรือ manual deploy
vercel --prod
```

### 3. Rollback (ถ้าจำเป็น)

```bash
# ดู deployment history
vercel ls

# rollback ไป deployment ก่อนหน้า
vercel rollback [deployment-url]
```

## 🔐 Security Checklist

- [ ] Environment variables ไม่ได้ commit ใน Git
- [ ] NEXTAUTH_SECRET ใช้ค่าที่ปลอดภัย
- [ ] Supabase RLS policies ตั้งค่าถูกต้อง
- [ ] API keys มีสิทธิ์เฉพาะที่จำเป็น
- [ ] CORS settings ถูกต้อง

## 🚀 คำสั่งสำคัญ

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# ดู deployments
vercel ls

# ดู logs
vercel logs

# ตั้งค่า env
vercel env add [name]

# ลบ deployment
vercel rm [deployment-url]
```

## 📞 การขอความช่วยเหลือ

หากพบปัญหา:
1. ตรวจสอบ [Vercel Documentation](https://vercel.com/docs)
2. ดู logs ใน Vercel Dashboard
3. ตรวจสอบ GitHub Issues
4. ติดต่อ Vercel Support

---

**หมายเหตุ:** อย่าลืมเปลี่ยน `NEXTAUTH_URL` เป็น URL จริงของ production site หลังจาก deploy เสร็จแล้ว