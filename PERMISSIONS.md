# نظام الصلاحيات (Permissions System)

## 📋 نظرة عامة

نظام الصلاحيات يسمح بالتحكم الدقيق في ما يمكن لكل مستخدم القيام به في النظام. كل دور (Role) له صلاحيات افتراضية، ويمكن تخصيص الصلاحيات لكل مستخدم على حدة.

---

## 🎭 الأدوار المتاحة (Roles)

| الدور | الاسم بالعربية | الوصف |
|------|----------------|-------|
| `admin` | ادمن | صلاحيات كاملة على النظام |
| `sales` | مستخدم عادي | صلاحيات محدودة للمبيعات |
| `marketer` | مسوق | صلاحيات إضافة طلبات فقط |
| `mandobe` | مندوب | صلاحيات محدودة جداً |

---

## 🔐 الصلاحيات المتاحة (Permissions)

### صلاحيات الطلبات (Orders)
- `addOrder` - إضافة طلب جديد
- `editOrder` - تعديل طلب موجود
- `removeOrder` - حذف طلب

### صلاحيات المناديب (Mandobes)
- `showMandobe` - عرض المناديب
- `addMandobe` - إضافة مندوب جديد
- `editMandobe` - تعديل مندوب
- `removeMandobe` - حذف مندوب

### صلاحيات الأكواد/المنتجات (Codes/Products)
- `showCode` - عرض الأكواد
- `addCode` - إضافة كود جديد
- `editCode` - تعديل كود
- `removeCode` - حذف كود

### صلاحيات المخازن/الموردين (Stores/Suppliers)
- `showStore` - عرض المخازن
- `addStore` - إضافة مخزن جديد
- `editStore` - تعديل مخزن

---

## 📊 الصلاحيات الافتراضية لكل دور

### 1. Admin (ادمن) ✅
```json
{
  "addOrder": true,
  "editOrder": true,
  "removeOrder": true,
  "showMandobe": true,
  "addMandobe": true,
  "editMandobe": true,
  "removeMandobe": true,
  "showCode": true,
  "addCode": true,
  "editCode": true,
  "removeCode": true,
  "showStore": true,
  "addStore": true,
  "editStore": true
}
```

### 2. Sales (مستخدم عادي) 📝
```json
{
  "addOrder": true,
  "editOrder": true,
  "removeOrder": true,
  "showMandobe": true,
  "addMandobe": false,
  "editMandobe": false,
  "removeMandobe": false,
  "showCode": true,
  "addCode": false,
  "editCode": false,
  "removeCode": false,
  "showStore": true,
  "addStore": false,
  "editStore": false
}
```

### 3. Marketer (مسوق) 📱
```json
{
  "addOrder": true,
  "editOrder": false,
  "removeOrder": false,
  "showMandobe": false,
  "addMandobe": false,
  "editMandobe": false,
  "removeMandobe": false,
  "showCode": false,
  "addCode": false,
  "editCode": false,
  "removeCode": false,
  "showStore": false,
  "addStore": false,
  "editStore": false
}
```

### 4. Mandobe (مندوب) 🚚
```json
{
  "addOrder": false,
  "editOrder": false,
  "removeOrder": false,
  "showMandobe": false,
  "addMandobe": false,
  "editMandobe": false,
  "removeMandobe": false,
  "showCode": false,
  "addCode": false,
  "editCode": false,
  "removeCode": false,
  "showStore": false,
  "addStore": false,
  "editStore": false
}
```

---

## 🔄 API Endpoints

### 1. Login Response
عند تسجيل الدخول، يتم إرجاع الصلاحيات مع بيانات المستخدم:

```bash
POST /api/auth/login
```

**Response:**
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
      "role": "admin",
      "roleNameArabic": "ادمن",
      "permissions": {
        "addOrder": true,
        "editOrder": true,
        "removeOrder": true,
        ...
      }
    }
  }
}
```

### 2. Get All Roles and Permissions
```bash
GET /api/users/roles
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "role": "admin",
        "roleNameArabic": "ادمن",
        "permissions": { ... }
      },
      {
        "role": "sales",
        "roleNameArabic": "مستخدم عادي",
        "permissions": { ... }
      },
      ...
    ]
  }
}
```

### 3. Get All Users
```bash
GET /api/users?page=1&limit=10&role=sales
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "User Name",
        "username": "username",
        "role": "sales",
        "roleNameArabic": "مستخدم عادي",
        "permissions": { ... }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 4. Create User
```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New User",
  "username": "newuser",
  "phone": "01234567890",
  "password": "password123",
  "role": "sales",
  "permissions": {
    "addOrder": true,
    "editOrder": false
  }
}
```

### 5. Update User
```bash
PUT /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "admin"
}
```

### 6. Update User Permissions
```bash
PUT /api/users/:id/permissions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "permissions": {
    "addOrder": true,
    "editOrder": true,
    "removeOrder": false
  }
}
```

### 7. Change User Password
```bash
PUT /api/users/:id/password
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

### 8. Delete User
```bash
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

---

## 🛡️ Middleware Usage

### في Backend (Node.js):

```javascript
import { requirePermission, requireRole } from '../middleware/permissions.middleware.js';

// Require specific permission
router.post('/orders', 
  authenticate, 
  requirePermission('addOrder'), 
  createOrder
);

// Require admin role
router.delete('/users/:id', 
  authenticate, 
  requireRole('admin'), 
  deleteUser
);

// Require any of multiple permissions
router.get('/orders', 
  authenticate, 
  requireAnyPermission(['addOrder', 'editOrder']), 
  listOrders
);
```

---

## 📱 Flutter Integration

### 1. User Model
```dart
class User {
  final int id;
  final String name;
  final String username;
  final String role;
  final String roleNameArabic;
  final Permissions permissions;
  
  User.fromJson(Map<String, dynamic> json)
    : id = json['id'],
      name = json['name'],
      username = json['username'],
      role = json['role'],
      roleNameArabic = json['roleNameArabic'],
      permissions = Permissions.fromJson(json['permissions']);
}

class Permissions {
  final bool? addOrder;
  final bool? editOrder;
  final bool? removeOrder;
  final bool? showMandobe;
  final bool? addMandobe;
  final bool? editMandobe;
  final bool? removeMandobe;
  final bool? showCode;
  final bool? addCode;
  final bool? editCode;
  final bool? removeCode;
  final bool? showStore;
  final bool? addStore;
  final bool? editStore;
  
  Permissions.fromJson(Map<String, dynamic> json)
    : addOrder = json['addOrder'],
      editOrder = json['editOrder'],
      removeOrder = json['removeOrder'],
      showMandobe = json['showMandobe'],
      addMandobe = json['addMandobe'],
      editMandobe = json['editMandobe'],
      removeMandobe = json['removeMandobe'],
      showCode = json['showCode'],
      addCode = json['addCode'],
      editCode = json['editCode'],
      removeCode = json['removeCode'],
      showStore = json['showStore'],
      addStore = json['addStore'],
      editStore = json['editStore'];
}
```

### 2. Check Permissions in UI
```dart
// Hide/show buttons based on permissions
if (user.permissions.addOrder == true) {
  FloatingActionButton(
    onPressed: () => navigateToAddOrder(),
    child: Icon(Icons.add),
  )
}

// Disable features
ElevatedButton(
  onPressed: user.permissions.editOrder == true 
    ? () => editOrder() 
    : null,
  child: Text('تعديل'),
)
```

### 3. Role Selection
```dart
String? selectedRole;
Permissions? permissions;

DropdownButton<String>(
  value: selectedRole,
  items: [
    DropdownMenuItem(value: 'admin', child: Text('ادمن')),
    DropdownMenuItem(value: 'sales', child: Text('مستخدم عادي')),
    DropdownMenuItem(value: 'marketer', child: Text('مسوق')),
    DropdownMenuItem(value: 'mandobe', child: Text('مندوب')),
  ],
  onChanged: (value) {
    setState(() {
      selectedRole = value;
      // Fetch default permissions for this role from API
      fetchRolePermissions(value);
    });
  },
)
```

---

## 🔍 أمثلة الاستخدام

### مثال 1: إنشاء مستخدم عادي
```bash
POST /api/users
{
  "name": "محمد أحمد",
  "username": "mohamed",
  "password": "123456",
  "role": "sales"
}
```
سيحصل تلقائياً على صلاحيات "مستخدم عادي".

### مثال 2: تخصيص صلاحيات مستخدم
```bash
PUT /api/users/5/permissions
{
  "permissions": {
    "addOrder": true,
    "editOrder": true,
    "removeOrder": true,
    "addMandobe": true
  }
}
```

### مثال 3: تغيير دور مستخدم
```bash
PUT /api/users/5
{
  "role": "admin"
}
```
سيحصل على صلاحيات Admin الكاملة.

---

## ⚠️ ملاحظات مهمة

1. **Admin Bypass**: دور `admin` يتجاوز جميع فحوصات الصلاحيات تلقائياً
2. **Custom Permissions**: الصلاحيات المخصصة تُدمج مع صلاحيات الدور الافتراضية
3. **Null Values**: إذا كانت الصلاحية `null` أو غير موجودة، تُعتبر `false`
4. **Security**: جميع endpoints إدارة المستخدمين تتطلب دور `admin`

---

## 🎯 الخلاصة

نظام الصلاحيات يوفر:
- ✅ **تحكم دقيق** في صلاحيات كل مستخدم
- ✅ **صلاحيات افتراضية** لكل دور
- ✅ **تخصيص مرن** للصلاحيات الفردية
- ✅ **سهولة الدمج** مع Flutter
- ✅ **أمان محكم** مع middleware

**النظام جاهز للاستخدام! 🎉**
