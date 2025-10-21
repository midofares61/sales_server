# Socket.io Events Documentation

## Order Events

### 1. ORDER_NEW - إنشاء فاتورة جديدة
يتم إرسال هذا الحدث عند إنشاء فاتورة جديدة.

**Event Name:** `order:new`

**Payload:**
```javascript
{
  order: {
    id: 123,
    orderCode: "1001",
    customer_name: "أحمد محمد",
    phone: "0123456789",
    city: "القاهرة",
    status: "pending",
    total: 500,
    details: [...],
    mandobeName: "علي",
    code: "مسوق1",
    // ... all order fields
  },
  createdBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

**مثال في Flutter/Client:**
```javascript
socket.on('order:new', (data) => {
  console.log('فاتورة جديدة تم إنشاؤها:', data.order);
  console.log('تم الإنشاء بواسطة:', data.createdBy);
  // تحديث قائمة الفواتير
});
```

---

### 2. ORDER_UPDATED - تحديث فاتورة
يتم إرسال هذا الحدث عند تحديث فاتورة (بيانات كاملة + التغييرات).

**Event Name:** `order:updated`

**Payload:**
```javascript
{
  order: {
    id: 123,
    orderCode: "1001",
    customer_name: "أحمد محمد",
    phone: "0123456789",
    city: "الإسكندرية", // تم التغيير
    status: "accept", // تم التغيير
    total: 600, // تم التغيير
    details: [...],
    // ... all order fields
  },
  changes: {
    city: {
      old: "القاهرة",
      new: "الإسكندرية"
    },
    status: {
      old: "pending",
      new: "accept"
    },
    total: {
      old: 500,
      new: 600
    },
    details: {
      old: [...],
      new: [...]
    }
  },
  updatedBy: "admin",
  timestamp: "2024-01-01T12:30:00.000Z"
}
```

**مثال في Flutter/Client:**
```javascript
socket.on('order:updated', (data) => {
  console.log('فاتورة محدثة:', data.order);
  console.log('التغييرات:', data.changes);
  console.log('تم التحديث بواسطة:', data.updatedBy);
  
  // عرض التغييرات للمستخدم
  Object.keys(data.changes).forEach(field => {
    const change = data.changes[field];
    console.log(`${field} تغير من ${change.old} إلى ${change.new}`);
  });
  
  // تحديث الفاتورة في القائمة
});
```

---

### 3. ORDER_DELETED - حذف فاتورة
يتم إرسال هذا الحدث عند حذف فاتورة (يحتوي على بيانات الفاتورة المحذوفة).

**Event Name:** `order:deleted`

**Payload:**
```javascript
{
  order: {
    id: 123,
    orderCode: "1001",
    customer_name: "أحمد محمد",
    // ... all order fields before deletion
  },
  deletedBy: "admin",
  timestamp: "2024-01-01T13:00:00.000Z"
}
```

**مثال في Flutter/Client:**
```javascript
socket.on('order:deleted', (data) => {
  console.log('فاتورة محذوفة:', data.order);
  console.log('تم الحذف بواسطة:', data.deletedBy);
  // حذف الفاتورة من القائمة
});
```

---

## أنواع التحديثات المختلفة

### 1. تحديث الحالة (Status)
عند تحديث حالة الفاتورة فقط:
```javascript
{
  order: { /* البيانات الكاملة */ },
  changes: {
    status: {
      old: "pending",
      new: "accept"
    }
  },
  updatedBy: "admin"
}
```

### 2. تحديث المندوب (Mandobe)
عند تحديث المندوب فقط:
```javascript
{
  order: { /* البيانات الكاملة */ },
  changes: {
    mandobe_id: {
      old: 1,
      new: 2
    },
    mandobeName: {
      old: "علي",
      new: "محمد"
    }
  },
  updatedBy: "admin"
}
```

### 3. تحديث حالة الدفع (Payment)
عند تحديث حالة العمولة:
```javascript
{
  order: { /* البيانات الكاملة */ },
  changes: {
    sells: {
      old: false,
      new: true
    }
  },
  updatedBy: "admin"
}
```

### 4. تحديث كامل (Full Update)
عند تحديث عدة حقول:
```javascript
{
  order: { /* البيانات الكاملة */ },
  changes: {
    customer_name: { old: "أحمد", new: "محمد أحمد" },
    city: { old: "القاهرة", new: "الإسكندرية" },
    total: { old: 500, new: 600 },
    details: { old: [...], new: [...] }
  },
  updatedBy: "admin"
}
```

---

## استخدام في Flutter

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  late IO.Socket socket;
  
  void connect() {
    socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    
    socket.connect();
    
    // Listen to order events
    socket.on('order:new', (data) {
      final order = data['order'];
      final createdBy = data['createdBy'];
      print('New order: $order, created by: $createdBy');
      // Update UI
    });
    
    socket.on('order:updated', (data) {
      final order = data['order'];
      final changes = data['changes'];
      final updatedBy = data['updatedBy'];
      
      print('Updated order: $order');
      print('Changes: $changes');
      print('Updated by: $updatedBy');
      
      // Show notification about changes
      if (changes['status'] != null) {
        print('Status changed from ${changes['status']['old']} to ${changes['status']['new']}');
      }
      
      // Update UI
    });
    
    socket.on('order:deleted', (data) {
      final order = data['order'];
      final deletedBy = data['deletedBy'];
      print('Deleted order: $order, deleted by: $deletedBy');
      // Remove from UI
    });
  }
  
  void disconnect() {
    socket.disconnect();
  }
}
```

---

## ملاحظات مهمة

1. **جميع الأحداث تحتوي على `timestamp`** - الوقت الذي حدث فيه التغيير
2. **البيانات الكاملة متاحة دائمًا** - لا حاجة لطلب إضافي من الـ API
3. **التغييرات واضحة** - يمكنك معرفة ما تغير بالضبط
4. **معلومات المستخدم** - تعرف من قام بالتغيير (createdBy, updatedBy, deletedBy)

---

---

## Product Events

### 1. PRODUCT_NEW - إنشاء منتج جديد
**Event Name:** `product:new`

**Payload:**
```javascript
{
  product: {
    id: 1,
    code: "P001",
    name: "منتج 1",
    count: 100,
    price: 50
  },
  createdBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### 2. PRODUCT_UPDATED - تحديث منتج
**Event Name:** `product:updated`

**Payload:**
```javascript
{
  product: { /* البيانات الكاملة بعد التحديث */ },
  changes: {
    name: { old: "منتج 1", new: "منتج محدث" },
    price: { old: 50, new: 60 }
  },
  updatedBy: "admin",
  timestamp: "2024-01-01T12:30:00.000Z"
}
```

### 3. PRODUCT_DELETED - حذف منتج
**Event Name:** `product:deleted`

**Payload:**
```javascript
{
  product: { /* البيانات الكاملة قبل الحذف */ },
  deletedBy: "admin",
  timestamp: "2024-01-01T13:00:00.000Z"
}
```

### 4. PRODUCT_STOCK_UPDATED - تحديث المخزون
**Event Name:** `product:stock_updated`

**Payload:**
```javascript
{
  product: { /* البيانات الكاملة */ },
  changes: {
    count: { old: 100, new: 90 },
    delta: -10
  },
  note: "بيع",
  updatedBy: "admin",
  timestamp: "2024-01-01T14:00:00.000Z"
}
```

---

## Marketer Events

### 1. MARKETER_NEW - إنشاء مسوق جديد
**Event Name:** `marketer:new`

**Payload:**
```javascript
{
  marketer: {
    id: 1,
    name: "مسوق 1",
    phone: "0123456789"
  },
  createdBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### 2. MARKETER_UPDATED - تحديث مسوق
**Event Name:** `marketer:updated`

**Payload:**
```javascript
{
  marketer: { /* البيانات الكاملة */ },
  changes: {
    name: { old: "مسوق 1", new: "مسوق محدث" }
  },
  updatedBy: "admin",
  timestamp: "2024-01-01T12:30:00.000Z"
}
```

### 3. MARKETER_DELETED - حذف مسوق
**Event Name:** `marketer:deleted`

**Payload:**
```javascript
{
  marketer: { /* البيانات الكاملة */ },
  deletedBy: "admin",
  timestamp: "2024-01-01T13:00:00.000Z"
}
```

---

## Mandobe Events

### 1. MANDOBE_NEW - إنشاء مندوب جديد
**Event Name:** `mandobe:new`

**Payload:**
```javascript
{
  mandobe: {
    id: 1,
    name: "مندوب 1",
    phone: "0123456789"
  },
  createdBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### 2. MANDOBE_UPDATED - تحديث مندوب
**Event Name:** `mandobe:updated`

**Payload:**
```javascript
{
  mandobe: { /* البيانات الكاملة */ },
  changes: {
    name: { old: "مندوب 1", new: "مندوب محدث" }
  },
  updatedBy: "admin",
  timestamp: "2024-01-01T12:30:00.000Z"
}
```

### 3. MANDOBE_DELETED - حذف مندوب
**Event Name:** `mandobe:deleted`

**Payload:**
```javascript
{
  mandobe: { /* البيانات الكاملة */ },
  deletedBy: "admin",
  timestamp: "2024-01-01T13:00:00.000Z"
}
```

---

## Supplier Events

### 1. SUPPLIER_NEW - إنشاء مورد جديد
**Event Name:** `supplier:new`

**Payload:**
```javascript
{
  supplier: {
    id: 1,
    name: "مورد 1",
    phone: "0123456789"
  },
  createdBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### 2. SUPPLIER_UPDATED - تحديث مورد
**Event Name:** `supplier:updated`

**Payload:**
```javascript
{
  supplier: { /* البيانات الكاملة */ },
  changes: {
    name: { old: "مورد 1", new: "مورد محدث" }
  },
  updatedBy: "admin",
  timestamp: "2024-01-01T12:30:00.000Z"
}
```

### 3. SUPPLIER_DELETED - حذف مورد
**Event Name:** `supplier:deleted`

**Payload:**
```javascript
{
  supplier: { /* البيانات الكاملة */ },
  deletedBy: "admin",
  timestamp: "2024-01-01T13:00:00.000Z"
}
```

---

## التطبيقات الممكنة

1. **إشعارات فورية** - عرض إشعار عند حدوث تغيير
2. **تحديث تلقائي للقوائم** - تحديث جميع القوائم دون الحاجة لإعادة تحميل
3. **عرض التغييرات** - إظهار ما تغير بالضبط (مثل: "الحالة تغيرت من معلق إلى مقبول")
4. **تتبع النشاط** - معرفة من قام بالتعديل ومتى
5. **مزامنة متعددة الأجهزة** - تحديث البيانات على جميع الأجهزة المتصلة
6. **تنبيهات المخزون** - تنبيه عند انخفاض مخزون منتج

---

## ملخص جميع Socket Events

| المورد | الحدث | Event Name | البيانات المرسلة |
|--------|------|-----------|------------------|
| **Orders** | إنشاء | `order:new` | `{ order, createdBy, timestamp }` |
| | تحديث | `order:updated` | `{ order, changes, updatedBy, timestamp }` |
| | حذف | `order:deleted` | `{ order, deletedBy, timestamp }` |
| **Products** | إنشاء | `product:new` | `{ product, createdBy, timestamp }` |
| | تحديث | `product:updated` | `{ product, changes, updatedBy, timestamp }` |
| | حذف | `product:deleted` | `{ product, deletedBy, timestamp }` |
| | تحديث مخزون | `product:stock_updated` | `{ product, changes, note, updatedBy, timestamp }` |
| **Marketers** | إنشاء | `marketer:new` | `{ marketer, createdBy, timestamp }` |
| | تحديث | `marketer:updated` | `{ marketer, changes, updatedBy, timestamp }` |
| | حذف | `marketer:deleted` | `{ marketer, deletedBy, timestamp }` |
| **Mandobes** | إنشاء | `mandobe:new` | `{ mandobe, createdBy, timestamp }` |
| | تحديث | `mandobe:updated` | `{ mandobe, changes, updatedBy, timestamp }` |
| | حذف | `mandobe:deleted` | `{ mandobe, deletedBy, timestamp }` |
| **Suppliers** | إنشاء | `supplier:new` | `{ supplier, createdBy, timestamp }` |
| | تحديث | `supplier:updated` | `{ supplier, changes, updatedBy, timestamp }` |
| | حذف | `supplier:deleted` | `{ supplier, deletedBy, timestamp }` |

### شكل البيانات الموحد

جميع الأحداث تتبع هذا النمط:

**للإنشاء:**
```javascript
{
  [resourceName]: { /* البيانات الكاملة */ },
  createdBy: "اسم المستخدم",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

**للتحديث:**
```javascript
{
  [resourceName]: { /* البيانات الكاملة بعد التحديث */ },
  changes: {
    fieldName: { old: "قيمة قديمة", new: "قيمة جديدة" }
  },
  updatedBy: "اسم المستخدم",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

**للحذف:**
```javascript
{
  [resourceName]: { /* البيانات الكاملة قبل الحذف */ },
  deletedBy: "اسم المستخدم",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```
