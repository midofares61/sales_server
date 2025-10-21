# Marketer Payments API

## نظام حساب عمولات المسوقين

يوفر هذا النظام إمكانية حساب وتسجيل عمولات المسوقين على الطلبات.

---

## 1. معالجة عمولات متعددة (Bulk Processing)

**POST** `/api/marketer-payments/bulk`

### الوصف
يستقبل مجموعة من الطلبات مع العمولات الخاصة بها ويقوم بـ:
- حفظ سجل العمولة
- تحديث `Order.sells = true` للدلالة على أن الطلب تم حسابه

### Request Body
```json
{
  "payments": [
    {
      "order_id": 123,
      "marketer_id": 5,
      "commission": 150.50,
      "notes": "عمولة شهر أكتوبر"
    },
    {
      "order_id": 124,
      "marketer_id": 5,
      "commission": 200.00
    },
    {
      "order_id": 125,
      "marketer_id": 3,
      "commission": 175.25
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      {
        "order_id": 123,
        "marketer_id": 5,
        "commission": 150.50,
        "payment_id": 1,
        "status": "success"
      },
      {
        "order_id": 124,
        "marketer_id": 5,
        "commission": 200.00,
        "payment_id": 2,
        "status": "success"
      },
      {
        "order_id": 125,
        "marketer_id": 3,
        "commission": 175.25,
        "payment_id": 3,
        "status": "success"
      }
    ],
    "errors": []
  },
  "message": "Payments processed successfully"
}
```

### في حالة وجود أخطاء
```json
{
  "success": true,
  "data": {
    "processed": 2,
    "failed": 1,
    "results": [...],
    "errors": [
      {
        "order_id": 126,
        "error": "Order not found"
      }
    ]
  }
}
```

### الأخطاء المحتملة
- `Order not found` - الطلب غير موجود
- `Marketer not found` - المسوق غير موجود
- `Payment already recorded for this order` - تم تسجيل عمولة لهذا الطلب مسبقاً
- `Missing required fields` - حقول مطلوبة ناقصة

---

## 2. عرض العمولات مقسمة حسب الشهر

**GET** `/api/marketer-payments/by-month`

### Query Parameters
- `marketer_id` (optional) - فلترة حسب المسوق
- `year` (optional) - فلترة حسب السنة (مثل 2025)

### مثال
```
GET /api/marketer-payments/by-month?marketer_id=1&year=2025
```

### Response
```json
{
  "success": true,
  "data": {
    "months": [
      {
        "month": "2025-10",
        "monthName": "أكتوبر 2025",
        "payments": [
          {
            "id": 1,
            "marketer_id": 1,
            "order_id": 11654,
            "commission": "10.00",
            "payment_date": "2025-10-21T09:57:46.000Z",
            "notes": "عمولة 10/2025",
            "created_by": null,
            "created_at": "2025-10-21T09:57:46.000Z",
            "marketer": {
              "id": 1,
              "name": "025",
              "phone": "0"
            },
            "order": {
              "id": 11654,
              "order_code": null,
              "customer_name": "محمد محمود معوض",
              "total": "3350.00"
            }
          }
        ],
        "totalCommission": 150.50,
        "count": 5
      },
      {
        "month": "2025-09",
        "monthName": "سبتمبر 2025",
        "payments": [
          // ... عمولات شهر سبتمبر
        ],
        "totalCommission": 2100.00,
        "count": 20
      }
    ],
    "totalPayments": 25,
    "totalCommission": 2250.50
  }
}
```

---

## 3. عرض العمولات المسجلة

**GET** `/api/marketer-payments`

### Query Parameters
- `marketer_id` (optional) - فلترة حسب المسوق
- `start_date` (optional) - من تاريخ (YYYY-MM-DD)
- `end_date` (optional) - إلى تاريخ (YYYY-MM-DD)

### مثال
```
GET /api/marketer-payments?marketer_id=5&start_date=2025-10-01&end_date=2025-10-31
```

### Response
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "marketer_id": 5,
        "order_id": 123,
        "commission": "150.50",
        "payment_date": "2025-10-21T12:00:00.000Z",
        "notes": "عمولة شهر أكتوبر",
        "created_by": 1,
        "marketer": {
          "id": 5,
          "name": "أحمد محمد",
          "phone": "01234567890"
        },
        "order": {
          "id": 123,
          "order_code": "1234",
          "customer_name": "عميل تجريبي",
          "total": "500.00"
        }
      }
    ],
    "total": 1,
    "totalCommission": 150.50
  }
}
```

---

## 4. إحصائيات العمولات

**GET** `/api/marketer-payments/stats`

### Query Parameters
- `marketer_id` (optional) - فلترة حسب المسوق
- `month` (optional) - رقم الشهر (1-12)
- `year` (optional) - السنة (مثل 2025)

### مثال
```
GET /api/marketer-payments/stats?month=10&year=2025
```

### Response
```json
{
  "success": true,
  "data": {
    "total_payments": 15,
    "total_commission": 2500.75,
    "by_marketer": [
      {
        "marketer_id": 5,
        "marketer_name": "أحمد محمد",
        "total_commission": 1500.50,
        "order_count": 10
      },
      {
        "marketer_id": 3,
        "marketer_name": "محمد علي",
        "total_commission": 1000.25,
        "order_count": 5
      }
    ]
  }
}
```

---

## 5. حذف سجل عمولة (Undo Payment)

**DELETE** `/api/marketer-payments/:id`

### الوصف
يحذف سجل العمولة ويعيد `Order.sells` إلى `false`

### مثال
```
DELETE /api/marketer-payments/1
```

### Response
```json
{
  "success": true,
  "data": null,
  "message": "Payment deleted successfully"
}
```

---

## الصلاحيات (Permissions)

جميع الـ endpoints تتطلب:
- ✅ **Authentication**: يجب تسجيل الدخول
- ✅ **Authorization**: صلاحية `admin` فقط

---

## قاعدة البيانات

### جدول `marketer_payments`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | المعرف الفريد |
| marketer_id | INT | معرف المسوق |
| order_id | INT | معرف الطلب |
| commission | DECIMAL(10,2) | قيمة العمولة |
| payment_date | DATE | تاريخ الدفع |
| notes | TEXT | ملاحظات اختيارية |
| created_by | INT | المستخدم الذي سجل العمولة |
| created_at | TIMESTAMP | وقت الإنشاء |

### العلاقات (Relations)
- `marketer_payments.marketer_id` → `marketers.id`
- `marketer_payments.order_id` → `orders.id`
- `marketer_payments.created_by` → `users.id`

---

## سيناريو الاستخدام

### الخطوات لحساب المسوقين نهاية الشهر:

1. **الحصول على الطلبات غير المحسوبة**
   ```
   GET /api/orders?sells=unPaid&month=10&year=2025
   ```

2. **حساب العمولات** (في التطبيق)
   - لكل طلب، احسب العمولة المناسبة

3. **إرسال العمولات للسيرفر**
   ```json
   POST /api/marketer-payments/bulk
   {
     "payments": [...]
   }
   ```

4. **مراجعة الإحصائيات**
   ```
   GET /api/marketer-payments/stats?month=10&year=2025
   ```

5. **في حالة الخطأ - التراجع**
   ```
   DELETE /api/marketer-payments/:id
   ```
