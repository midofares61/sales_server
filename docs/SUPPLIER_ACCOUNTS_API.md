# Supplier Accounts API

## نظام إدارة حسابات الموردين

يوفر هذا النظام إدارة كاملة لحسابات الموردين بما في ذلك:
- 📦 **فواتير الشراء**: تسجيل فواتير شراء المنتجات من الموردين
- 💰 **الدفعات**: تسجيل المدفوعات للموردين
- 📊 **كشف الحساب**: عرض تفصيلي لجميع المعاملات
- ⚖️ **الرصيد**: تتبع تلقائي لرصيد كل مورد

---

## المفاهيم الأساسية

### الرصيد (Balance)
- **موجب (+)**: نحن مدينون للمورد (ليه فلوس علينا)
- **سالب (-)**: المورد مدين لنا (علينا فلوس له)
- يتم تحديث الرصيد تلقائياً مع كل فاتورة أو دفعة

### المعاملات (Transactions)
- **مدين (Debit)**: فواتير الشراء (تزيد الرصيد)
- **دائن (Credit)**: الدفعات (تقلل الرصيد)

---

## 1. إنشاء فاتورة شراء

**POST** `/api/supplier-orders`

### الوصف
- يسجل فاتورة شراء من المورد
- يضيف الكميات للمنتجات تلقائياً
- يزيد رصيد المورد بقيمة الفاتورة

### Request Body
```json
{
  "supplier_id": 1,
  "type": "مراتب",
  "details": [
    {
      "product_id": 5,
      "quantity": 100,
      "price": 50.00
    },
    {
      "product_id": 8,
      "quantity": 50,
      "price": 75.00
    }
  ],
  "notes": "فاتورة شراء شهر أكتوبر",
  "date_time": "2025-10-21T10:00:00.000Z"
}
```

### الحقول
- `supplier_id` (required) - معرف المورد
- `type` (optional) - نوع الفاتورة (نص حر، مثل: مراتب، اكسسوارات، مواد خام)
- `details` (required) - تفاصيل المنتجات
- `notes` (optional) - ملاحظات
- `date_time` (optional) - تاريخ الفاتورة (افتراضي: الآن)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "supplier_id": 1,
    "total": "8750.00",
    "status": "completed",
    "notes": "فاتورة شراء شهر أكتوبر",
    "date_time": "2025-10-21T10:00:00.000Z",
    "created_by": 1,
    "details": [
      {
        "id": 1,
        "supplier_order_id": 1,
        "product_id": 5,
        "quantity": 100,
        "price": "50.00",
        "total": "5000.00",
        "product": {
          "id": 5,
          "code": "P005",
          "name": "منتج تجريبي"
        }
      },
      {
        "id": 2,
        "supplier_order_id": 1,
        "product_id": 8,
        "quantity": 50,
        "price": "75.00",
        "total": "3750.00",
        "product": {
          "id": 8,
          "code": "P008",
          "name": "منتج آخر"
        }
      }
    ],
    "supplier": {
      "id": 1,
      "name": "مورد المراتب",
      "balance": "8750.00"
    }
  },
  "message": "Supplier order created successfully"
}
```

### التأثيرات
- ✅ **المخزون**: يتم زيادة كمية كل منتج بالكمية المحددة
- ✅ **الرصيد**: يزيد رصيد المورد بإجمالي الفاتورة
- ✅ **السجل**: يتم حفظ الفاتورة في النظام

---

## 2. عرض فواتير الشراء

**GET** `/api/supplier-orders`

### Query Parameters
- `supplier_id` (optional) - فلترة حسب المورد
- `start_date` (optional) - من تاريخ
- `end_date` (optional) - إلى تاريخ

### مثال
```
GET /api/supplier-orders?supplier_id=1&start_date=2025-10-01&end_date=2025-10-31
```

### Response
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "supplier_id": 1,
        "total": "8750.00",
        "status": "completed",
        "notes": "فاتورة شهر أكتوبر",
        "date_time": "2025-10-21T10:00:00.000Z",
        "details": [...],
        "supplier": {
          "id": 1,
          "name": "مورد المراتب"
        },
        "creator": {
          "id": 1,
          "name": "Admin"
        }
      }
    ],
    "total": 1
  }
}
```

---

## 3. إضافة دفعة للمورد

**POST** `/api/supplier-payments`

### الوصف
- يسجل دفعة للمورد
- يقلل رصيد المورد بقيمة الدفعة

### Request Body
```json
{
  "supplier_id": 1,
  "amount": 5000.00,
  "type": "نقدي",
  "note": "دفعة على الحساب",
  "date_time": "2025-10-21T12:00:00.000Z"
}
```

### الحقول
- `supplier_id` (required) - معرف المورد
- `amount` (required) - قيمة الدفعة
- `type` (optional) - نوع الدفعة (نص حر، مثل: نقدي، شيك، تحويل بنكي، فيزا)
- `note` (optional) - ملاحظات
- `date_time` (optional) - تاريخ الدفعة (افتراضي: الآن)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "supplier_id": 1,
    "amount": "5000.00",
    "note": "دفعة على الحساب",
    "date_time": "2025-10-21T12:00:00.000Z",
    "created_by": 1,
    "supplier": {
      "id": 1,
      "name": "مورد المراتب",
      "balance": "3750.00"
    },
    "creator": {
      "id": 1,
      "name": "Admin"
    }
  },
  "message": "Payment added successfully"
}
```

---

## 4. عرض الدفعات

**GET** `/api/supplier-payments`

### Query Parameters
- `supplier_id` (optional) - فلترة حسب المورد
- `start_date` (optional) - من تاريخ
- `end_date` (optional) - إلى تاريخ

### مثال
```
GET /api/supplier-payments?supplier_id=1
```

---

## 5. كشف حساب المورد (Statement)

**GET** `/api/suppliers/:supplier_id/statement`

### الوصف
يعرض جميع معاملات المورد (فواتير + دفعات) مرتبة زمنياً مع رصيد متحرك

### Query Parameters
- `start_date` (optional) - من تاريخ
- `end_date` (optional) - إلى تاريخ

### مثال
```
GET /api/suppliers/1/statement?start_date=2025-10-01&end_date=2025-10-31
```

### Response
```json
{
  "success": true,
  "data": {
    "supplier": {
      "id": 1,
      "name": "مورد المراتب",
      "phone": "01234567890",
      "current_balance": 3750.00
    },
    "transactions": [
      {
        "id": 1,
        "type": "order",
        "date_time": "2025-10-21T10:00:00.000Z",
        "amount": 8750.00,
        "debit": 8750.00,
        "credit": 0,
        "notes": "فاتورة شهر أكتوبر",
        "balance": 8750.00,
        "details": [
          {
            "product": {
              "id": 5,
              "code": "P005",
              "name": "منتج تجريبي"
            },
            "quantity": 100,
            "price": "50.00",
            "total": "5000.00"
          }
        ],
        "created_by": "Admin"
      },
      {
        "id": 1,
        "type": "payment",
        "date_time": "2025-10-21T12:00:00.000Z",
        "amount": 5000.00,
        "debit": 0,
        "credit": 5000.00,
        "note": "دفعة على الحساب",
        "balance": 3750.00,
        "created_by": "Admin"
      }
    ],
    "summary": {
      "total_orders": 1,
      "total_payments": 1,
      "total_debit": 8750.00,
      "total_credit": 5000.00,
      "net_balance": 3750.00
    }
  }
}
```

### فهم كشف الحساب

| العمود | الوصف |
|--------|-------|
| **type** | نوع المعاملة: `order` (فاتورة) أو `payment` (دفعة) |
| **debit** | مدين (فواتير الشراء) |
| **credit** | دائن (الدفعات) |
| **balance** | الرصيد المتحرك بعد كل معاملة |

---

## 6. حذف فاتورة (Undo)

**DELETE** `/api/supplier-orders/:id`

### الوصف
- يحذف الفاتورة
- يعيد كميات المنتجات كما كانت
- يعيد رصيد المورد

---

## 7. حذف دفعة (Undo)

**DELETE** `/api/supplier-payments/:id`

### الوصف
- يحذف الدفعة
- يعيد رصيد المورد

---

## الصلاحيات (Permissions)

جميع الـ endpoints تتطلب:
- ✅ **Authentication**: يجب تسجيل الدخول
- ✅ **Authorization**: صلاحية `admin` فقط

---

## قاعدة البيانات

### جدول `supplier_orders`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | المعرف الفريد |
| supplier_id | INT | معرف المورد |
| total | DECIMAL(15,2) | إجمالي الفاتورة |
| status | ENUM | الحالة (completed/pending/cancelled) |
| notes | TEXT | ملاحظات |
| date_time | DATE | تاريخ الفاتورة |
| created_by | INT | المستخدم الذي أنشأ الفاتورة |

### جدول `supplier_order_details`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | المعرف الفريد |
| supplier_order_id | INT | معرف الفاتورة |
| product_id | INT | معرف المنتج |
| quantity | INT | الكمية |
| price | DECIMAL(10,2) | سعر الوحدة |
| total | DECIMAL(15,2) | الإجمالي |

### جدول `supplier_payments`
| Column | Type | Description |
|--------|------|-------------|
| id | INT | المعرف الفريد |
| supplier_id | INT | معرف المورد |
| amount | DECIMAL(15,2) | قيمة الدفعة |
| note | TEXT | ملاحظات |
| date_time | DATE | تاريخ الدفعة |
| created_by | INT | المستخدم الذي أنشأ الدفعة |

### جدول `suppliers`
| Column | Type | Description |
|--------|------|-------------|
| balance | DECIMAL(15,2) | الرصيد الحالي |

---

## سيناريو الاستخدام الكامل

### 1. شراء منتجات من مورد
```json
POST /api/supplier-orders
{
  "supplier_id": 1,
  "details": [
    {"product_id": 5, "quantity": 100, "price": 50.00}
  ],
  "notes": "شحنة جديدة"
}
```
**النتيجة**: 
- المخزون: منتج 5 زاد بمقدار 100
- الرصيد: المورد أصبح له 5000 جنيه

### 2. دفع للمورد
```json
POST /api/supplier-payments
{
  "supplier_id": 1,
  "amount": 3000.00,
  "note": "دفعة جزئية"
}
```
**النتيجة**: 
- الرصيد: المورد أصبح له 2000 جنيه

### 3. مراجعة الحساب
```
GET /api/suppliers/1/statement
```
**النتيجة**: كشف حساب كامل بجميع المعاملات والرصيد المتحرك
