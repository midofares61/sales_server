# Authentication Changes - Username Instead of Phone

## 📋 Overview
تم تغيير نظام المصادقة من استخدام `phone` إلى `username` كمعرف تسجيل الدخول.

---

## ✅ التغييرات المنفذة

### 1. **Database Schema** ✅
- ✅ إضافة حقل `username` (String, Required, Unique)
- ✅ تغيير حقل `phone` ليصبح اختياري (Optional)
- ✅ إضافة index على `username`
- ✅ Migration تلقائي ينسخ `phone` إلى `username` للمستخدمين الموجودين

**Migration File:**
```
src/migrations/20251016192800-add-username-field.js
```

### 2. **User Model** ✅
تم تحديث `src/models/user.js`:
```javascript
username: { type: DataTypes.STRING, allowNull: false, unique: true }
phone: { type: DataTypes.STRING, allowNull: true }
```

### 3. **Auth Controller** ✅
تم تحديث `src/controllers/auth.controller.js`:
- تغيير `const { phone, password }` إلى `const { username, password }`
- تغيير `User.findOne({ where: { phone } })` إلى `User.findOne({ where: { username } })`
- إضافة `username` في response

### 4. **Seeder** ✅
تم تحديث `src/seeders/202309100002-admin-user.cjs`:
```javascript
{
  name: 'Admin',
  username: 'admin',
  phone: '01000000000',
  password_hash: hash,
  role: 'admin'
}
```

### 5. **Validator** ✅
تم تحديث `src/validators/auth.validator.js`:
```javascript
body('username')
  .notEmpty()
  .withMessage('Username is required')
  .isLength({ min: 3, max: 50 })
  .withMessage('Username must be between 3 and 50 characters')
  .matches(/^[a-zA-Z0-9_.-]+$/)
  .withMessage('Username can only contain letters, numbers, dots, hyphens and underscores')
```

### 6. **Documentation** ✅
تم تحديث:
- ✅ `API.md` - جميع أمثلة Login
- ✅ `QUICKSTART.md` - مثال تسجيل الدخول
- ✅ `FLUTTER_INTEGRATION.md` - أمثلة Authentication
- ✅ `postman_collection.json` - Login request

---

## 🔄 Migration Details

### الأمر:
```bash
npm run db:migrate
```

### ما يحدث:
1. إضافة عمود `username` (nullable مؤقتاً)
2. نسخ قيم `phone` إلى `username` للمستخدمين الموجودين
3. تغيير `username` إلى NOT NULL و UNIQUE
4. تغيير `phone` إلى nullable
5. إضافة index على `username`

### Rollback (إذا لزم الأمر):
```bash
npm run db:migrate:undo
```

---

## 📝 Login Request Format

### قبل التغيير:
```json
{
  "phone": "01000000000",
  "password": "admin123"
}
```

### بعد التغيير:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## 📊 Login Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "Admin",
      "username": "admin",
      "phone": "01000000000",
      "role": "admin",
      "permissions": { ... }
    }
  },
  "message": "Login successful",
  "timestamp": "2025-10-16T..."
}
```

**ملاحظة:** `phone` لا يزال موجوداً في response ولكنه اختياري.

---

## 🔐 Default Admin Credentials

```
Username: admin
Password: admin123
```

---

## 🚀 Testing

### 1. Health Check
```bash
GET http://localhost:3000/api/health
```

### 2. Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 3. Postman Collection
استخدم `postman_collection.json` - تم تحديثه تلقائياً.

---

## 📱 Flutter Integration Changes

### Before:
```dart
final response = await dio.post('/auth/login', data: {
  'phone': '01000000000',
  'password': 'admin123',
});
```

### After:
```dart
final response = await dio.post('/auth/login', data: {
  'username': 'admin',
  'password': 'admin123',
});
```

### User Model Update:
```dart
class User {
  final int id;
  final String name;
  final String username;  // ✅ جديد
  final String? phone;    // ✅ اختياري الآن
  final String role;
  final Map<String, dynamic>? permissions;
  
  User.fromJson(Map<String, dynamic> json)
    : id = json['id'],
      name = json['name'],
      username = json['username'],  // ✅ جديد
      phone = json['phone'],
      role = json['role'],
      permissions = json['permissions'];
}
```

---

## ⚠️ Breaking Changes

### للـ API Clients:
1. **Login endpoint** يتطلب `username` بدلاً من `phone`
2. **User response** يحتوي على `username` field جديد
3. حقل `phone` أصبح اختياري (nullable)

### للـ Database:
- جدول `users` يحتوي على عمود `username` جديد
- عمود `phone` لم يعد unique ولا required

---

## 🔄 Backward Compatibility

### Migration:
- ✅ المستخدمون الموجودون: يتم نسخ `phone` إلى `username` تلقائياً
- ✅ لا حاجة لتعديل البيانات يدوياً
- ✅ `phone` لا يزال موجوداً في الجدول

### API:
- ❌ **غير متوافق مع الإصدار السابق** - يجب تحديث جميع clients
- يجب تحديث Flutter app لاستخدام `username`

---

## 📋 Checklist

### Backend:
- [x] تحديث User model
- [x] تحديث Auth controller
- [x] إنشاء migration
- [x] تشغيل migration
- [x] تحديث seeder
- [x] تحديث documentation
- [x] تحديث Postman collection

### Frontend (Flutter):
- [ ] تحديث Login screen UI
- [ ] تحديث API client
- [ ] تحديث User model
- [ ] تحديث validation
- [ ] اختبار Login flow

---

## 🎯 Next Steps

1. ✅ **Backend جاهز** - جميع التغييرات مطبقة
2. 📱 **تحديث Flutter App:**
   - تغيير Login form من phone إلى username
   - تحديث User model
   - تحديث API calls
   - اختبار Authentication flow

3. 🧪 **Testing:**
   - اختبار Login بـ username
   - اختبار Refresh token
   - اختبار Permissions
   - اختبار Profile endpoints

---

## 📞 Support

إذا واجهت أي مشاكل:
1. تحقق من اللوجات: `npm run logs:error`
2. راجع `API.md` للتوثيق الكامل
3. استخدم Postman collection للاختبار

---

## ✨ Summary

تم تغيير نظام المصادقة بنجاح من `phone` إلى `username`:
- ✅ Database schema محدّث
- ✅ Backend code محدّث
- ✅ Documentation محدّث
- ✅ Postman collection محدّث
- ✅ Migration جاهز ومطبق
- 📱 Flutter app يحتاج تحديث

**النظام جاهز للاستخدام! 🎉**
