# 🚀 Render Deployment Guide

دليل شامل لنشر المشروع على Render مع تفعيل Keep-Alive

---

## 📋 الخطوات السريعة

### 1. إنشاء حساب على Render
1. اذهب إلى [render.com](https://render.com/)
2. سجل باستخدام GitHub
3. اربط حساب GitHub الخاص بك

### 2. إنشاء MySQL Database
1. من Dashboard اضغط على **New** → **MySQL**
2. اختر اسم للـ Database (مثلاً: `sales-db`)
3. اختر الخطة المجانية
4. اضغط **Create Database**
5. انتظر حتى يتم إنشاء الـ Database (قد يستغرق دقيقتين)
6. احفظ معلومات الاتصال:
   - Host (Internal Database URL)
   - Database Name
   - Username
   - Password

### 3. إنشاء Web Service
1. من Dashboard اضغط على **New** → **Web Service**
2. اربط الـ Repository من GitHub
3. املأ البيانات:
   - **Name**: اسم التطبيق (مثلاً: `sales-server`)
   - **Environment**: `Node`
   - **Region**: اختر أقرب منطقة
   - **Branch**: `main` أو `master`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 4. إضافة Environment Variables
في قسم **Environment Variables**، أضف المتغيرات التالية:

```env
# Database Configuration (من الخطوة 2)
DB_HOST=<your-database-internal-url>
DB_PORT=3306
DB_USER=<your-database-username>
DB_PASSWORD=<your-database-password>
DB_NAME=<your-database-name>

# JWT Configuration
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRES_IN=30d

# Server Configuration
NODE_ENV=production
PORT=10000

# Keep-Alive Configuration
SERVER_URL=<will-be-filled-after-deployment>
KEEP_ALIVE_PING_INTERVAL=10
```

**ملاحظة:** اترك `SERVER_URL` فارغاً الآن، سنضيفه بعد أول نشر

### 5. إضافة Build Command للـ Database Setup
في **Build Command**، غيّر من:
```bash
npm install
```

إلى:
```bash
npm install && npm run db:migrate && npm run db:seed
```

هذا سيقوم بتشغيل Migrations و Seeders تلقائياً

### 6. النشر
1. اضغط **Create Web Service**
2. انتظر حتى ينتهي الـ Build (5-10 دقائق)
3. بعد النشر، ستحصل على رابط مثل: `https://sales-server-abc123.onrender.com`

### 7. تفعيل Keep-Alive
1. انسخ رابط التطبيق من الخطوة 6
2. اذهب إلى **Environment** في Dashboard
3. أضف/عدل المتغير `SERVER_URL`:
   ```env
   SERVER_URL=https://sales-server-abc123.onrender.com
   ```
4. احفظ التغييرات
5. Render سيعيد تشغيل التطبيق تلقائياً

---

## ✅ التحقق من النشر

### 1. اختبار Health Endpoint
افتح في المتصفح:
```
https://your-app.onrender.com/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "...",
  "keepAlive": {
    "enabled": true,
    "serverUrl": "https://your-app.onrender.com",
    "pingIntervalMinutes": 10
  }
}
```

### 2. التحقق من Logs
1. اذهب إلى Dashboard → Your App → **Logs**
2. ابحث عن:
```
✅ Keep-Alive service started
🏓 Keep-Alive ping successful
```

### 3. اختبار Login
```bash
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01000000000",
    "password": "admin123"
  }'
```

---

## 🔧 الإعدادات المتقدمة

### تعطيل Auto-Deploy
إذا أردت التحكم اليدوي في النشر:
1. اذهب إلى **Settings**
2. اختر **Auto-Deploy: No**

### إضافة Custom Domain
1. اذهب إلى **Settings** → **Custom Domains**
2. أضف Domain الخاص بك
3. اتبع التعليمات لإعداد DNS

### تفعيل Health Check Ping
Render يدعم Health Check تلقائياً:
1. اذهب إلى **Settings** → **Health Check**
2. أضف: `/api/health`
3. هذا سيجعل Render يراقب صحة التطبيق

---

## 🛠️ حل المشاكل الشائعة

### المشكلة 1: Build فشل
**الأعراض:**
```
Error: Cannot find module 'xyz'
```

**الحل:**
1. تأكد من أن الـ package موجود في `package.json`
2. جرب مسح `node_modules` و `package-lock.json` محلياً
3. أعد push الكود

### المشكلة 2: Database Connection فشل
**الأعراض:**
```
Error: ECONNREFUSED or Authentication failed
```

**الحل:**
1. تأكد من استخدام **Internal Database URL** وليس External
2. تحقق من صحة Username و Password
3. تأكد من أن Database في نفس Region الخاص بالـ Web Service

### المشكلة 3: Migrations لا تعمل
**الأعراض:**
```
Table doesn't exist
```

**الحل:**
1. اذهب إلى **Shell** في Dashboard
2. شغل يدوياً:
```bash
npm run db:migrate
npm run db:seed
```

### المشكلة 4: Keep-Alive لا يعمل
**الأعراض:**
- لا توجد رسائل Ping في الـ Logs
- السيرفر ينام بعد 15 دقيقة

**الحل:**
1. تأكد من وجود `SERVER_URL` في Environment Variables
2. تأكد من صحة الرابط (يجب أن يبدأ بـ `https://`)
3. راجع الـ Logs للأخطاء
4. جرب إعادة تشغيل السيرفر

### المشكلة 5: التطبيق بطيء في أول طلب
**السبب:** Render free tier ينام السيرفر بعد 15 دقيقة

**الحل:**
1. تأكد من تفعيل Keep-Alive (راجع KEEP_ALIVE.md)
2. استخدم UptimeRobot للمراقبة الخارجية

---

## 📊 مراقبة الأداء

### Render Metrics
Render يوفر Metrics مجانية:
1. اذهب إلى Dashboard → Your App → **Metrics**
2. راقب:
   - CPU Usage
   - Memory Usage
   - Response Time
   - Request Count

### استخدام UptimeRobot (مجاني)
1. سجل في [uptimerobot.com](https://uptimerobot.com/)
2. أضف Monitor جديد:
   - Type: HTTP(s)
   - URL: `https://your-app.onrender.com/api/ping`
   - Interval: 5 minutes
3. فعّل Email Alerts

### Logs في الوقت الفعلي
```bash
# من Terminal (يتطلب Render CLI)
render logs -f
```

---

## 💰 حدود الخطة المجانية

### Web Service Free Tier
- ✅ 750 ساعة/شهر (كافية لشهر كامل مع Keep-Alive)
- ✅ ينام بعد 15 دقيقة بدون طلبات (يحل بـ Keep-Alive)
- ✅ يستيقظ تلقائياً عند الطلب
- ⚠️ RAM: 512 MB
- ⚠️ CPU: مشترك

### MySQL Database Free Tier
- ✅ 1 GB Storage
- ✅ 1 Database
- ⚠️ 90 يوم بعدها تنحذف (backup دائماً!)

---

## 🔐 أفضل الممارسات الأمنية

### 1. JWT Secret قوي
```bash
# استخدم أداة لتوليد Secret قوي
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. لا تضع Secrets في الكود
- استخدم Environment Variables دائماً
- لا تضع `.env` في Git

### 3. تفعيل Rate Limiting
أضف في `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // 100 طلب لكل IP
});

app.use('/api', limiter);
```

### 4. CORS Configuration
تأكد من تحديد Origins المسموح بها:
```javascript
app.use(cors({
  origin: ['https://your-frontend.com'],
  credentials: true
}));
```

---

## 🔄 تحديث التطبيق

### Auto-Deploy (الافتراضي)
أي push على GitHub سيؤدي إلى:
1. Build تلقائي
2. Deploy تلقائي
3. Restart تلقائي

### Manual Deploy
1. اذهب إلى Dashboard → Your App
2. اضغط **Manual Deploy**
3. اختر Branch
4. اضغط **Deploy**

### Rollback لنسخة سابقة
1. اذهب إلى **Events**
2. اختر Deploy سابق
3. اضغط **Rollback to this version**

---

## 📦 Backup Strategy

### Database Backup
```bash
# من Render Shell
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup.sql
```

### تنزيل Backup
1. استخدم Render Shell
2. أو استخدم MySQL Client خارجي مع External Database URL

### Automated Backups
Render لا يوفر Automated Backups في Free Tier
- نصيحة: استخدم Cron Job لعمل Backup دوري لـ Google Drive أو Dropbox

---

## 🎯 الخطوات التالية

1. ✅ تأكد من عمل Keep-Alive
2. ✅ راقب الـ Logs للأخطاء
3. ✅ اختبر جميع الـ Endpoints
4. ✅ أضف Domain مخصص (اختياري)
5. ✅ ثبت UptimeRobot للمراقبة
6. ✅ اعمل Backup للـ Database بشكل دوري

---

## 📞 الدعم

### Render Support
- [Render Docs](https://render.com/docs)
- [Community Forum](https://community.render.com/)
- [Status Page](https://status.render.com/)

### المشروع
- راجع `KEEP_ALIVE.md` لمزيد من التفاصيل
- راجع `README.md` للـ API Documentation
- افتح Issue على GitHub للمشاكل

---

**آخر تحديث:** أكتوبر 2024
**النسخة:** 1.0.0
