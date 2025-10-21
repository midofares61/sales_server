# Flutter Integration Guide

## نظرة عامة
هذا الدليل يشرح كيفية دمج السيرفر مع تطبيق Flutter بناءً على المواصفات في `update.md`.

## Base URL
```
http://localhost:3000/api
```

للإنتاج، استبدل `localhost:3000` بعنوان السيرفر الفعلي.

## المصادقة (Authentication)

### 1. تسجيل الدخول
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "Admin",
      "username": "admin",
      "phone": "01000000000",
      "role": "admin",
      "permissions": {
        "addOrder": true,
        "editOrder": true,
        "removeOrder": true,
        "showMandobe": true,
        "addMandobe": true,
        ...
      }
    }
  },
  "message": "Login successful",
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### 2. تجديد التوكن
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### 3. تسجيل الخروج
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## الطلبات (Orders)

### 1. قائمة الطلبات (مع فلاتر متقدمة)
```http
GET /api/orders?page=1&limit=20&status=accept&city=Cairo&dateFrom=2025-01-01T00:00:00Z&dateTo=2025-12-31T23:59:59Z&sort=dateTime_desc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - رقم الصفحة (افتراضي: 1)
- `limit` - عدد العناصر (افتراضي: 10)
- `q` - البحث في (اسم العميل، الهاتف، رقم الطلب)
- `status` - الحالة (pending, accept, refuse, delay)
- `city` - المدينة
- `mandobe_id` - معرف المندوب
- `marketer_id` - معرف المسوق
- `sells` - حالة العمولة (paid, unPaid)
- `dateFrom` - من تاريخ (ISO8601)
- `dateTo` - إلى تاريخ (ISO8601)
- `sort` - الترتيب (dateTime_asc, dateTime_desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderCode": "1",
      "customer_name": "Ahmed Ali",
      "phone": "01234567890",
      "phone_two": "01234567891",
      "address": "123 Main St",
      "city": "Cairo",
      "dateTime": "2025-10-16T14:00:00.000Z",
      "mandobeName": "Mandobe Name",
      "code": "Marketer Name",
      "total": "150.00",
      "status": "accept",
      "notes": "Special instructions",
      "sells": false,
      "mandobe": false,
      "nameAdd": "Admin",
      "nameEdit": null,
      "details": [
        {
          "code": "PROD001",
          "name": "Product Name",
          "count": 2,
          "price": 75.00,
          "details": "Product notes",
          "id": "PROD001"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Orders retrieved successfully",
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### 2. جلب طلب واحد
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### 3. إنشاء طلب جديد
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_name": "Ahmed Ali",
  "phone": "01234567890",
  "phone_two": "01234567891",
  "address": "123 Main St",
  "city": "Cairo",
  "dateTime": "2025-10-16T14:00:00.000Z",
  "mandobe_id": 1,
  "marketer_id": 2,
  "total": 150.00,
  "status": "pending",
  "notes": "Special instructions",
  "details": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 75.00,
      "details": "Product notes"
    }
  ]
}
```

**ملاحظات:**
- `orderCode` اختياري - سيتم توليده تلقائياً إذا لم يُرسل
- `dateTime` اختياري - سيتم استخدام الوقت الحالي إذا لم يُرسل
- يمكن إرسال `mandobeName` بدلاً من `mandobe_id`
- يمكن إرسال `code` (اسم المسوق) بدلاً من `marketer_id`
- `details.quantity` يُعادل `count` في Flutter

### 4. تحديث طلب
```http
PUT /api/orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accept",
  "notes": "Updated notes",
  "details": [...]
}
```

### 5. تحديث حالة الطلب
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accept"
}
```

### 6. تحديث المندوب
```http
PUT /api/orders/:id/mandobe
Authorization: Bearer <token>
Content-Type: application/json

{
  "mandobe_id": 2
}
```
أو
```json
{
  "mandobeName": "Mandobe Name"
}
```

### 7. تحديث حالة العمولة
```http
PUT /api/orders/:id/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "sells": true
}
```

### 8. إحصائيات الطلبات
```http
GET /api/orders/statistics?month=10&year=2025&city=Cairo
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "totalAmount": 45000.00,
    "byStatus": {
      "pending": 20,
      "accept": 100,
      "refuse": 20,
      "delay": 10
    },
    "byCity": {
      "Cairo": 80,
      "Alexandria": 70
    }
  },
  "message": "Statistics retrieved successfully",
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### 9. جلب رقم الطلب التالي
```http
GET /api/orders/next-code
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderCode": "123"
  },
  "message": "Next order code generated",
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### 10. حذف طلب
```http
DELETE /api/orders/:id
Authorization: Bearer <token>
```

## المنتجات (Products)

### 1. قائمة المنتجات
```http
GET /api/products?page=1&limit=20
Authorization: Bearer <token>
```

### 2. إنشاء منتج
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "PROD001",
  "name": "Product Name",
  "count": 100,
  "type": "regular"
}
```

**Types:** `gift`, `mattress`, `regular`

### 3. تحديث منتج
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "count": 150
}
```

### 4. تحديث المخزون
```http
PUT /api/products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "delta": 10,
  "note": "Stock replenishment"
}
```

**ملاحظات:**
- `delta` يمكن أن يكون موجب (إضافة) أو سالب (خصم)
- سيتم رفض العملية إذا كان الناتج سالب

### 5. تاريخ المخزون
```http
GET /api/products/:id/history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "countDelta": 10,
      "countBefore": 90,
      "countAfter": 100,
      "note": "Stock replenishment",
      "dateTime": "2025-10-16T14:00:00.000Z",
      "createdBy": 1
    }
  ],
  "message": "Product history retrieved successfully",
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### 6. حذف منتج
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

## Socket.io Real-time Events

### الاتصال
```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

IO.Socket socket = IO.io('http://localhost:3000', <String, dynamic>{
  'transports': ['websocket'],
  'autoConnect': false,
});

socket.connect();
```

### الأحداث المتاحة

#### Orders
- `order:new` - طلب جديد
- `order:updated` - تحديث طلب
- `order:deleted` - حذف طلب

#### Products
- `product:new` - منتج جديد
- `product:updated` - تحديث منتج
- `product:deleted` - حذف منتج
- `product:stock_updated` - تحديث مخزون

#### Marketers
- `marketer:new` - مسوق جديد
- `marketer:updated` - تحديث مسوق
- `marketer:deleted` - حذف مسوق

#### Mandobes
- `mandobe:new` - مندوب جديد
- `mandobe:updated` - تحديث مندوب
- `mandobe:deleted` - حذف مندوب

#### Suppliers
- `supplier:new` - مورد جديد
- `supplier:updated` - تحديث مورد
- `supplier:deleted` - حذف مورد

### مثال الاستماع للأحداث
```dart
socket.on('order:new', (data) {
  print('New order: ${data['id']}');
  print('Order code: ${data['order_code']}');
  print('Timestamp: ${data['timestamp']}');
  // تحديث UI
});

socket.on('order:updated', (data) {
  print('Order updated: ${data['id']}');
  // تحديث UI
});

socket.on('product:stock_updated', (data) {
  print('Product stock updated: ${data['id']}');
  // تحديث UI
});
```

## Field Mapping (Flutter ⇄ Backend)

### عند الإرسال (Flutter → Backend)
```dart
// في Flutter
final order = {
  'orderCode': '123',        // → order_code
  'dateTime': '2025-...',    // → date_time
  'phoneTow': '012...',      // → phone_two
  'details': [
    {
      'product_id': 1,
      'count': 2,              // → quantity
      'price': 75.00
    }
  ]
};
```

### عند الاستقبال (Backend → Flutter)
```dart
// من Backend
{
  'order_code': '123',       // → orderCode
  'date_time': '2025-...',   // → dateTime
  'phone_two': '012...',     // → phoneTow
  'details': [
    {
      'product_id': 1,
      'quantity': 2,           // → count
      'price': 75.00
    }
  ]
}
```

## Error Handling

جميع الأخطاء تتبع الصيغة:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "phone",
      "message": "Phone is required"
    }
  ],
  "timestamp": "2025-10-16T14:42:00.000Z"
}
```

### أكواد الأخطاء الشائعة
- `400` - Bad Request (بيانات غير صحيحة)
- `401` - Unauthorized (غير مصرح)
- `403` - Forbidden (ممنوع)
- `404` - Not Found (غير موجود)
- `500` - Internal Server Error (خطأ في السيرفر)

## Pagination

جميع endpoints التي تُرجع قوائم تدعم pagination:

```http
GET /api/orders?page=2&limit=20
```

Response يحتوي على:
```json
{
  "pagination": {
    "total": 100,      // إجمالي العناصر
    "page": 2,         // الصفحة الحالية
    "limit": 20,       // عدد العناصر لكل صفحة
    "pages": 5,        // إجمالي الصفحات
    "hasNext": true,   // يوجد صفحة تالية
    "hasPrev": true    // يوجد صفحة سابقة
  }
}
```

## Security

### Headers المطلوبة
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Token Expiry
- Access Token: 30 يوم (قابل للتعديل في `.env`)
- Refresh Token: 90 يوم

### Refresh Strategy
عند استقبال 401:
1. استدعاء `/api/auth/refresh` مع refreshToken
2. حفظ token الجديد
3. إعادة المحاولة للطلب الأصلي

## Environment Variables

في ملف `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sales_db

JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=30d

PORT=3000
NODE_ENV=development
```

## Setup Instructions

### 1. تثبيت Dependencies
```bash
npm install
```

### 2. إعداد قاعدة البيانات
```bash
npm run setup
```

### 3. تشغيل السيرفر
```bash
# Development
npm run dev

# Production
npm start
```

### 4. تشغيل Migration الجديد
```bash
npm run db:migrate
```

## Testing

### Default Admin User
بعد تشغيل `npm run setup`:
```
Username: admin
Password: admin123
```

### Postman Collection
استخدم ملف `postman_collection.json` لاختبار جميع endpoints.

## Support

للمساعدة أو الإبلاغ عن مشاكل، راجع:
- `update.md` - المواصفات الكاملة
- `CHANGES.md` - التعديلات المنفذة
- `API.md` - توثيق API الكامل
