# 📦 تحديث: إضافة السعر للمنتجات والشحن للطلبات

## 📝 ملخص التحديثات

تم إضافة حقلين جديدين:
1. **`price`** في جدول Products - لتخزين سعر المنتج
2. **`shipping`** في جدول Orders - لتخزين مصاريف الشحن

---

## 🗄️ تغييرات Database

### Products Table
```sql
ALTER TABLE products 
ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0 
COMMENT 'سعر المنتج';
```

**الخصائص:**
- النوع: `DECIMAL(10,2)` - يدعم أرقام حتى 99,999,999.99
- القيمة الافتراضية: `0`
- **المنتجات الحالية**: ستحصل تلقائياً على سعر 0

### Orders Table
```sql
ALTER TABLE orders 
ADD COLUMN shipping DECIMAL(10,2) NULL 
COMMENT 'مصاريف الشحن';
```

**الخصائص:**
- النوع: `DECIMAL(10,2)`
- **nullable**: يمكن تركه فارغاً
- القيمة الافتراضية: `NULL`
- **الطلبات الحالية**: ستبقى بدون قيمة شحن (NULL)

---

## 🚀 تشغيل Migrations

### تلقائياً (عند Deploy)
سيتم تشغيل Migrations تلقائياً إذا كان لديك:
```json
{
  "scripts": {
    "start": "npm run db:migrate && node src/server.js"
  }
}
```

### يدوياً
```bash
npm run db:migrate
```

**Migrations المضافة:**
- `20251023160100-add-price-to-products.js`
- `20251023160200-add-shipping-to-orders.js`

---

## 📡 API Updates

### Products Endpoints

#### إنشاء منتج (مع السعر)
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer {token}

{
  "code": "PROD123",
  "name": "منتج تجريبي",
  "price": 150.50,
  "count": 100
}
```

#### تحديث منتج (تعديل السعر)
```http
PUT /api/products/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "منتج محدث",
  "price": 175.00,
  "count": 50
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "PROD123",
    "name": "منتج تجريبي",
    "price": "150.50",
    "count": 100,
    "order_by": 0
  },
  "message": "Product created successfully",
  "timestamp": "2024-10-23T16:00:00.000Z"
}
```

---

### Orders Endpoints

#### إنشاء طلب (مع الشحن)
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}

{
  "customer_name": "أحمد محمد",
  "phone": "01234567890",
  "address": "القاهرة",
  "city": "Cairo",
  "total": 500.00,
  "shipping": 50.00,
  "marketer_id": 1,
  "details": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 250.00
    }
  ]
}
```

#### إنشاء طلب (بدون شحن)
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer {token}

{
  "customer_name": "أحمد محمد",
  "phone": "01234567890",
  "total": 500.00
  // shipping غير مطلوب - يمكن تركه
}
```

#### تحديث طلب (إضافة/تعديل الشحن)
```http
PUT /api/orders/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "shipping": 75.00
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "order_code": "ORD-123",
    "customer_name": "أحمد محمد",
    "phone": "01234567890",
    "total": "500.00",
    "shipping": "50.00",
    "status": "pending",
    "created_at": "2024-10-23T16:00:00.000Z"
  },
  "message": "Order created successfully",
  "timestamp": "2024-10-23T16:00:00.000Z"
}
```

---

## ✅ Validation Rules

### Product Price
- **نوع البيانات**: Number (Float)
- **القيمة الدنيا**: 0
- **اختياري**: نعم (إذا لم يُرسل، سيكون 0)
- **أمثلة صحيحة**: `0`, `10.5`, `150`, `1999.99`
- **أمثلة خاطئة**: `-10`, `"abc"`, `null`

### Order Shipping
- **نوع البيانات**: Number (Float) أو NULL
- **القيمة الدنيا**: 0 (إذا تم إرسالها)
- **اختياري**: نعم (يمكن تركه فارغاً)
- **أمثلة صحيحة**: `null`, `0`, `25.5`, `100`
- **أمثلة خاطئة**: `-10`, `"free"`

---

## 🔄 Rollback (إذا احتجت)

لإلغاء التحديثات:
```bash
npm run db:migrate:undo
npm run db:migrate:undo
```

سيقوم بحذف الحقول بترتيب عكسي:
1. حذف `shipping` من Orders
2. حذف `price` من Products

---

## 🧪 اختبار التحديثات

### 1. التحقق من Products
```bash
# إنشاء منتج بسعر
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "TEST001",
    "name": "منتج اختبار",
    "price": 99.99,
    "count": 10
  }'
```

### 2. التحقق من Orders مع الشحن
```bash
# إنشاء طلب مع شحن
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name": "اختبار",
    "phone": "01234567890",
    "total": 200.00,
    "shipping": 30.00,
    "marketer_id": 1
  }'
```

### 3. التحقق من Orders بدون شحن
```bash
# إنشاء طلب بدون شحن
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name": "اختبار",
    "phone": "01234567890",
    "total": 200.00,
    "marketer_id": 1
  }'
```

---

## 📊 تأثير على البيانات الحالية

### Products
✅ **آمن تماماً**
- جميع المنتجات الحالية ستحصل على `price = 0`
- لن يحدث أي خطأ
- يمكنك تحديث الأسعار لاحقاً

### Orders
✅ **آمن تماماً**
- جميع الطلبات الحالية سيكون `shipping = NULL`
- لن يؤثر على الحسابات الموجودة
- `total` يبقى كما هو

---

## 💡 حالات الاستخدام

### 1. منتج بسعر ثابت
```json
{
  "code": "SHIRT-001",
  "name": "قميص قطن",
  "price": 150.00,
  "count": 50
}
```

### 2. منتج مجاني (هدية)
```json
{
  "code": "GIFT-001",
  "name": "هدية",
  "price": 0,
  "count": 10
}
```

### 3. طلب بشحن مجاني
```json
{
  "customer_name": "علي",
  "phone": "01111111111",
  "total": 500.00,
  "shipping": 0
}
```

### 4. طلب بدون معلومات شحن (سيتم تحديدها لاحقاً)
```json
{
  "customer_name": "علي",
  "phone": "01111111111",
  "total": 500.00
  // لا توجد قيمة shipping
}
```

---

## 🎯 الخطوات التالية

### للـ Backend
1. ✅ تم تنفيذ Migrations
2. ✅ تم تحديث Models
3. ✅ تم تحديث Validators
4. ⏭️ يمكنك البدء في استخدام الحقول الجديدة

### للـ Frontend (Flutter)
1. إضافة حقل `price` في Product model
2. إضافة حقل `shipping` في Order model
3. تحديث UI لإدخال السعر عند إنشاء/تعديل منتج
4. تحديث UI لإدخال الشحن (اختياري) عند إنشاء/تعديل طلب
5. تحديث حسابات الفواتير لتشمل الشحن

---

## ❓ أسئلة شائعة

### Q: ماذا يحدث للمنتجات الحالية؟
**A:** جميع المنتجات الحالية ستحصل تلقائياً على `price = 0`. يمكنك تحديثها يدوياً أو عبر API.

### Q: هل يجب إضافة shipping في كل طلب؟
**A:** لا، حقل shipping اختياري تماماً. يمكنك تركه فارغاً أو إضافة قيمة له.

### Q: كيف أحسب الإجمالي النهائي مع الشحن؟
**A:** 
```
إجمالي الطلب النهائي = total + shipping (إذا كان shipping موجود)
```

### Q: هل يمكن أن يكون السعر سالباً؟
**A:** لا، الـ validation لا يسمح بقيم سالبة للسعر أو الشحن.

---

**تم التحديث:** 23 أكتوبر 2024  
**الإصدار:** 1.0.0
