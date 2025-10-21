# Backend Requirements for MTM Migration

## 1) Overview
- الهدف: استبدال Firebase + FirestoreLikeSDK بباك-إند REST + Socket.io مع JWT.
- القيود: الحفاظ على نفس سلوك التطبيق الحالي بدون تغيير في الواجهة الأمامية.
- الصيغة القياسية للردود:
  - Success:
    {
      "success": true,
      "data": {},
      "message": "Success",
      "timestamp": "ISO8601"
    }
  - Error:
    {
      "success": false,
      "message": "Error message",
      "errors": [{"field":"...","message":"..."}],
      "timestamp": "ISO8601"
    }
- التواريخ: ISO8601 strings.
- الترميز: UTF-8 ودعم RTL.

## 2) Authentication & Users
- Endpoints:
  - POST /auth/login
    - body: { "phone": string, "password": string }
    - resp: { token, user }
  - POST /auth/refresh
    - body: { "refreshToken": string }
    - resp: { token }
  - POST /auth/logout
- Users Management:
  - GET /users
  - GET /users/:id
  - POST /users
  - PUT /users/:id
  - DELETE /users/:id
  - PUT /users/:id/permissions
- Roles:
  - "admin", "marketer", "mandobe", "sales" (مطابقة لـ "ادمن" | "مسوق" | "مندوب" | "سيلز")
- Permissions model (مطابقة خصائص [UserModel](cci:2://file:///d:/mtm/mtm/lib/model/user_model.dart:0:0-88:1) في [lib/model/user_model.dart](cci:7://file:///d:/mtm/mtm/lib/model/user_model.dart:0:0-0:0)):
  - addOrder, editOrder, removeOrder
  - showMandobe, addMandobe, editMandobe, removeMandobe
  - showCode, addCode, editCode, removeCode
  - showStore, addStore, editStore

## 3) Core Data Models (field contracts)
- Order (مطابقة [OrderModel](cci:2://file:///d:/mtm/mtm/lib/model/order_model.dart:5:0-131:1)):
  - id: string
  - orderCode: string
  - name: string
  - phone: string
  - phoneTow: string  // في API يمكن تسميتها phone_two مع تحويل بالباك-إند
  - address: string
  - city: string
  - dateTime: string (ISO)
  - mandobeName: string | mandobe_id: number  // يفضّل دعم كِلاهما (الاسم و ID)
  - code: string | marketer_id: number        // يفضّل دعم كِلاهما (الاسم و ID)
  - total: number|string
  - status: enum ["pending","accept","refuse","delay"]
  - notes: string|null
  - sells: boolean        // حالة دفع عمولة المسوق
  - mandobe: boolean      // حالة تصفية المندوب
  - nameAdd: string       // اسم من أضاف الطلب
  - nameEdit: string      // اسم من عدّل الطلب آخر مرة
  - details: OrderDetail[]
- OrderDetail:
  - product_id: number    // اعتماد ID كمرجع أساسي
  - quantity: number      // يعادل count في الواجهة
  - price: number
  - details: string|null
  - optional view fields (for read): code, name
- Product (يشمل الهدايا والمراتب مع نوع):
  - id: number
  - code: string
  - name: string
  - count: number
  - type: enum ["gift","mattress","regular"]  // للتمايز إن لزم
- Marketer:
  - id: number
  - name: string
  - phone: string
- Mandobe:
  - id: number
  - name: string
  - phone: string
- Supplier:
  - id: number
  - name: string
  - phone: string
- Vault (الخزنة):
  - balance: number
  - transactions: [{ id, type: "in"|"out", amount, note, dateTime }]
- OrderCode (ترقيم الطلبات المتسلسل):
  - current: number

## 4) Endpoints (CRUD + عمليات خاصة)

### Orders
- GET /orders
  - query:
    - page, limit
    - q (search by customer name/phone/orderCode)
    - status
    - city
    - mandobeName or mandobe_id
    - code or marketer_id
    - sells: "paid"|"unPaid"
    - dateFrom, dateTo (ISO)
    - sort: "dateTime_desc"|"dateTime_asc"
  - resp: { data: Order[], pagination }
- GET /orders/:id
- POST /orders
  - body: مطابق Order (قبول mandobe_id/marketer_id أو mandobeName/code)
  - إذا لم يُرسل orderCode: يولّده السيرفر تلقائياً ويرجعه
- PUT /orders/:id
- DELETE /orders/:id
- PUT /orders/:id/status
  - body: { status }
- PUT /orders/:id/mandobe
  - body: { mandobe_id | mandobeName }
- PUT /orders/:id/payment
  - body: { sells: boolean }  // تحديث حالة عمولة المسوق
- GET /orders/statistics
  - query: { month, year, city, mandobe_id/name, marketer_id/name, status }
  - resp: { totals, counts by status, by city, ... }
- GET /orders/next-code
  - resp: { orderCode: string }

### Products
- GET /products
  - query: page, limit, q, type
- GET /products/:id
- POST /products
- PUT /products/:id
- DELETE /products/:id
- PUT /products/:id/stock
  - body: { delta: number }  // زيادة/نقصان المخزون
- GET /products/:id/history
  - resp: [{ countDelta, dateTime }]

### Marketers
- GET /marketers
- GET /marketers/:id
- POST /marketers
- PUT /marketers/:id
- DELETE /marketers/:id
- GET /marketers/:id/orders
  - query: month, year, status, sells
- GET /marketers/:id/commissions
  - resp: { total, paid, unPaid, list: [...] }
- PUT /marketers/:id/commissions/:orderId
  - body: { sells: boolean }
- GET /marketers/:id/statistics

### Mandobes
- GET /mandobes
- GET /mandobes/:id
- POST /mandobes
- PUT /mandobes/:id
- DELETE /mandobes/:id
- GET /mandobes/:id/orders
  - query: month, year, status
- GET /mandobes/:id/statistics
- GET /mandobes/:id/account
  - resp: { acceptCount, pendingCount, dueAmount, paidAmount, ... }
- GET /mandobes/:id/payments
- POST /mandobes/:id/payments
  - body: { amount, note, dateTime }

### Suppliers
- GET /suppliers
- GET /suppliers/:id
- POST /suppliers
- PUT /suppliers/:id
- DELETE /suppliers/:id
- GET /suppliers/:id/orders
- POST /suppliers/:id/orders
- PUT /suppliers/:id/orders/:orderId
- DELETE /suppliers/:id/orders/:orderId
- GET /suppliers/:id/payments
- POST /suppliers/:id/payments

### Vault (الخزنة)
- GET /vault/balance
- GET /vault/transactions
  - query: page, limit, dateFrom, dateTo, type
- POST /vault/transactions
  - body: { type: "in"|"out", amount, note, dateTime }
- GET /vault/statistics

### Locations (اختياري لمدن الشحن)
- GET /locations
- POST /locations
- PUT /locations/:id
- DELETE /locations/:id

### Employees (اختياري)
- GET /employees
- POST /employees
- PUT /employees/:id
- DELETE /employees/:id

### Reports
- GET /reports/daily
- GET /reports/monthly
- GET /reports/yearly
- GET /reports/by-city
- GET /reports/by-mandobe
- GET /reports/by-marketer

## 5) Real-time (Socket.io)
- Connection: io(BASE_URL)
- Server emits:
  - order:new { id, orderCode, timestamp }
  - order:updated { id, timestamp }
  - order:deleted { id, timestamp }
  - product:updated { id }
  - marketer:updated { id }
  - mandobe:updated { id }
  - supplier:updated { id }
- Subscription rooms:
  - "orders", "products", "marketers", "mandobes", "suppliers"
- Reconnection & re-subscribe مدعوم.

## 6) Filtering & Pagination
- Pagination: { total, page, limit, pages, hasNext, hasPrev }
- Filtering: كما هو موضح في Orders وكيانات أخرى
- Sorting: على الأقل dateTime asc/desc
- Search: q يغطي name/phone/orderCode

## 7) Security
- JWT في Authorization: Bearer <token>
- Rate limiting قابل للتفعيل لاحقاً
- CORS وفق المنصات المدعومة
- Input validation شاملة برسائل واضحة
- لا يتم إرجاع معلومات حساسة في الأخطاء

## 8) Compatibility Notes (mapping مهمة)
- phoneTow (FE) ⇄ phone_two (BE)
- code (اسم المسوق) ⇄ marketer_id (رقمي) + إعادة اسم المسوق في القراءة
- mandobeName (اسم) ⇄ mandobe_id (رقمي) + إعادة اسم المندوب في القراءة
- details.count (FE) ⇄ details.quantity (BE)
- total: number مفضّل (مع قبول string في الإدخال وتحويله)
- dateTime: ISO string دائماً
- الحفاظ على الحقول الخاصة بالتتبع:
  - nameAdd, nameEdit
- دعم orderCode بالتوليد التلقائي عند عدم الإرسال.

## 9) Migrations
- نقطة ترحيل: تزويد endpoint لترحيل بيانات قديمة إن لزم.
- تحويل Timestamp من Firebase إلى ISO قبل الإرسال.
- توافق الأسماء كما في القسم 8.

## 10) Non-Functional
- Performance: فهارس على الحقول: dateTime, status, city, mandobe_id, marketer_id
- Observability: Logging + Correlation IDs
- Versioning: Prefix /api/v1
- Environment:
  - JWT_SECRET
  - DB_URL
  - CORS_ORIGINS
  - RATE_LIMIT