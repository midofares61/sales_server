# Keep-Alive Configuration Guide

## نظرة عامة

تم إضافة نظام Keep-Alive للمشروع لمنع السيرفر من الدخول في وضع Sleep على منصات الاستضافة المجانية مثل Render.

### المشكلة
منصة Render (في الخطة المجانية) توقف السيرفر بعد **15 دقيقة** من عدم وجود طلبات HTTP. عندما يدخل السيرفر في وضع Sleep:
- يتوقف الـ API عن الاستجابة
- تنقطع اتصالات Socket.io
- يحتاج السيرفر إلى 30-60 ثانية للعودة للعمل عند الطلب التالي

### الحل
تم إنشاء نظام Keep-Alive داخلي يقوم بإرسال طلبات HTTP دورية للسيرفر نفسه كل **10 دقائق** لإبقائه نشطاً دائماً.

---

## 🚀 التفعيل السريع

### الخطوة 1: إعداد المتغيرات البيئية
أضف المتغيرات التالية إلى ملف `.env` أو إعدادات Render:

```env
# رابط السيرفر الخاص بك على Render
SERVER_URL=https://your-app.onrender.com

# المدة بين كل Ping بالدقائق (اختياري - الافتراضي: 10)
KEEP_ALIVE_PING_INTERVAL=10
```

### الخطوة 2: رفع التحديثات على Render
```bash
git add .
git commit -m "Add Keep-Alive service"
git push
```

### الخطوة 3: تحديث Environment Variables على Render
1. اذهب إلى Dashboard > Your App > Environment
2. أضف المتغير `SERVER_URL` مع رابط التطبيق الخاص بك
3. احفظ التغييرات وانتظر إعادة تشغيل السيرفر

---

## 📋 كيف يعمل النظام؟

### 1. Health Check Endpoints
تم إضافة 3 endpoints جديدة:

#### `/api/health`
يعطي معلومات تفصيلية عن حالة السيرفر:
```json
{
  "status": "ok",
  "timestamp": "2024-10-23T15:30:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  },
  "keepAlive": {
    "enabled": true,
    "serverUrl": "https://your-app.onrender.com",
    "pingIntervalMinutes": 10,
    "nextPingIn": "10 minutes"
  }
}
```

#### `/api/ping`
نسخة أخف وأسرع للـ health check:
```json
{
  "status": "ok",
  "timestamp": "2024-10-23T15:30:00.000Z"
}
```

#### `/api/keepalive/status`
يعطي حالة خدمة Keep-Alive فقط:
```json
{
  "enabled": true,
  "serverUrl": "https://your-app.onrender.com",
  "pingIntervalMinutes": 10,
  "nextPingIn": "10 minutes"
}
```

### 2. Keep-Alive Service
- يتم تشغيله تلقائياً عند بدء السيرفر (إذا كان `SERVER_URL` موجود)
- يرسل طلب GET إلى `/api/health` كل 10 دقائق (افتراضياً)
- يسجل النتائج في Console logs مع وقت الاستجابة

### 3. Logs
عند تشغيل السيرفر، ستشاهد:
```
Server listening on port 3000
🔄 Keep-Alive service activated for: https://your-app.onrender.com
✅ Keep-Alive service started - Pinging https://your-app.onrender.com every 10 minutes
🏓 Keep-Alive ping successful - Response time: 45ms - Status: 200
```

---

## ⚙️ الإعدادات المتقدمة

### تغيير فترة الـ Ping
لتغيير المدة بين كل Ping (الافتراضي: 10 دقائق):

```env
KEEP_ALIVE_PING_INTERVAL=5  # سيرسل Ping كل 5 دقائق
```

**ملاحظة:** لا تجعل الفترة أقل من 5 دقائق لتجنب الضغط على السيرفر.

### تعطيل Keep-Alive
لتعطيل الخدمة، قم بإزالة أو تعليق المتغير `SERVER_URL`:

```env
# SERVER_URL=https://your-app.onrender.com
```

ستشاهد في الـ logs:
```
ℹ️ Keep-Alive service disabled (SERVER_URL not set)
```

---

## 🔍 التحقق من عمل النظام

### 1. عبر Browser
زر أي من الـ endpoints:
- `https://your-app.onrender.com/api/health`
- `https://your-app.onrender.com/api/ping`
- `https://your-app.onrender.com/api/keepalive/status`

### 2. عبر Render Logs
اذهب إلى Dashboard > Your App > Logs وابحث عن:
```
🏓 Keep-Alive ping successful
```

### 3. عبر Monitoring Tools
يمكنك استخدام أدوات خارجية مثل:
- [UptimeRobot](https://uptimerobot.com/) (مجاني)
- [StatusCake](https://www.statuscake.com/)
- [Pingdom](https://www.pingdom.com/)

ضع رابط `/api/ping` في هذه الأدوات للمراقبة الخارجية.

---

## 📊 الفوائد

### ✅ مع Keep-Alive
- السيرفر يبقى نشط 24/7
- Socket.io connections تبقى متصلة
- استجابة فورية للطلبات
- تجربة مستخدم أفضل

### ❌ بدون Keep-Alive
- السيرفر ينام بعد 15 دقيقة
- انتظار 30-60 ثانية لأول طلب بعد Sleep
- انقطاع Socket.io connections
- تجربة مستخدم سيئة

---

## 🛠️ استكشاف الأخطاء

### المشكلة: Keep-Alive لا يعمل
**الحل:**
1. تأكد من وجود `SERVER_URL` في Environment Variables
2. تأكد من صحة الرابط (يجب أن يحتوي على `https://`)
3. راجع الـ logs على Render

### المشكلة: Ping يفشل
**الحل:**
1. تحقق من أن `/api/health` endpoint يعمل
2. تأكد من عدم وجود مشاكل في الـ Database connection
3. راجع الـ error logs

### المشكلة: السيرفر لا يزال ينام
**الحل:**
1. تأكد من أن `KEEP_ALIVE_PING_INTERVAL` أقل من 15 دقيقة
2. تحقق من أن الـ Ping يعمل بنجاح في الـ logs
3. جرب تقليل الفترة إلى 5 دقائق

---

## 📁 الملفات المضافة/المعدلة

### ملفات جديدة:
- `src/services/keepAlive.service.js` - خدمة Keep-Alive الرئيسية
- `src/routes/health.routes.js` - Health check endpoints
- `KEEP_ALIVE.md` - هذا الملف

### ملفات معدلة:
- `src/server.js` - إضافة تفعيل Keep-Alive
- `src/routes/index.js` - إضافة health routes
- `src/config/index.js` - إضافة متغيرات Keep-Alive
- `.env.example` - إضافة أمثلة للمتغيرات

---

## 💡 نصائح إضافية

### للإنتاج (Production)
- استخدم Render أو أي منصة استضافة موثوقة
- فعّل HTTPS دائماً
- راقب الـ logs بانتظام
- استخدم أداة monitoring خارجية

### للتطوير (Development)
- لا حاجة لتفعيل Keep-Alive محلياً
- اترك `SERVER_URL` فارغ في `.env` المحلي

### للتوفير
- في حالة عدم الحاجة للسيرفر 24/7، يمكنك تعطيل Keep-Alive
- Render free tier يعطيك 750 ساعة شهرياً (كافية لشهر كامل)

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع الـ logs على Render
2. تحقق من Health check endpoints
3. راجع هذا الملف للحلول

---

**تم التحديث:** أكتوبر 2024
**الإصدار:** 1.0.0
