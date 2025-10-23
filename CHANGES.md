# Server Changes for Flutter Integration

## آخر التحديثات 🆕

### Keep-Alive Service (أكتوبر 2024)
- ✅ إضافة نظام Keep-Alive كامل لمنع السيرفر من النوم على Render
- ✅ إنشاء `keepAlive.service.js` - خدمة داخلية ترسل Ping تلقائياً كل 10 دقائق
- ✅ إضافة 3 health check endpoints:
  - `GET /api/health` - معلومات تفصيلية عن السيرفر
  - `GET /api/ping` - ping سريع
  - `GET /api/keepalive/status` - حالة Keep-Alive
- ✅ تحديث `server.js` لتفعيل Keep-Alive تلقائياً
- ✅ إضافة متغيرات بيئية: `SERVER_URL` و `KEEP_ALIVE_PING_INTERVAL`
- ✅ إنشاء توثيق شامل:
  - `KEEP_ALIVE.md` - دليل الإعداد والاستخدام
  - `RENDER_DEPLOYMENT.md` - دليل النشر على Render

**الفوائد:**
- السيرفر يبقى نشط 24/7 بدون انقطاع
- Socket.io connections تبقى متصلة
- استجابة فورية للطلبات
- تجربة مستخدم محسّنة

---

## تم إنجازه ✅

### 1. Database Schema Updates
- ✅ إضافة حقل `order_code` لجدول Orders (فريد ومفهرس)
- ✅ إضافة حقل `date_time` لجدول Orders (مفهرس)
- ✅ إضافة حقل `type` لجدول Products (enum: gift, mattress, regular)
- ✅ إضافة حقل `permissions` (JSON) لجدول Users
- ✅ تحديث role enum في Users لإضافة 'sales'
- ✅ إنشاء جدول `vault` للخزنة
- ✅ إنشاء جدول `vault_transactions` لمعاملات الخزنة
- ✅ إنشاء جدول `product_history` لتتبع المخزون
- ✅ إنشاء جدول `mandobe_payments` لمدفوعات المندوبين
- ✅ إنشاء جدول `supplier_orders` لطلبات الموردين
- ✅ إنشاء جدول `supplier_payments` لمدفوعات الموردين
- ✅ إنشاء جدول `order_codes` للترقيم المتسلسل

### 2. Models Updates
- ✅ تحديث `Order` model بحقول orderCode و dateTime
- ✅ تحديث `User` model بحقول permissions و sales role
- ✅ تحديث `Product` model بحقل type
- ✅ إنشاء models جديدة:
  - Vault
  - VaultTransaction
  - ProductHistory
  - MandobePayment
  - SupplierOrder
  - SupplierPayment
  - OrderCode
- ✅ إضافة جميع العلاقات (associations) المطلوبة

### 3. Authentication Endpoints
- ✅ `POST /api/auth/login` - تحديث لإرجاع refreshToken و permissions
- ✅ `POST /api/auth/refresh` - جديد: تجديد access token
- ✅ `POST /api/auth/logout` - جديد: تسجيل خروج

### 4. Orders Endpoints
#### تحديثات موجودة:
- ✅ `GET /api/orders` - إضافة فلاتر متقدمة:
  - status, city, mandobe_id, marketer_id, sells
  - dateFrom, dateTo (تصفية بالتاريخ)
  - sort (dateTime_asc, dateTime_desc)
  - البحث في order_code أيضاً
- ✅ `POST /api/orders` - دعم التوليد التلقائي لـ orderCode
- ✅ تحديث mapping للحقول (orderCode, dateTime)

#### Endpoints جديدة:
- ✅ `GET /api/orders/:id` - جلب طلب واحد
- ✅ `PUT /api/orders/:id/status` - تحديث حالة الطلب
- ✅ `PUT /api/orders/:id/mandobe` - تحديث المندوب
- ✅ `PUT /api/orders/:id/payment` - تحديث حالة عمولة المسوق
- ✅ `GET /api/orders/statistics` - إحصائيات الطلبات
- ✅ `GET /api/orders/next-code` - جلب رقم الطلب التالي

### 5. Response Format
- ✅ جميع الردود تتبع الصيغة الموحدة:
  ```json
  {
    "success": true/false,
    "data": {},
    "message": "...",
    "timestamp": "ISO8601"
  }
  ```

## قيد التنفيذ 🔄

### Products Endpoints (التالي)
- ⏳ `PUT /api/products/:id/stock` - تحديث المخزون
- ⏳ `GET /api/products/:id/history` - تاريخ تغييرات المخزون

### Vault Endpoints
- ⏳ `GET /api/vault/balance`
- ⏳ `GET /api/vault/transactions`
- ⏳ `POST /api/vault/transactions`
- ⏳ `GET /api/vault/statistics`

### Marketers Endpoints
- ⏳ `GET /api/marketers/:id/orders`
- ⏳ `GET /api/marketers/:id/commissions`
- ⏳ `PUT /api/marketers/:id/commissions/:orderId`
- ⏳ `GET /api/marketers/:id/statistics`

### Mandobes Endpoints
- ⏳ `GET /api/mandobes/:id/orders`
- ⏳ `GET /api/mandobes/:id/statistics`
- ⏳ `GET /api/mandobes/:id/account`
- ⏳ `GET /api/mandobes/:id/payments`
- ⏳ `POST /api/mandobes/:id/payments`

### Suppliers Endpoints
- ⏳ `GET /api/suppliers/:id/orders`
- ⏳ `POST /api/suppliers/:id/orders`
- ⏳ `PUT /api/suppliers/:id/orders/:orderId`
- ⏳ `DELETE /api/suppliers/:id/orders/:orderId`
- ⏳ `GET /api/suppliers/:id/payments`
- ⏳ `POST /api/suppliers/:id/payments`

### Reports Endpoints
- ⏳ `GET /api/reports/daily`
- ⏳ `GET /api/reports/monthly`
- ⏳ `GET /api/reports/yearly`
- ⏳ `GET /api/reports/by-city`
- ⏳ `GET /api/reports/by-mandobe`
- ⏳ `GET /api/reports/by-marketer`

### Socket.io Enhancements
- ⏳ إضافة rooms للاشتراك الانتقائي
- ⏳ إضافة أحداث للمنتجات والمسوقين والمندوبين
- ⏳ دعم المصادقة في Socket.io handshake

## Migration Instructions

### 1. تشغيل Migration
```bash
npm run db:migrate
```

### 2. التحقق من البيانات
- سيتم إنشاء سجل أولي في جدول `vault` برصيد 0
- سيتم إنشاء سجل أولي في جدول `order_codes` برقم 0

### 3. ملاحظات مهمة
- الحقول الجديدة في Orders (order_code, date_time) قابلة للقيمة null للتوافق مع البيانات القديمة
- يمكن تشغيل script لملء order_code للطلبات القديمة إذا لزم الأمر
- permissions في User model اختياري (JSON object)

## Field Mapping (Flutter ⇄ Backend)

### Orders
- `orderCode` ⇄ `order_code`
- `dateTime` ⇄ `date_time`
- `phoneTow` ⇄ `phone_two`
- `mandobeName` ⇄ `mandobe_id` (يُرجع الاسم أيضاً)
- `code` ⇄ `marketer_id` (يُرجع الاسم أيضاً)

### OrderDetails
- `count` ⇄ `quantity`

### Response Fields
- جميع التواريخ بصيغة ISO8601
- `total` يُرجع كـ number
- `sells` و `mandobe` boolean values

## Testing Checklist

### Auth
- [ ] Login يُرجع token + refreshToken + permissions
- [ ] Refresh token يعمل بشكل صحيح
- [ ] Logout يسجل الحدث

### Orders
- [ ] إنشاء طلب بدون orderCode يولده تلقائياً
- [ ] إنشاء طلب مع orderCode يستخدمه
- [ ] الفلاتر تعمل: status, city, mandobe_id, marketer_id, sells, dateFrom, dateTo
- [ ] الترتيب يعمل: dateTime_asc, dateTime_desc
- [ ] البحث في order_code يعمل
- [ ] تحديث status يعمل
- [ ] تحديث mandobe يعمل
- [ ] تحديث payment يعمل
- [ ] Statistics endpoint يُرجع بيانات صحيحة
- [ ] Next code endpoint يُرجع الرقم التالي

### Socket.io
- [ ] order:new يُبث عند إنشاء طلب
- [ ] order:updated يُبث عند تحديث طلب
- [ ] order:deleted يُبث عند حذف طلب

## Next Steps
1. إكمال Products endpoints (stock, history)
2. إكمال Vault endpoints
3. إكمال Marketers extended endpoints
4. إكمال Mandobes extended endpoints
5. إكمال Suppliers extended endpoints
6. إضافة Reports endpoints
7. تحسين Socket.io بـ rooms ومصادقة
8. كتابة tests شاملة
9. تحديث API documentation
10. إنشاء Postman collection محدثة
