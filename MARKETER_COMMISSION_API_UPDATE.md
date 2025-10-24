# 📊 تحديث API عرض عمولات المسوقين (Marketer Commission)

## 📝 ملخص التحديث

تم تحديث API الخاص بعرض عمولات المسوقين ليُرجع **تفاصيل الفاتورة كاملة** بدلاً من البيانات المحدودة.

### ✨ التحسينات

**قبل ❌:**
```json
"order": {
    "id": 11654,
    "order_code": null,
    "customer_name": "محمد محمود معوض",
    "total": "3350.00"
}
```

**بعد ✅:**
```json
"order": {
    "id": 11654,
    "order_code": "ORD-11654",
    "customer_name": "محمد محمود معوض",
    "phone": "01234567890",
    "phone_two": "01111111111",
    "address": "الجيزة - 6 أكتوبر",
    "city": "الجيزة",
    "total": "3350.00",
    "shipping": "50.00",
    "status": "accept",
    "notes": "توصيل صباحاً",
    "created_at": "2024-10-20T10:30:00.000Z",
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
        },
        {
            "id": 2,
            "quantity": 1,
            "price": "350.00",
            "product": {
                "id": 8,
                "code": "PROD-008",
                "name": "بنطلون جينز",
                "price": "350.00"
            }
        }
    ],
    "mandobeUser": {
        "id": 2,
        "name": "أحمد المندوب",
        "phone": "01555555555"
    },
    "marketer": {
        "id": 1,
        "name": "محمد المسوق",
        "phone": "01666666666"
    }
}
```

---

## 🔄 APIs المحدثة

### 1. GET /api/marketer-payments

عرض جميع عمولات المسوقين مع تفاصيل الفواتير كاملة.

#### Query Parameters
```
marketer_id (optional) - فلترة حسب المسوق
start_date (optional) - تاريخ البداية (YYYY-MM-DD)
end_date (optional) - تاريخ النهاية (YYYY-MM-DD)
```

#### Request Example
```bash
GET /api/marketer-payments?marketer_id=1
Authorization: Bearer YOUR_TOKEN
```

#### Response Structure
```json
{
    "success": true,
    "data": {
        "grouped_payments": [
            {
                "payment_date": "2024-10-24T00:00:00.000Z",
                "payments": [
                    {
                        "id": 123,
                        "order_id": 11654,
                        "marketer_id": 1,
                        "commission": "150.00",
                        "notes": null,
                        "payment_date": "2024-10-24T08:30:00.000Z",
                        "created_by": 5,
                        "marketer": {
                            "id": 1,
                            "name": "محمد المسوق",
                            "phone": "01666666666"
                        },
                        "order": {
                            "id": 11654,
                            "order_code": "ORD-11654",
                            "customer_name": "محمد محمود معوض",
                            "phone": "01234567890",
                            "phone_two": "01111111111",
                            "address": "الجيزة - 6 أكتوبر",
                            "city": "الجيزة",
                            "date_time": "2024-10-20T10:00:00.000Z",
                            "nameAdd": "أحمد",
                            "nameEdit": null,
                            "sells": true,
                            "mandobe": true,
                            "total": "3350.00",
                            "shipping": "50.00",
                            "status": "accept",
                            "notes": "توصيل صباحاً",
                            "mandobe_id": 2,
                            "marketer_id": 1,
                            "created_at": "2024-10-20T10:30:00.000Z",
                            "details": [
                                {
                                    "id": 1,
                                    "order_id": 11654,
                                    "product_id": 5,
                                    "quantity": 2,
                                    "price": "1500.00",
                                    "product": {
                                        "id": 5,
                                        "code": "PROD-005",
                                        "name": "قميص قطن",
                                        "price": "1500.00"
                                    }
                                },
                                {
                                    "id": 2,
                                    "order_id": 11654,
                                    "product_id": 8,
                                    "quantity": 1,
                                    "price": "350.00",
                                    "product": {
                                        "id": 8,
                                        "code": "PROD-008",
                                        "name": "بنطلون جينز",
                                        "price": "350.00"
                                    }
                                }
                            ],
                            "mandobeUser": {
                                "id": 2,
                                "name": "أحمد المندوب",
                                "phone": "01555555555"
                            },
                            "marketer": {
                                "id": 1,
                                "name": "محمد المسوق",
                                "phone": "01666666666"
                            }
                        }
                    }
                ],
                "total_commission": 150.00,
                "count": 1
            }
        ],
        "total_payments": 1,
        "total_groups": 1,
        "total_commission": 150.00
    },
    "message": "Data retrieved successfully",
    "timestamp": "2024-10-24T08:00:00.000Z"
}
```

---

### 2. GET /api/marketer-payments/by-month

عرض عمولات المسوقين مجموعة حسب الشهر مع تفاصيل الفواتير كاملة.

#### Query Parameters
```
marketer_id (optional) - فلترة حسب المسوق
year (optional) - السنة (YYYY)
```

#### Request Example
```bash
GET /api/marketer-payments/by-month?marketer_id=1&year=2024
Authorization: Bearer YOUR_TOKEN
```

#### Response Structure
```json
{
    "success": true,
    "data": {
        "months": [
            {
                "month": "2024-10",
                "monthName": "أكتوبر 2024",
                "payments": [
                    {
                        "id": 123,
                        "order_id": 11654,
                        "marketer_id": 1,
                        "commission": "150.00",
                        "payment_date": "2024-10-24T08:30:00.000Z",
                        "marketer": {
                            "id": 1,
                            "name": "محمد المسوق",
                            "phone": "01666666666"
                        },
                        "order": {
                            // نفس البنية الكاملة كما في المثال السابق
                            "id": 11654,
                            "order_code": "ORD-11654",
                            "customer_name": "محمد محمود معوض",
                            "details": [...],
                            "mandobeUser": {...},
                            "marketer": {...}
                        }
                    }
                ],
                "totalCommission": 150.00,
                "count": 1
            }
        ],
        "totalPayments": 1,
        "totalCommission": 150.00
    },
    "message": "Data retrieved successfully",
    "timestamp": "2024-10-24T08:00:00.000Z"
}
```

---

## 📦 البيانات المتاحة في Order

### معلومات الطلب الأساسية
- `id` - رقم الطلب
- `order_code` - كود الطلب
- `customer_name` - اسم العميل
- `phone` - رقم الهاتف الأساسي
- `phone_two` - رقم الهاتف الثاني
- `address` - العنوان
- `city` - المدينة
- `total` - إجمالي الطلب
- `shipping` - مصاريف الشحن
- `status` - حالة الطلب (pending, accept, refuse, delay)
- `notes` - ملاحظات
- `created_at` - تاريخ إنشاء الطلب
- `date_time` - تاريخ التسليم

### معلومات إضافية
- `nameAdd` - اسم من أضاف الطلب
- `nameEdit` - اسم من عدل الطلب
- `sells` - حالة دفع العمولة (true/false)
- `mandobe` - هل تم التسليم (true/false)
- `mandobe_id` - رقم المندوب
- `marketer_id` - رقم المسوق

### تفاصيل المنتجات (details)
كل عنصر في `details` يحتوي على:
- `id` - رقم تفاصيل الطلب
- `order_id` - رقم الطلب
- `product_id` - رقم المنتج
- `quantity` - الكمية
- `price` - السعر
- `product` - بيانات المنتج:
  - `id` - رقم المنتج
  - `code` - كود المنتج
  - `name` - اسم المنتج
  - `price` - سعر المنتج

### المندوب (mandobeUser)
- `id` - رقم المندوب
- `name` - اسم المندوب
- `phone` - رقم هاتف المندوب

### المسوق (marketer)
- `id` - رقم المسوق
- `name` - اسم المسوق
- `phone` - رقم هاتف المسوق

---

## 💻 استخدام في Flutter

### Model للـ Order Details

```dart
class OrderDetail {
  final int id;
  final int orderId;
  final int productId;
  final int quantity;
  final double price;
  final Product product;

  OrderDetail({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.quantity,
    required this.price,
    required this.product,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    return OrderDetail(
      id: json['id'],
      orderId: json['order_id'],
      productId: json['product_id'],
      quantity: json['quantity'],
      price: double.parse(json['price'] ?? '0'),
      product: Product.fromJson(json['product']),
    );
  }
}

class Product {
  final int id;
  final String code;
  final String name;
  final double price;

  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.price,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      code: json['code'],
      name: json['name'],
      price: double.parse(json['price'] ?? '0'),
    );
  }
}
```

### Model للـ Order الكامل

```dart
class FullOrder {
  final int id;
  final String? orderCode;
  final String customerName;
  final String phone;
  final String? phoneTwo;
  final String? address;
  final String? city;
  final double total;
  final double? shipping;
  final String status;
  final String? notes;
  final DateTime createdAt;
  final List<OrderDetail> details;
  final Mandobe? mandobeUser;
  final Marketer? marketer;

  FullOrder({
    required this.id,
    this.orderCode,
    required this.customerName,
    required this.phone,
    this.phoneTwo,
    this.address,
    this.city,
    required this.total,
    this.shipping,
    required this.status,
    this.notes,
    required this.createdAt,
    required this.details,
    this.mandobeUser,
    this.marketer,
  });

  factory FullOrder.fromJson(Map<String, dynamic> json) {
    return FullOrder(
      id: json['id'],
      orderCode: json['order_code'],
      customerName: json['customer_name'],
      phone: json['phone'],
      phoneTwo: json['phone_two'],
      address: json['address'],
      city: json['city'],
      total: double.parse(json['total'] ?? '0'),
      shipping: json['shipping'] != null 
          ? double.parse(json['shipping']) 
          : null,
      status: json['status'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
      details: (json['details'] as List?)
          ?.map((d) => OrderDetail.fromJson(d))
          .toList() ?? [],
      mandobeUser: json['mandobeUser'] != null 
          ? Mandobe.fromJson(json['mandobeUser']) 
          : null,
      marketer: json['marketer'] != null 
          ? Marketer.fromJson(json['marketer']) 
          : null,
    );
  }

  // حساب الإجمالي النهائي مع الشحن
  double get finalTotal => total + (shipping ?? 0);

  // حساب عدد المنتجات
  int get totalItems => details.fold(0, (sum, item) => sum + item.quantity);
}
```

### عرض تفاصيل الفاتورة في UI

```dart
class OrderDetailsWidget extends StatelessWidget {
  final FullOrder order;

  const OrderDetailsWidget({Key? key, required this.order}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(16),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // معلومات الفاتورة
            Text(
              'فاتورة: ${order.orderCode ?? "بدون كود"}',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            
            Text('العميل: ${order.customerName}'),
            Text('الهاتف: ${order.phone}'),
            if (order.address != null) Text('العنوان: ${order.address}'),
            if (order.city != null) Text('المدينة: ${order.city}'),
            
            Divider(height: 24),
            
            // المنتجات
            Text(
              'المنتجات:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            
            ...order.details.map((detail) => ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(detail.product.name),
              subtitle: Text('${detail.quantity} × ${detail.price} جنيه'),
              trailing: Text(
                '${(detail.quantity * detail.price).toStringAsFixed(2)} جنيه',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            )),
            
            Divider(height: 24),
            
            // الإجمالي
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
                Text(
                  'الإجمالي النهائي:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  '${order.finalTotal.toStringAsFixed(2)} جنيه',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            
            if (order.mandobeUser != null) ...[
              Divider(height: 24),
              Text('المندوب: ${order.mandobeUser!.name}'),
              Text('هاتف المندوب: ${order.mandobeUser!.phone}'),
            ],
          ],
        ),
      ),
    );
  }
}
```

---

## 🧮 حساب الإجماليات

### إجمالي الطلب
```dart
double orderSubtotal = order.details.fold(
  0.0, 
  (sum, detail) => sum + (detail.quantity * detail.price)
);
```

### الإجمالي مع الشحن
```dart
double finalTotal = order.total + (order.shipping ?? 0);
```

### عدد المنتجات
```dart
int totalItems = order.details.fold(
  0, 
  (sum, detail) => sum + detail.quantity
);
```

---

## 📊 أمثلة حالات الاستخدام

### 1. عرض قائمة العمولات مع تفاصيل الفواتير
```dart
Future<void> loadCommissions() async {
  final response = await dio.get(
    '/api/marketer-payments',
    queryParameters: {'marketer_id': marketerId},
  );
  
  final groupedPayments = response.data['data']['grouped_payments'];
  
  for (var group in groupedPayments) {
    print('التاريخ: ${group['payment_date']}');
    
    for (var payment in group['payments']) {
      final order = FullOrder.fromJson(payment['order']);
      print('  - فاتورة: ${order.orderCode}');
      print('    العميل: ${order.customerName}');
      print('    المنتجات: ${order.totalItems}');
      print('    الإجمالي: ${order.finalTotal} جنيه');
      print('    العمولة: ${payment['commission']} جنيه');
    }
  }
}
```

### 2. طباعة فاتورة كاملة
```dart
void printInvoice(FullOrder order) {
  final pdf = pw.Document();
  
  pdf.addPage(
    pw.Page(
      build: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text('فاتورة: ${order.orderCode}'),
          pw.Text('العميل: ${order.customerName}'),
          pw.Divider(),
          
          // المنتجات
          ...order.details.map((detail) => pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text(detail.product.name),
              pw.Text('${detail.quantity} × ${detail.price}'),
              pw.Text('${detail.quantity * detail.price}'),
            ],
          )),
          
          pw.Divider(),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('المجموع:'),
              pw.Text('${order.total}'),
            ],
          ),
          
          if (order.shipping != null)
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('الشحن:'),
                pw.Text('${order.shipping}'),
              ],
            ),
          
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('الإجمالي:', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Text('${order.finalTotal}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            ],
          ),
        ],
      ),
    ),
  );
  
  // حفظ أو طباعة الـ PDF
}
```

---

## ✅ ما تم تحديثه

- ✅ `GET /api/marketer-payments` - الآن يُرجع Order كامل مع details
- ✅ `GET /api/marketer-payments/by-month` - الآن يُرجع Order كامل مع details
- ✅ إضافة OrderDetail مع بيانات المنتجات
- ✅ إضافة بيانات المندوب والمسوق
- ✅ جميع حقول Order متاحة الآن

---

## ⚠️ ملاحظات

### الحقول الاختيارية (nullable)
بعض الحقول يمكن أن تكون `null`:
- `order_code`
- `phone_two`
- `address`
- `city`
- `shipping`
- `notes`
- `mandobeUser`
- `date_time`

تأكد من التعامل معها بشكل صحيح في Flutter.

### حجم البيانات
نظراً لأن Response الآن يحتوي على تفاصيل أكثر، قد يكون حجم البيانات أكبر. استخدم:
- Pagination إذا لزم الأمر
- Filters (marketer_id, start_date, end_date) لتقليل البيانات

---

**تم التحديث:** 24 أكتوبر 2024  
**الإصدار:** 2.0.0
