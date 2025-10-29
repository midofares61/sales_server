# 🎯 تحديث تنسيق Order في Commission API

## ✅ التحديث الجديد

الآن Order في Commission API **مطابق تماماً** لـ Order في `getOrder` API.

---

## 📊 التنسيق الجديد

### Order Format (مطابق لـ getOrder)

```json
{
  "id": 11287,
  "customer_name": "مصطفى احمد",
  "phone": "01116011824",
  "phone_two": null,
  "address": "البساتين ش السويس",
  "city": "القاهرة",
  "nameAdd": "taki",
  "nameEdit": "taki",
  "sells": false,
  "mandobe": false,
  "total": "2300.00",
  "shipping": null,
  "status": "accept",
  "notes": "طالع",
  "mandobe_id": 8,
  "marketer_id": 1,
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
    },
    {
      "code": 11,
      "price": 0,
      "name": "مخده فايبر",
      "count": 1,
      "details": " ",
      "id": "11"
    },
    {
      "code": 12,
      "price": 0,
      "name": "خداديه فايبر",
      "count": 2,
      "details": " ",
      "id": "12"
    }
  ]
}
```

---

## 🔄 الفرق الرئيسي

### Details Format

**قبل ❌:**
```json
"details": [
  {
    "id": 1,
    "order_id": 11287,
    "product_id": 4,
    "quantity": 1,
    "price": "0.00",
    "product": {
      "id": 4,
      "code": "4",
      "name": "160*27 سوست",
      "price": "0.00"
    }
  }
]
```

**بعد ✅:**
```json
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
```

---

## 📋 الحقول الجديدة/المعدلة

### Order Level
- ✅ `orderCode` - نسخة من order_code
- ✅ `dateTime` - نسخة من created_at
- ✅ `mandobeName` - اسم المندوب مباشرة (بدلاً من mandobeUser.name)
- ✅ `code` - اسم المسوق مباشرة (بدلاً من marketer.name)
- ❌ تم حذف: `mandobeUser`, `marketer`, `order_code`, `date_time`, `created_at`, `updated_at`

### Details Level
- ✅ `code` - كود المنتج (number أو string)
- ✅ `name` - اسم المنتج
- ✅ `count` - الكمية (بدلاً من quantity)
- ✅ `price` - السعر (number بدلاً من string)
- ✅ `details` - تفاصيل إضافية من OrderDetail
- ✅ `id` - كود المنتج (string)
- ❌ تم حذف: `order_id`, `product_id`, `quantity`, `product` object

---

## 💻 Flutter Model المحدث

```dart
class CommissionOrder {
  final int id;
  final String customerName;
  final String phone;
  final String? phoneTwo;
  final String? address;
  final String? city;
  final String? nameAdd;
  final String? nameEdit;
  final bool sells;
  final bool mandobe;
  final double total;
  final double? shipping;
  final String status;
  final String? notes;
  final int? mandobeId;
  final int? marketerId;
  final String? orderCode;
  final DateTime? dateTime;
  final String? mandobeName;
  final String? code; // اسم المسوق
  final List<OrderDetailSimple> details;

  CommissionOrder.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        customerName = json['customer_name'],
        phone = json['phone'],
        phoneTwo = json['phone_two'],
        address = json['address'],
        city = json['city'],
        nameAdd = json['nameAdd'],
        nameEdit = json['nameEdit'],
        sells = json['sells'] ?? false,
        mandobe = json['mandobe'] ?? false,
        total = double.parse(json['total']?.toString() ?? '0'),
        shipping = json['shipping'] != null 
            ? double.parse(json['shipping'].toString()) 
            : null,
        status = json['status'],
        notes = json['notes'],
        mandobeId = json['mandobe_id'],
        marketerId = json['marketer_id'],
        orderCode = json['orderCode'],
        dateTime = json['dateTime'] != null 
            ? DateTime.parse(json['dateTime']) 
            : null,
        mandobeName = json['mandobeName'],
        code = json['code'],
        details = (json['details'] as List?)
            ?.map((d) => OrderDetailSimple.fromJson(d))
            .toList() ?? [];

  double get finalTotal => total + (shipping ?? 0);
  int get totalItems => details.fold(0, (sum, item) => sum + item.count);
}

class OrderDetailSimple {
  final dynamic code; // يمكن أن يكون number أو string
  final double price;
  final String? name;
  final int count;
  final String? details;
  final String id;

  OrderDetailSimple.fromJson(Map<String, dynamic> json)
      : code = json['code'],
        price = (json['price'] is num) 
            ? json['price'].toDouble() 
            : double.parse(json['price']?.toString() ?? '0'),
        name = json['name'],
        count = json['count'] ?? 0,
        details = json['details'],
        id = json['id'].toString();
}
```

---

## 🎨 UI Example

```dart
Widget buildCommissionOrderCard(CommissionOrder order) {
  return Card(
    margin: EdgeInsets.all(16),
    child: Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'فاتورة: ${order.orderCode ?? "---"}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Chip(
                label: Text(_getStatusText(order.status)),
                backgroundColor: _getStatusColor(order.status),
              ),
            ],
          ),
          
          SizedBox(height: 12),
          
          // Customer Info
          _buildInfoRow('العميل', order.customerName),
          _buildInfoRow('الهاتف', order.phone),
          if (order.phoneTwo != null)
            _buildInfoRow('هاتف ثاني', order.phoneTwo!),
          if (order.address != null)
            _buildInfoRow('العنوان', order.address!),
          if (order.city != null)
            _buildInfoRow('المدينة', order.city!),
          
          Divider(height: 24),
          
          // Products
          Text(
            'المنتجات:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          SizedBox(height: 8),
          
          ...order.details.map((item) => Container(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                // Product code
                Container(
                  width: 40,
                  child: Text(
                    '${item.code}',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                ),
                
                // Product name and count
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.name ?? '---'),
                      if (item.details != null && item.details!.trim().isNotEmpty)
                        Text(
                          item.details!,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                    ],
                  ),
                ),
                
                // Quantity
                Text(
                  'الكمية: ${item.count}',
                  style: TextStyle(fontWeight: FontWeight.w500),
                ),
                
                SizedBox(width: 16),
                
                // Price
                Text(
                  '${item.price} جنيه',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          )),
          
          Divider(height: 24),
          
          // Totals
          _buildTotalRow('المجموع', order.total),
          if (order.shipping != null)
            _buildTotalRow('الشحن', order.shipping!),
          
          SizedBox(height: 8),
          
          _buildTotalRow(
            'الإجمالي',
            order.finalTotal,
            isFinal: true,
          ),
          
          if (order.mandobeName != null && order.mandobeName!.isNotEmpty) ...[
            Divider(height: 24),
            _buildInfoRow('المندوب', order.mandobeName!),
          ],
          
          if (order.code != null && order.code!.isNotEmpty)
            _buildInfoRow('المسوق', order.code!),
          
          if (order.notes != null && order.notes!.trim().isNotEmpty) ...[
            Divider(height: 24),
            Text(
              'ملاحظات:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 4),
            Text(order.notes!),
          ],
        ],
      ),
    ),
  );
}

Widget _buildInfoRow(String label, String value) {
  return Padding(
    padding: EdgeInsets.symmetric(vertical: 2),
    child: Row(
      children: [
        Text(
          '$label: ',
          style: TextStyle(color: Colors.grey[600]),
        ),
        Text(
          value,
          style: TextStyle(fontWeight: FontWeight.w500),
        ),
      ],
    ),
  );
}

Widget _buildTotalRow(String label, double value, {bool isFinal = false}) {
  return Padding(
    padding: EdgeInsets.symmetric(vertical: 4),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '$label:',
          style: TextStyle(
            fontWeight: isFinal ? FontWeight.bold : FontWeight.normal,
            fontSize: isFinal ? 16 : 14,
          ),
        ),
        Text(
          '${value.toStringAsFixed(2)} جنيه',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: isFinal ? 16 : 14,
            color: isFinal ? Colors.green : null,
          ),
        ),
      ],
    ),
  );
}

String _getStatusText(String status) {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'accept': return 'مقبول';
    case 'refuse': return 'مرفوض';
    case 'delay': return 'مؤجل';
    default: return status;
  }
}

Color _getStatusColor(String status) {
  switch (status) {
    case 'pending': return Colors.orange.shade100;
    case 'accept': return Colors.green.shade100;
    case 'refuse': return Colors.red.shade100;
    case 'delay': return Colors.blue.shade100;
    default: return Colors.grey.shade100;
  }
}
```

---

## 🔍 مقارنة المميزات

| الميزة | القديم | الجديد |
|--------|--------|--------|
| تنسيق Details | Nested objects | Flat structure ✅ |
| اسم المندوب | `mandobeUser.name` | `mandobeName` ✅ |
| اسم المسوق | `marketer.name` | `code` ✅ |
| كود الفاتورة | `order_code` | `orderCode` ✅ |
| التاريخ | `created_at` | `dateTime` ✅ |
| الكمية | `quantity` | `count` ✅ |
| السعر | String | Number ✅ |
| Product details | Nested | Direct ✅ |

---

## ⚠️ ملاحظات مهمة

### 1. Code يمكن أن يكون Number أو String
```dart
// تأكد من التعامل مع كلا النوعين
final code = item.code;
if (code is int) {
  print('كود رقمي: $code');
} else if (code is String) {
  print('كود نصي: $code');
}
```

### 2. Details الإضافية
حقل `details` في OrderDetail يحتوي على تفاصيل إضافية عن المنتج (مثل المقاسات، الألوان، إلخ).

### 3. Code في Order
حقل `code` على مستوى Order هو **اسم المسوق** وليس كود الطلب.

---

## ✅ التوافق

- ✅ متوافق 100% مع `getOrder` API
- ✅ نفس البنية في `GET /api/orders/:id`
- ✅ نفس البنية في `GET /api/orders`
- ✅ نفس البنية الآن في `GET /api/marketer-payments`

---

## 📚 APIs المحدثة

1. ✅ `GET /api/marketer-payments?marketer_id=1`
2. ✅ `GET /api/marketer-payments/by-month?marketer_id=1`

كلاهما الآن يُرجع Order بنفس التنسيق المطابق لـ getOrder.

---

**تم التحديث:** 24 أكتوبر 2024  
**الإصدار:** 3.0.0  
**التوافق:** مطابق 100% لـ getOrder API
