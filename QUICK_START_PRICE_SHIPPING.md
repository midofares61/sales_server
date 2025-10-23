# 🚀 البدء السريع: السعر والشحن

## ✅ ما تم إضافته

### حقول جديدة:
1. **`price`** في Products - سعر المنتج (افتراضي: 0)
2. **`shipping`** في Orders - مصاريف الشحن (اختياري)

---

## 📌 خطوات التطبيق (3 خطوات فقط!)

### 1️⃣ تشغيل Migrations
```bash
npm run db:migrate
```

**النتيجة:**
- ✅ سيتم إضافة حقل `price` للمنتجات (جميع المنتجات الحالية = 0)
- ✅ سيتم إضافة حقل `shipping` للطلبات (جميع الطلبات الحالية = NULL)

### 2️⃣ اختبار Products مع السعر
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "PROD001",
    "name": "منتج تجريبي",
    "price": 99.99
  }'
```

### 3️⃣ اختبار Orders مع الشحن
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name": "أحمد",
    "phone": "01234567890",
    "total": 200.00,
    "shipping": 25.00,
    "marketer_id": 1
  }'
```

---

## 💻 أمثلة الاستخدام

### Product API

#### إنشاء منتج بسعر
```json
POST /api/products
{
  "code": "SHIRT-001",
  "name": "قميص قطن",
  "price": 150.00,
  "count": 50
}
```

#### تحديث السعر
```json
PUT /api/products/1
{
  "price": 175.00
}
```

#### منتج بدون سعر (سيكون 0)
```json
POST /api/products
{
  "code": "GIFT-001",
  "name": "هدية",
  "count": 10
}
// price سيكون 0 تلقائياً
```

---

### Order API

#### طلب مع شحن
```json
POST /api/orders
{
  "customer_name": "علي محمد",
  "phone": "01111111111",
  "total": 500.00,
  "shipping": 50.00,
  "marketer_id": 1
}
```

#### طلب بدون شحن
```json
POST /api/orders
{
  "customer_name": "علي محمد",
  "phone": "01111111111",
  "total": 500.00,
  "marketer_id": 1
}
// shipping سيكون NULL
```

#### إضافة/تحديث الشحن لطلب موجود
```json
PUT /api/orders/123
{
  "shipping": 30.00
}
```

---

## 📊 حالات الاستخدام

| الحالة | Product Price | Order Shipping |
|--------|---------------|----------------|
| منتج عادي | `150.00` | - |
| منتج مجاني (هدية) | `0` | - |
| طلب بشحن عادي | - | `50.00` |
| طلب بشحن مجاني | - | `0` |
| طلب بدون معلومات شحن | - | `null` أو لا ترسل |

---

## 🧮 حساب الإجمالي النهائي

```javascript
// في الفاتورة
const finalTotal = order.total + (order.shipping || 0);

// مثال:
// total = 500
// shipping = 50
// finalTotal = 550
```

---

## ⚠️ ملاحظات مهمة

### ✅ آمن للبيانات الحالية
- المنتجات القديمة: `price = 0`
- الطلبات القديمة: `shipping = NULL`
- لن يحدث أي خطأ أو مشكلة

### ✅ الحقول اختيارية في API
- يمكن إنشاء منتج بدون إرسال `price` (سيكون 0)
- يمكن إنشاء طلب بدون إرسال `shipping` (سيكون NULL)

### ✅ Validation
- السعر والشحن لا يمكن أن يكونا سالبين
- يقبل قيم عشرية (مثل: 99.99)

---

## 🔄 Rollback (إذا احتجت)

```bash
# إلغاء آخر migration (shipping)
npm run db:migrate:undo

# إلغاء قبل الأخير (price)
npm run db:migrate:undo
```

---

## 📝 للـ Frontend Team

### تحديثات مطلوبة:

#### Product Model (Dart/Flutter)
```dart
class Product {
  final int id;
  final String code;
  final String name;
  final double price;  // ✅ جديد
  final int count;
  
  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.price,
    required this.count,
  });
  
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      code: json['code'],
      name: json['name'],
      price: double.parse(json['price'] ?? '0'),  // ✅ جديد
      count: json['count'],
    );
  }
}
```

#### Order Model (Dart/Flutter)
```dart
class Order {
  final int id;
  final String customerName;
  final String phone;
  final double total;
  final double? shipping;  // ✅ جديد (nullable)
  
  Order({
    required this.id,
    required this.customerName,
    required this.phone,
    required this.total,
    this.shipping,
  });
  
  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      customerName: json['customer_name'],
      phone: json['phone'],
      total: double.parse(json['total'] ?? '0'),
      shipping: json['shipping'] != null 
          ? double.parse(json['shipping']) 
          : null,  // ✅ جديد
    );
  }
  
  // الإجمالي النهائي
  double get finalTotal => total + (shipping ?? 0);
}
```

#### UI Changes
1. **Product Form**: أضف حقل لإدخال السعر
2. **Order Form**: أضف حقل اختياري لإدخال الشحن
3. **Invoice**: اعرض الشحن منفصلاً عن المجموع

---

## ✅ Checklist

- [ ] تم تشغيل `npm run db:migrate`
- [ ] تم اختبار إنشاء منتج بسعر
- [ ] تم اختبار إنشاء طلب مع شحن
- [ ] تم اختبار إنشاء طلب بدون شحن
- [ ] تم تحديث Frontend Models
- [ ] تم تحديث UI Forms

---

**للمزيد من التفاصيل:** راجع `PRODUCT_PRICE_AND_SHIPPING_UPDATE.md`

**تاريخ التحديث:** 23 أكتوبر 2024
