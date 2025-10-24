# 🚀 البدء السريع - Commission API المحدث

## ✅ ما الجديد؟

الـ API الآن يُرجع **تفاصيل الفاتورة كاملة** بدلاً من البيانات المحدودة.

---

## 📌 الاستخدام

### Endpoint
```
GET /api/marketer-payments?marketer_id=1
```

### Response الجديد
```json
{
  "order": {
    "id": 11654,
    "order_code": "ORD-11654",
    "customer_name": "محمد محمود معوض",
    "phone": "01234567890",
    "address": "الجيزة - 6 أكتوبر",
    "city": "الجيزة",
    "total": "3350.00",
    "shipping": "50.00",
    "status": "accept",
    "details": [
      {
        "id": 1,
        "quantity": 2,
        "price": "1500.00",
        "product": {
          "id": 5,
          "code": "PROD-005",
          "name": "قميص قطن",
          "price": "1500.00"
        }
      }
    ],
    "mandobeUser": {
      "id": 2,
      "name": "أحمد المندوب",
      "phone": "01555555555"
    }
  }
}
```

---

## 💻 Flutter Model

```dart
class FullOrder {
  final int id;
  final String? orderCode;
  final String customerName;
  final String phone;
  final String? address;
  final String? city;
  final double total;
  final double? shipping;
  final String status;
  final List<OrderDetail> details;
  final Mandobe? mandobeUser;

  FullOrder.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        orderCode = json['order_code'],
        customerName = json['customer_name'],
        phone = json['phone'],
        address = json['address'],
        city = json['city'],
        total = double.parse(json['total'] ?? '0'),
        shipping = json['shipping'] != null 
            ? double.parse(json['shipping']) 
            : null,
        status = json['status'],
        details = (json['details'] as List?)
            ?.map((d) => OrderDetail.fromJson(d))
            .toList() ?? [],
        mandobeUser = json['mandobeUser'] != null 
            ? Mandobe.fromJson(json['mandobeUser']) 
            : null;

  double get finalTotal => total + (shipping ?? 0);
}

class OrderDetail {
  final int id;
  final int quantity;
  final double price;
  final Product product;

  OrderDetail.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        quantity = json['quantity'],
        price = double.parse(json['price'] ?? '0'),
        product = Product.fromJson(json['product']);
}

class Product {
  final int id;
  final String code;
  final String name;
  final double price;

  Product.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        code = json['code'],
        name = json['name'],
        price = double.parse(json['price'] ?? '0');
}
```

---

## 🎨 UI مثال

```dart
Widget buildOrderCard(FullOrder order) {
  return Card(
    child: Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            'فاتورة: ${order.orderCode ?? "---"}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          // Customer info
          Text('العميل: ${order.customerName}'),
          Text('الهاتف: ${order.phone}'),
          if (order.address != null) 
            Text('العنوان: ${order.address}'),
          
          Divider(),
          
          // Products
          Text('المنتجات:', 
               style: TextStyle(fontWeight: FontWeight.bold)),
          
          ...order.details.map((item) => Padding(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text('${item.product.name} × ${item.quantity}'),
                ),
                Text('${item.price} جنيه'),
              ],
            ),
          )),
          
          Divider(),
          
          // Totals
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('المجموع:'),
              Text('${order.total} جنيه'),
            ],
          ),
          
          if (order.shipping != null) Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('الشحن:'),
              Text('${order.shipping} جنيه'),
            ],
          ),
          
          SizedBox(height: 8),
          
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('الإجمالي:', 
                   style: TextStyle(fontWeight: FontWeight.bold)),
              Text(
                '${order.finalTotal} جنيه',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
```

---

## 📊 البيانات المتاحة

### Order
- ✅ جميع معلومات العميل (الاسم، الهاتف، العنوان، المدينة)
- ✅ الإجمالي والشحن
- ✅ الحالة والملاحظات
- ✅ تاريخ الإنشاء

### Details (المنتجات)
- ✅ الكمية والسعر
- ✅ بيانات المنتج (الكود، الاسم، السعر)

### Relations
- ✅ بيانات المندوب (الاسم، الهاتف)
- ✅ بيانات المسوق (الاسم، الهاتف)

---

## 🧪 اختبار

```bash
curl -X GET "http://localhost:3000/api/marketer-payments?marketer_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 توثيق كامل

للمزيد من التفاصيل والأمثلة، راجع:
**`MARKETER_COMMISSION_API_UPDATE.md`**

---

**تاريخ التحديث:** 24 أكتوبر 2024
