# Socket Events - مرجع سريع

## جميع الأحداث المتاحة

### Orders (الفواتير)
```javascript
// إنشاء فاتورة
socket.on('order:new', (data) => {
  // data: { order, createdBy, timestamp }
});

// تحديث فاتورة
socket.on('order:updated', (data) => {
  // data: { order, changes, updatedBy, timestamp }
});

// حذف فاتورة
socket.on('order:deleted', (data) => {
  // data: { order, deletedBy, timestamp }
});
```

### Products (المنتجات)
```javascript
// إنشاء منتج
socket.on('product:new', (data) => {
  // data: { product, createdBy, timestamp }
});

// تحديث منتج
socket.on('product:updated', (data) => {
  // data: { product, changes, updatedBy, timestamp }
});

// حذف منتج
socket.on('product:deleted', (data) => {
  // data: { product, deletedBy, timestamp }
});

// تحديث مخزون منتج
socket.on('product:stock_updated', (data) => {
  // data: { product, changes: { count, delta }, note, updatedBy, timestamp }
});
```

### Marketers (المسوقين)
```javascript
// إنشاء مسوق
socket.on('marketer:new', (data) => {
  // data: { marketer, createdBy, timestamp }
});

// تحديث مسوق
socket.on('marketer:updated', (data) => {
  // data: { marketer, changes, updatedBy, timestamp }
});

// حذف مسوق
socket.on('marketer:deleted', (data) => {
  // data: { marketer, deletedBy, timestamp }
});
```

### Mandobes (المندوبين)
```javascript
// إنشاء مندوب
socket.on('mandobe:new', (data) => {
  // data: { mandobe, createdBy, timestamp }
});

// تحديث مندوب
socket.on('mandobe:updated', (data) => {
  // data: { mandobe, changes, updatedBy, timestamp }
});

// حذف مندوب
socket.on('mandobe:deleted', (data) => {
  // data: { mandobe, deletedBy, timestamp }
});
```

### Suppliers (الموردين)
```javascript
// إنشاء مورد
socket.on('supplier:new', (data) => {
  // data: { supplier, createdBy, timestamp }
});

// تحديث مورد
socket.on('supplier:updated', (data) => {
  // data: { supplier, changes, updatedBy, timestamp }
});

// حذف مورد
socket.on('supplier:deleted', (data) => {
  // data: { supplier, deletedBy, timestamp }
});
```

---

## مثال تطبيق شامل

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

// الاتصال
socket.on('connect', () => {
  console.log('متصل بالسيرفر');
});

// الفواتير
socket.on('order:new', (data) => {
  console.log('فاتورة جديدة:', data.order);
  // تحديث القائمة
  addOrderToList(data.order);
});

socket.on('order:updated', (data) => {
  console.log('فاتورة محدثة:', data.order);
  console.log('التغييرات:', data.changes);
  // تحديث الفاتورة في القائمة
  updateOrderInList(data.order);
  
  // عرض التغييرات
  if (data.changes.status) {
    showNotification(`الحالة تغيرت من ${data.changes.status.old} إلى ${data.changes.status.new}`);
  }
});

socket.on('order:deleted', (data) => {
  console.log('فاتورة محذوفة:', data.order.id);
  // حذف من القائمة
  removeOrderFromList(data.order.id);
});

// المنتجات
socket.on('product:new', (data) => {
  addProductToList(data.product);
});

socket.on('product:updated', (data) => {
  updateProductInList(data.product);
});

socket.on('product:stock_updated', (data) => {
  updateProductInList(data.product);
  if (data.product.count < 10) {
    showWarning(`المخزون منخفض: ${data.product.name} (${data.product.count})`);
  }
});

socket.on('product:deleted', (data) => {
  removeProductFromList(data.product.id);
});

// المسوقين
socket.on('marketer:new', (data) => {
  addMarketerToList(data.marketer);
});

socket.on('marketer:updated', (data) => {
  updateMarketerInList(data.marketer);
});

socket.on('marketer:deleted', (data) => {
  removeMarketerFromList(data.marketer.id);
});

// المندوبين
socket.on('mandobe:new', (data) => {
  addMandobeToList(data.mandobe);
});

socket.on('mandobe:updated', (data) => {
  updateMandobeInList(data.mandobe);
});

socket.on('mandobe:deleted', (data) => {
  removeMandobeFromList(data.mandobe.id);
});

// الموردين
socket.on('supplier:new', (data) => {
  addSupplierToList(data.supplier);
});

socket.on('supplier:updated', (data) => {
  updateSupplierInList(data.supplier);
});

socket.on('supplier:deleted', (data) => {
  removeSupplierFromList(data.supplier.id);
});

// قطع الاتصال
socket.on('disconnect', () => {
  console.log('انقطع الاتصال');
});
```

---

## شكل البيانات

### للإنشاء (NEW)
```javascript
{
  [resource]: { ...fullData },
  createdBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### للتحديث (UPDATED)
```javascript
{
  [resource]: { ...fullDataAfterUpdate },
  changes: {
    field1: { old: "قديم", new: "جديد" },
    field2: { old: 100, new: 150 }
  },
  updatedBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### للحذف (DELETED)
```javascript
{
  [resource]: { ...fullDataBeforeDelete },
  deletedBy: "admin",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

---

## نصائح

1. **استمع لجميع الأحداث التي تهمك** - لا تستمع فقط للفواتير، استمع لكل شيء
2. **استخدم البيانات الكاملة** - لا حاجة لطلب API إضافي
3. **اعرض التغييرات للمستخدم** - استخدم `changes` لإظهار ما تغير
4. **تحقق من الصلاحيات** - قد يحتاج المستخدم صلاحيات معينة لرؤية بعض الأحداث
5. **أضف معالجة الأخطاء** - تأكد من معالجة `error` event

```javascript
socket.on('error', (error) => {
  console.error('خطأ في Socket:', error);
});
```

---

## الأحداث العامة

```javascript
// الاتصال
socket.on('connect', () => {
  console.log('تم الاتصال');
});

// قطع الاتصال
socket.on('disconnect', (reason) => {
  console.log('قطع الاتصال:', reason);
});

// خطأ
socket.on('error', (error) => {
  console.error('خطأ:', error);
});

// إعادة الاتصال
socket.on('reconnect', (attemptNumber) => {
  console.log('تم إعادة الاتصال بعد:', attemptNumber, 'محاولة');
});
```
