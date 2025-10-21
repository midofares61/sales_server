# Quick Start Guide - تشغيل السيرفر

## خطوات التشغيل السريع

### 1. التحقق من المتطلبات
```bash
node --version  # يجب أن يكون v16 أو أحدث
mysql --version # يجب أن يكون v8.0 أو أحدث
```

### 2. تثبيت Dependencies
```bash
cd d:\server
npm install
```

### 3. إعداد ملف البيئة
انسخ `.env.example` إلى `.env` وعدّل القيم:
```bash
copy .env.example .env
```

محتوى `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sales_db

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=30d

PORT=3000
NODE_ENV=development
```

### 4. إنشاء قاعدة البيانات وتشغيل Migrations
```bash
npm run db:create
npm run db:migrate
npm run db:seed
```

**أو استخدم أمر واحد:**
```bash
npm run setup
```

### 5. تشغيل السيرفر
```bash
# Development mode (مع auto-reload)
npm run dev

# Production mode
npm start
```

السيرفر سيعمل على: `http://localhost:3000`

### 6. اختبار السيرفر
افتح المتصفح أو Postman وجرّب:
```
GET http://localhost:3000/api/health
```

يجب أن تحصل على:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-16T...",
  "uptime": 123.456
}
```

### 7. تسجيل الدخول
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

## الأوامر المتاحة

### Development
```bash
npm run dev          # تشغيل السيرفر مع nodemon
npm run logs         # عرض جميع اللوجات
npm run logs:error   # عرض لوجات الأخطاء فقط
```

### Database
```bash
npm run db:create         # إنشاء قاعدة البيانات
npm run db:migrate        # تشغيل migrations
npm run db:migrate:undo   # التراجع عن آخر migration
npm run db:seed           # تشغيل seeders
npm run db:seed:undo      # التراجع عن seeders
npm run db:reset          # إعادة تعيين قاعدة البيانات
```

### Production
```bash
npm start            # تشغيل السيرفر في وضع الإنتاج
```

## التحقق من التعديلات الجديدة

### 1. التحقق من الجداول الجديدة
```sql
USE sales_db;
SHOW TABLES;
```

يجب أن ترى:
- `vault`
- `vault_transactions`
- `product_history`
- `mandobe_payments`
- `supplier_orders`
- `supplier_payments`
- `order_codes`

### 2. التحقق من الحقول الجديدة في Orders
```sql
DESCRIBE orders;
```

يجب أن ترى:
- `order_code` (VARCHAR)
- `date_time` (DATETIME)

### 3. التحقق من الحقول الجديدة في Products
```sql
DESCRIBE products;
```

يجب أن ترى:
- `type` (ENUM: gift, mattress, regular)

### 4. التحقق من الحقول الجديدة في Users
```sql
DESCRIBE users;
```

يجب أن ترى:
- `permissions` (JSON)
- `role` يدعم الآن: admin, marketer, mandobe, sales

## اختبار Endpoints الجديدة

### 1. جلب رقم الطلب التالي
```bash
GET http://localhost:3000/api/orders/next-code
Authorization: Bearer <your-token>
```

### 2. إنشاء طلب مع orderCode تلقائي
```bash
POST http://localhost:3000/api/orders
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "customer_name": "Test Customer",
  "phone": "01234567890",
  "city": "Cairo",
  "total": 100,
  "details": []
}
```
سيتم توليد `orderCode` تلقائياً.

### 3. تحديث المخزون
```bash
PUT http://localhost:3000/api/products/1/stock
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "delta": 10,
  "note": "Stock replenishment"
}
```

### 4. عرض تاريخ المخزون
```bash
GET http://localhost:3000/api/products/1/history
Authorization: Bearer <your-token>
```

### 5. إحصائيات الطلبات
```bash
GET http://localhost:3000/api/orders/statistics?month=10&year=2025
Authorization: Bearer <your-token>
```

### 6. تحديث حالة الطلب
```bash
PUT http://localhost:3000/api/orders/1/status
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "status": "accept"
}
```

## استكشاف الأخطاء

### خطأ: Cannot connect to database
**الحل:**
1. تأكد من تشغيل MySQL
2. تحقق من بيانات الاتصال في `.env`
3. تأكد من وجود قاعدة البيانات: `npm run db:create`

### خطأ: JWT_SECRET is required
**الحل:**
أضف `JWT_SECRET` في ملف `.env`

### خطأ: Port 3000 is already in use
**الحل:**
1. غيّر `PORT` في `.env` إلى رقم آخر (مثلاً 3001)
2. أو أوقف العملية التي تستخدم المنفذ 3000

### خطأ: Migration failed
**الحل:**
```bash
npm run db:migrate:undo  # التراجع
npm run db:migrate       # إعادة المحاولة
```

### خطأ: Cannot find module
**الحل:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## الملفات المهمة

- `CHANGES.md` - قائمة بجميع التعديلات المنفذة
- `FLUTTER_INTEGRATION.md` - دليل دمج Flutter الكامل
- `API.md` - توثيق API الأصلي
- `update.md` - المواصفات المطلوبة
- `postman_collection.json` - مجموعة Postman للاختبار

## الخطوات التالية

بعد التشغيل الناجح:

1. ✅ اختبر جميع endpoints الأساسية
2. ✅ تحقق من Socket.io events
3. ✅ اختبر الفلاتر المتقدمة للطلبات
4. ✅ اختبر تحديث المخزون وتاريخه
5. ✅ اختبر refresh token
6. 📱 ابدأ بدمج Flutter app

## دعم فني

إذا واجهت أي مشاكل:
1. تحقق من اللوجات: `npm run logs:error`
2. راجع ملف `CHANGES.md` للتعديلات
3. راجع `FLUTTER_INTEGRATION.md` للتكامل مع Flutter

## ملاحظات مهمة

⚠️ **للإنتاج:**
- غيّر `JWT_SECRET` إلى قيمة عشوائية قوية
- غيّر `NODE_ENV` إلى `production`
- استخدم HTTPS
- فعّل CORS بشكل صحيح
- استخدم قاعدة بيانات منفصلة

✅ **تم إنجازه:**
- ✅ Migration للجداول والحقول الجديدة
- ✅ Models للكيانات الجديدة
- ✅ Auth endpoints (login, refresh, logout)
- ✅ Orders endpoints المحسّنة (فلاتر، إحصائيات، إلخ)
- ✅ Products endpoints (stock, history)
- ✅ Socket.io events محسّنة
- ✅ Field mapping للتوافق مع Flutter
- ✅ Response format موحّد

🔄 **قيد التطوير (اختياري):**
- Vault endpoints
- Marketers extended endpoints
- Mandobes extended endpoints
- Suppliers extended endpoints
- Reports endpoints
- Socket.io rooms ومصادقة
