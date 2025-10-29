# 🚀 البدء السريع - تنسيق Order في Commission API

## ✅ التحديث

Order في Commission API الآن **مطابق 100%** لـ Order في getOrder.

---

## 📊 التنسيق الجديد

```json
{
  "id": 11287,
  "customer_name": "مصطفى احمد",
  "phone": "01116011824",
  "total": "2300.00",
  "status": "accept",
  "orderCode": null,
  "dateTime": "2025-08-31T21:00:00.000Z",
  "mandobeName": "عمرو جلال",
  "code": "025",
  "details": [
    {
      "code": 4,
      "price": 0,
      "name": "160*27 سوست",
      "count": 1,
      "details": " ",
      "id": "4"
    }
  ]
}
```

---

## 🔄 الفروقات الرئيسية

### Details Format

**قبل ❌:**
```json
{
  "id": 1,
  "quantity": 1,
  "product": {
    "code": "4",
    "name": "160*27 سوست"
  }
}
```

**بعد ✅:**
```json
{
  "code": 4,
  "price": 0,
  "name": "160*27 سوست",
  "count": 1,
  "details": " ",
  "id": "4"
}
```

---

## 💻 Flutter Model

```dart
class CommissionOrder {
  final int id;
  final String customerName;
  final String phone;
  final double total;
  final String status;
  final String? orderCode;
  final DateTime? dateTime;
  final String? mandobeName;
  final String? code; // اسم المسوق
  final List<OrderDetailSimple> details;

  CommissionOrder.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        customerName = json['customer_name'],
        phone = json['phone'],
        total = double.parse(json['total'] ?? '0'),
        status = json['status'],
        orderCode = json['orderCode'],
        dateTime = json['dateTime'] != null 
            ? DateTime.parse(json['dateTime']) 
            : null,
        mandobeName = json['mandobeName'],
        code = json['code'],
        details = (json['details'] as List?)
            ?.map((d) => OrderDetailSimple.fromJson(d))
            .toList() ?? [];
}

class OrderDetailSimple {
  final dynamic code;
  final double price;
  final String? name;
  final int count;
  final String? details;
  final String id;

  OrderDetailSimple.fromJson(Map<String, dynamic> json)
      : code = json['code'],
        price = (json['price'] is num) 
            ? json['price'].toDouble() 
            : 0,
        name = json['name'],
        count = json['count'] ?? 0,
        details = json['details'],
        id = json['id'].toString();
}
```

---

## 🎯 الحقول المهمة

| الحقل | الوصف | مثال |
|------|-------|------|
| `orderCode` | كود الفاتورة | `"ORD-123"` أو `null` |
| `dateTime` | تاريخ الإنشاء | `"2025-08-31T21:00:00.000Z"` |
| `mandobeName` | اسم المندوب | `"عمرو جلال"` |
| `code` | اسم المسوق | `"025"` |
| `count` | الكمية (في details) | `1` |
| `details` | تفاصيل إضافية (في details) | `" "` |

---

## ✅ التوافق

- ✅ نفس التنسيق في `GET /api/orders`
- ✅ نفس التنسيق في `GET /api/orders/:id`
- ✅ نفس التنسيق في `GET /api/marketer-payments`
- ✅ نفس التنسيق في `GET /api/marketer-payments/by-month`

**يمكنك استخدام نفس الـ Model في كل مكان! 🎉**

---

## 📚 توثيق كامل

للمزيد من التفاصيل والأمثلة:
**`COMMISSION_ORDER_FORMAT_UPDATE.md`**

---

**تاريخ التحديث:** 24 أكتوبر 2024
