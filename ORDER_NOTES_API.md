# Order Notes API Documentation

## نظام الملاحظات المتعددة للأوردرات

تم إضافة نظام كامل لإدارة الملاحظات المتعددة للأوردرات مع إمكانية إضافة وعرض وتعديل وحذف الملاحظات.

---

## الميزات الجديدة

✅ **إضافة أكثر من ملاحظة واحدة لكل أوردر**  
✅ **عرض جميع الملاحظات مع الأوردر**  
✅ **تعديل الملاحظات**  
✅ **حذف الملاحظات**  
✅ **تسجيل من أضاف/عدل الملاحظة**  
✅ **ترتيب الملاحظات حسب تاريخ الإضافة**

---

## Endpoints الجديدة

### 1. عرض جميع الملاحظات لأوردر معين

```http
GET /api/orders/:orderId/notes
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": 1,
        "order_id": 123,
        "note": "العميل يريد التوصيل في الفترة المسائية",
        "created_by": "أحمد محمد",
        "updated_by": null,
        "created_at": "2025-11-07T15:30:00.000Z",
        "updated_at": "2025-11-07T15:30:00.000Z"
      },
      {
        "id": 2,
        "order_id": 123,
        "note": "تم تأكيد الطلب مع العميل",
        "created_by": "سارة علي",
        "updated_by": null,
        "created_at": "2025-11-07T14:20:00.000Z",
        "updated_at": "2025-11-07T14:20:00.000Z"
      }
    ]
  },
  "message": "Order notes retrieved successfully",
  "timestamp": "2025-11-07T15:35:00.000Z"
}
```

---

### 2. عرض ملاحظة واحدة

```http
GET /api/orders/:orderId/notes/:noteId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 123,
    "note": "العميل يريد التوصيل في الفترة المسائية",
    "created_by": "أحمد محمد",
    "updated_by": null,
    "created_at": "2025-11-07T15:30:00.000Z",
    "updated_at": "2025-11-07T15:30:00.000Z"
  },
  "message": "Note retrieved successfully",
  "timestamp": "2025-11-07T15:35:00.000Z"
}
```

---

### 3. إضافة ملاحظة جديدة

```http
POST /api/orders/:orderId/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "العميل يريد التوصيل في الفترة المسائية"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 123,
    "note": "العميل يريد التوصيل في الفترة المسائية",
    "created_by": "أحمد محمد",
    "updated_by": null,
    "created_at": "2025-11-07T15:30:00.000Z",
    "updated_at": "2025-11-07T15:30:00.000Z"
  },
  "message": "Note created successfully",
  "timestamp": "2025-11-07T15:30:00.000Z"
}
```

**Validation Rules:**
- `note` مطلوب
- الحد الأدنى: 1 حرف
- الحد الأقصى: 5000 حرف

---

### 4. تعديل ملاحظة موجودة

```http
PUT /api/orders/:orderId/notes/:noteId
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "العميل يريد التوصيل في الفترة المسائية قبل الساعة 8 مساءً"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_id": 123,
    "note": "العميل يريد التوصيل في الفترة المسائية قبل الساعة 8 مساءً",
    "created_by": "أحمد محمد",
    "updated_by": "محمد حسن",
    "created_at": "2025-11-07T15:30:00.000Z",
    "updated_at": "2025-11-07T16:00:00.000Z"
  },
  "message": "Note updated successfully",
  "timestamp": "2025-11-07T16:00:00.000Z"
}
```

---

### 5. حذف ملاحظة

```http
DELETE /api/orders/:orderId/notes/:noteId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Note deleted successfully",
  "timestamp": "2025-11-07T16:05:00.000Z"
}
```

---

## التكامل مع عرض الأوردرات

**الملاحظات تظهر تلقائياً عند جلب الأوردر:**

```http
GET /api/orders/:id
GET /api/orders
```

**Response Example:**
```json
{
  "id": 123,
  "orderCode": "1234",
  "customer_name": "أحمد علي",
  "phone": "01234567890",
  "address": "شارع النيل، القاهرة",
  "total": 500.00,
  "status": "pending",
  "notes": [
    {
      "id": 1,
      "order_id": 123,
      "note": "العميل يريد التوصيل في الفترة المسائية",
      "created_by": "أحمد محمد",
      "updated_by": null,
      "created_at": "2025-11-07T15:30:00.000Z",
      "updated_at": "2025-11-07T15:30:00.000Z"
    },
    {
      "id": 2,
      "order_id": 123,
      "note": "تم تأكيد الطلب مع العميل",
      "created_by": "سارة علي",
      "updated_by": null,
      "created_at": "2025-11-07T14:20:00.000Z",
      "updated_at": "2025-11-07T14:20:00.000Z"
    }
  ],
  "details": [...]
}
```

---

## Error Handling

### Order Not Found
```json
{
  "success": false,
  "message": "Order not found",
  "timestamp": "2025-11-07T16:00:00.000Z"
}
```

### Note Not Found
```json
{
  "success": false,
  "message": "Note not found",
  "timestamp": "2025-11-07T16:00:00.000Z"
}
```

### Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "field": "note",
      "message": "Note content is required"
    }
  ],
  "timestamp": "2025-11-07T16:00:00.000Z"
}
```

---

## Database Schema

تم إنشاء جدول جديد `order_notes`:

```sql
CREATE TABLE `order_notes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `note` TEXT NOT NULL,
  `created_by` VARCHAR(100),
  `updated_by` VARCHAR(100),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  INDEX `idx_order_notes_order_id` (`order_id`)
);
```

**ملاحظات:**
- عند حذف الأوردر، يتم حذف جميع الملاحظات المرتبطة به تلقائياً (CASCADE)
- الملاحظات مرتبة حسب تاريخ الإضافة (الأحدث أولاً)
- يتم تسجيل اسم المستخدم الذي أضاف/عدل الملاحظة

---

## استخدام مع Flutter/Dart

### مثال على إضافة ملاحظة:

```dart
Future<void> addOrderNote(int orderId, String noteText) async {
  final response = await http.post(
    Uri.parse('$baseUrl/orders/$orderId/notes'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: json.encode({
      'note': noteText,
    }),
  );
  
  if (response.statusCode == 201) {
    final data = json.decode(response.body);
    print('Note added: ${data['data']['id']}');
  }
}
```

### مثال على عرض الملاحظات:

```dart
Future<List<OrderNote>> getOrderNotes(int orderId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/orders/$orderId/notes'),
    headers: {
      'Authorization': 'Bearer $token',
    },
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data']['notes'] as List)
        .map((note) => OrderNote.fromJson(note))
        .toList();
  }
  return [];
}
```

---

## ملاحظات مهمة

1. **الحقل القديم `notes` في جدول `orders`**: لا يزال موجوداً للتوافق مع الأنظمة القديمة، ولكن يُفضل استخدام نظام الملاحظات المتعددة الجديد.

2. **Authentication**: جميع endpoints تتطلب authentication token صالح.

3. **Permissions**: يمكن لأي مستخدم مصرح له إضافة/تعديل/حذف الملاحظات.

4. **Cascade Delete**: عند حذف الأوردر، يتم حذف جميع الملاحظات المرتبطة به تلقائياً.

5. **Ordering**: الملاحظات دائماً مرتبة من الأحدث إلى الأقدم.

---

## Migration

تم إنشاء الجدول تلقائياً عند تشغيل:

```bash
npm run db:migrate
```

للتراجع عن الـ migration:

```bash
npm run db:migrate:undo
```

---

## Testing Examples

### إضافة ملاحظة:
```bash
curl -X POST http://localhost:3000/api/orders/123/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "العميل يريد التوصيل في الفترة المسائية"}'
```

### عرض الملاحظات:
```bash
curl -X GET http://localhost:3000/api/orders/123/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تعديل ملاحظة:
```bash
curl -X PUT http://localhost:3000/api/orders/123/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note": "تم تعديل الملاحظة"}'
```

### حذف ملاحظة:
```bash
curl -X DELETE http://localhost:3000/api/orders/123/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## الخلاصة

تم إضافة نظام كامل لإدارة الملاحظات المتعددة للأوردرات بنجاح! 🎉

الآن يمكنك:
- ✅ إضافة عدد غير محدود من الملاحظات لكل أوردر
- ✅ عرض جميع الملاحظات
- ✅ تعديل أي ملاحظة
- ✅ حذف الملاحظات غير المرغوب فيها
- ✅ تتبع من أضاف/عدل كل ملاحظة

