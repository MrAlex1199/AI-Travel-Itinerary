# ✅ Deployment Checklist

## 📋 ก่อน Deploy

### 1. Environment Variables
- [ ] สร้าง `.env.local` จาก `.env.example`
- [ ] ใส่ `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
- [ ] ใส่ `SUPABASE_SERVICE_ROLE_KEY`
- [ ] ใส่ `GEMINI_API_KEY` หรือ `GOOGLE_AI_API_KEY`
- [ ] สร้าง `NEXTAUTH_SECRET` (ใช้ `openssl rand -base64 32`)
- [ ] ตั้งค่า `NEXTAUTH_URL` สำหรับ production

### 2. Database Setup (Supabase)
- [ ] สร้าง Supabase project
- [ ] รัน SQL schema จาก `lib/db/schema.sql`
- [ ] ตั้งค่า RLS policies
- [ ] ทดสอบ database connection

### 3. AI Service Setup
- [ ] สร้าง Google AI API key
- [ ] ทดสอบ Gemini API
- [ ] ตรวจสอบ quota และ rate limits

### 4. Code Quality
- [ ] รัน `npm run build` สำเร็จ
- [ ] ไม่มี TypeScript errors
- [ ] ไม่มี ESLint warnings
- [ ] ทดสอบ core features ทำงาน

## 🚀 Deploy Process

### Option 1: Vercel CLI (แนะนำ)

```bash
# 1. ติดตั้ง Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Production deploy
vercel --prod
```

### Option 2: PowerShell Script (Windows)

```powershell
# รันสคริปต์ deploy
.\scripts\deploy.ps1
```

### Option 3: Vercel Dashboard

1. เข้า [vercel.com](https://vercel.com)
2. Import Git repository
3. ตั้งค่า environment variables
4. Deploy

## ⚙️ Environment Variables สำหรับ Vercel

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
GEMINI_API_KEY = your_gemini_api_key
GOOGLE_AI_API_KEY = your_gemini_api_key
NEXTAUTH_SECRET = your_secret_key
NEXTAUTH_URL = https://your-app.vercel.app
```

## 🔍 หลัง Deploy

### 1. ทดสอบ Core Features
- [ ] หน้าแรกโหลดได้
- [ ] สมัครสมาชิก/เข้าสู่ระบบ
- [ ] สร้าง itinerary ใหม่
- [ ] ดู history
- [ ] Dark/Light mode toggle

### 2. ตรวจสอบ Performance
- [ ] Page load speed
- [ ] API response times
- [ ] Database queries
- [ ] Error handling

### 3. Security Check
- [ ] Environment variables ไม่ leak
- [ ] API endpoints ป้องกันได้
- [ ] Authentication ทำงาน
- [ ] CORS settings ถูกต้อง

## 🐛 Troubleshooting

### Build Errors
```bash
# ทดสอบ build ในเครื่อง
npm run build

# ดู detailed logs
vercel logs
```

### Environment Variables
```bash
# ดู env vars
vercel env ls

# เพิ่ม env var
vercel env add VARIABLE_NAME
```

### Database Issues
- ตรวจสอบ Supabase connection
- ตรวจสอบ RLS policies
- ดู Supabase logs

### AI API Issues
- ตรวจสอบ API key
- ตรวจสอบ quota
- ดู error messages ใน logs

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)
- [Google AI Studio](https://makersuite.google.com/)

---

**หมายเหตุ:** อย่าลืมเปลี่ยน `NEXTAUTH_URL` เป็น production URL หลัง deploy เสร็จ!