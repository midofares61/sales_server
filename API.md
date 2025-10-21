# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/login` and `/health` require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Success message",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ],
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

## Endpoints

### Health Check

#### GET /health
Check server status.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-16T10:00:00.000Z",
  "uptime": 3600
}
```

### Authentication

#### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Admin",
      "username": "admin",
      "phone": "01000000000",
      "role": "admin",
      "roleNameArabic": "ادمن",
      "permissions": {
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
    }
  },
  "message": "Login successful",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**Validation Errors:**
- Username is required
- Username must be between 3 and 50 characters
- Password is required
- Password must be at least 6 characters long

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**Errors:**
- `401` - Refresh token is required
- `401` - Invalid or expired refresh token
- `401` - User not found

#### POST /auth/logout
Logout current user (logs event for audit).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

### Profile Management

#### GET /profile
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "username": "admin",
    "phone": "01000000000",
    "role": "admin"
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### PUT /profile
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Name",
  "phone": "01234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "New Name",
    "phone": "01234567890",
    "role": "admin"
  },
  "message": "Profile updated successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### PUT /profile/password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

### Users Management

**Note:** All users management endpoints require admin role.

#### GET /users/roles
Get all available roles and their default permissions.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "role": "admin",
        "roleNameArabic": "ادمن",
        "permissions": {
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
      },
      {
        "role": "sales",
        "roleNameArabic": "مستخدم عادي",
        "permissions": {
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
      }
    ]
  }
}
```

#### GET /users
List all users with pagination.

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (admin, sales, marketer, mandobe)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin User",
        "username": "admin",
        "phone": "01000000000",
        "role": "admin",
        "roleNameArabic": "ادمن",
        "permissions": {
          "addOrder": true,
          "editOrder": true,
          ...
        }
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

#### GET /users/:id
Get user by ID.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "User Name",
    "username": "username",
    "phone": "01234567890",
    "role": "sales",
    "roleNameArabic": "مستخدم عادي",
    "permissions": {
      "addOrder": true,
      "editOrder": true,
      "removeOrder": true,
      ...
    }
  }
}
```

#### POST /users
Create new user.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "New User",
    "username": "newuser",
    "phone": "01234567890",
    "role": "sales",
    "roleNameArabic": "مستخدم عادي",
    "permissions": {
      "addOrder": true,
      "editOrder": false,
      "removeOrder": true,
      ...
    }
  },
  "message": "User created successfully"
}
```

**Validation:**
- `name`: Required, string
- `username`: Required, unique, 3-50 characters
- `password`: Required, minimum 6 characters
- `role`: Optional (default: sales), enum: admin, sales, marketer, mandobe
- `permissions`: Optional, object with permission overrides

#### PUT /users/:id
Update user.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "username": "newusername",
  "phone": "01234567890",
  "role": "admin",
  "permissions": {
    "addOrder": true,
    "editOrder": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Updated Name",
    "username": "newusername",
    "role": "admin",
    "roleNameArabic": "ادمن",
    "permissions": { ... }
  },
  "message": "User updated successfully"
}
```

#### PUT /users/:id/permissions
Update user permissions only.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "permissions": {
    "addOrder": true,
    "editOrder": true,
    "removeOrder": false,
    "addMandobe": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "User Name",
    "username": "username",
    "role": "sales",
    "permissions": {
      "addOrder": true,
      "editOrder": true,
      "removeOrder": false,
      "addMandobe": true,
      ...
    }
  },
  "message": "Permissions updated successfully"
}
```

#### PUT /users/:id/password
Change user password (admin can change any user's password).

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
```

#### DELETE /users/:id
Delete user.

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

**Note:** Admin cannot delete their own account.

### Orders

#### GET /orders
List orders with pagination, search, and advanced filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `q` (optional): Search term for customer name, phone, or order code
- `status` (optional): Filter by status (pending, accept, refuse, delay)
- `city` (optional): Filter by city
- `mandobe_id` (optional): Filter by mandobe ID
- `marketer_id` (optional): Filter by marketer ID
- `sells` (optional): Filter by commission payment status (paid, unPaid)
- `dateFrom` (optional): Filter from date (ISO8601 format)
- `dateTo` (optional): Filter to date (ISO8601 format)
- `sort` (optional): Sort order (dateTime_asc, dateTime_desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderCode": "123",
      "customer_name": "John Doe",
      "phone": "01234567890",
      "phone_two": "01234567891",
      "address": "123 Main St",
      "city": "Cairo",
      "dateTime": "2025-01-16T10:00:00.000Z",
      "total": 150.00,
      "status": "pending",
      "notes": "Special instructions",
      "sells": false,
      "mandobe": false,
      "mandobeName": "Delivery Person",
      "code": "Marketer Name",
      "nameAdd": "Admin",
      "nameEdit": null,
      "created_at": "2025-01-16T10:00:00.000Z",
      "updated_at": "2025-01-16T10:00:00.000Z",
      "details": [
        {
          "code": "PROD001",
          "price": 75.00,
          "name": "Product Name",
          "count": 2,
          "details": "Product notes",
          "id": "PROD001"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Orders retrieved successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### POST /orders
Create a new order.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin, marketer

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "phone": "01234567890",
  "phone_two": "01234567891",
  "address": "123 Main St",
  "city": "Cairo",
  "total": 150.00,
  "status": "pending",
  "notes": "Special instructions",
  "marketer_id": 1,
  "mandobe_id": 1,
  "details": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 75.00,
      "details": "Product notes"
    }
  ]
}
```

**Response:** Same as GET /orders (single order)

**Validation Errors:**
- Customer name is required (2-100 characters)
- Phone number is required (10-15 characters)
- Phone number contains invalid characters
- Address must not exceed 255 characters
- City must not exceed 50 characters
- Total must be a non-negative number
- Status must be one of: pending, accept, refuse, delay
- Notes must not exceed 1000 characters
- Marketer ID must be a positive integer
- Mandobe ID must be a positive integer
- Details must be an array
- Product ID must be a positive integer
- Quantity must be a positive integer
- Price must be a non-negative number

#### PUT /orders/:id
Update an order.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin, marketer

**Request Body:** Same as POST /orders (all fields optional)

**Response:** Same as GET /orders (single order)

#### DELETE /orders/:id
Delete an order.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Order deleted successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### GET /orders/:id
Get a single order by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** Same as GET /orders (single order object)

#### PUT /orders/:id/status
Update order status only.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin, marketer

**Request Body:**
```json
{
  "status": "accept"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "accept"
  },
  "message": "Order status updated successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**Validation:**
- Status must be one of: pending, accept, refuse, delay

#### PUT /orders/:id/mandobe
Update order mandobe only.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:**
```json
{
  "mandobe_id": 2
}
```

Or using mandobe name:
```json
{
  "mandobeName": "Mandobe Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "mandobe_id": 2
  },
  "message": "Order mandobe updated successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### PUT /orders/:id/payment
Update order commission payment status.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:**
```json
{
  "sells": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sells": true
  },
  "message": "Order payment status updated successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### GET /orders/statistics
Get orders statistics with filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2025)
- `city` (optional): Filter by city
- `mandobe_id` (optional): Filter by mandobe ID
- `marketer_id` (optional): Filter by marketer ID
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "totalAmount": 45000.00,
    "byStatus": {
      "pending": 20,
      "accept": 100,
      "refuse": 20,
      "delay": 10
    },
    "byCity": {
      "Cairo": 80,
      "Alexandria": 70
    }
  },
  "message": "Statistics retrieved successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### GET /orders/next-code
Get the next available order code.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "orderCode": "124"
  },
  "message": "Next order code generated",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**Note:** This endpoint automatically increments the order code counter.

### Products

#### GET /products
List products with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "PROD001",
      "name": "Product Name",
      "count": 100,
      "type": "regular"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Products retrieved successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### POST /products
Create a new product.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:**
```json
{
  "code": "PROD001",
  "name": "Product Name",
  "count": 100,
  "type": "regular"
}
```

**Product Types:**
- `gift` - Gift items
- `mattress` - Mattress products
- `regular` - Regular products (default)

**Response:** Same as GET /products (single product)

**Validation Errors:**
- Product code is required (1-50 characters)
- Product code can only contain letters, numbers, hyphens, and underscores
- Product name is required (2-100 characters)
- Count must be a non-negative integer

#### PUT /products/:id
Update a product.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:** Same as POST /products (all fields optional)

**Response:** Same as GET /products (single product)

#### DELETE /products/:id
Delete a product.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Product deleted successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### PUT /products/:id/stock
Update product stock with delta (can be positive or negative).

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:**
```json
{
  "delta": 10,
  "note": "Stock replenishment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "count": 110,
    "delta": 10
  },
  "message": "Stock updated successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**Notes:**
- `delta` can be positive (add stock) or negative (remove stock)
- Operation will fail if resulting stock would be negative
- All stock changes are logged in product_history table
- Emits `product:stock_updated` socket event

**Errors:**
- `400` - Delta must be a number
- `400` - Insufficient stock (when delta is negative)
- `404` - Product not found

#### GET /products/:id/history
Get product stock change history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "countDelta": 10,
      "countBefore": 90,
      "countAfter": 100,
      "note": "Stock replenishment",
      "dateTime": "2025-01-16T10:00:00.000Z",
      "createdBy": 1
    },
    {
      "id": 2,
      "countDelta": -5,
      "countBefore": 100,
      "countAfter": 95,
      "note": "Order fulfillment",
      "dateTime": "2025-01-16T11:00:00.000Z",
      "createdBy": 1
    }
  ],
  "message": "Product history retrieved successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**Notes:**
- Returns last 100 records
- Sorted by date (newest first)
- `createdBy` is the user ID who made the change

### Suppliers

#### GET /suppliers
List suppliers with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Supplier Name",
      "phone": "01234567890"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Suppliers retrieved successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### POST /suppliers
Create a new supplier.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:**
```json
{
  "name": "Supplier Name",
  "phone": "01234567890"
}
```

**Response:** Same as GET /suppliers (single supplier)

**Validation Errors:**
- Supplier name is required (2-100 characters)
- Phone number is required (10-15 characters)
- Phone number contains invalid characters

#### PUT /suppliers/:id
Update a supplier.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:** Same as POST /suppliers (all fields optional)

**Response:** Same as GET /suppliers (single supplier)

#### DELETE /suppliers/:id
Delete a supplier.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Supplier deleted successfully",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

### Marketers

#### GET /marketers
List marketers with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:** Same format as suppliers

#### POST /marketers
Create a new marketer.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:** Same as suppliers

**Response:** Same format as suppliers

#### PUT /marketers/:id
Update a marketer.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:** Same as suppliers (all fields optional)

**Response:** Same format as suppliers

#### DELETE /marketers/:id
Delete a marketer.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Response:** Same format as suppliers

### Mandobes

#### GET /mandobes
List mandobes with pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:** Same format as suppliers

#### POST /mandobes
Create a new mandobe.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:** Same as suppliers

**Response:** Same format as suppliers

#### PUT /mandobes/:id
Update a mandobe.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Request Body:** Same as suppliers (all fields optional)

**Response:** Same format as suppliers

#### DELETE /mandobes/:id
Delete a mandobe.

**Headers:** `Authorization: Bearer <token>`
**Required Role:** admin

**Response:** Same format as suppliers

## Error Codes

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized (Authentication Error)
- `403` - Forbidden (Authorization Error)
- `404` - Not Found
- `409` - Conflict (Duplicate Entry)
- `500` - Internal Server Error

### Common Error Messages

- `"No token provided"` - Missing Authorization header
- `"Token expired"` - JWT token has expired
- `"Invalid token"` - JWT token is malformed
- `"Access denied"` - Insufficient permissions
- `"Resource not found"` - Entity doesn't exist
- `"Validation error"` - Input validation failed
- `"Duplicate entry"` - Unique constraint violation

## Socket.io Events

### Connection
```javascript
const socket = io('http://localhost:3000');
```

### Events Emitted by Server

#### Order Events

**order:new** - Emitted when a new order is created.
```json
{
  "id": 1,
  "order_code": "123",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**order:updated** - Emitted when an order is updated.
```json
{
  "id": 1,
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**order:deleted** - Emitted when an order is deleted.
```json
{
  "id": 1,
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### Product Events

**product:new** - Emitted when a new product is created.
```json
{
  "id": 1,
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**product:updated** - Emitted when a product is updated.
```json
{
  "id": 1,
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**product:deleted** - Emitted when a product is deleted.
```json
{
  "id": 1,
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

**product:stock_updated** - Emitted when product stock is updated.
```json
{
  "id": 1,
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

#### Marketer Events

**marketer:new** - Emitted when a new marketer is created.
**marketer:updated** - Emitted when a marketer is updated.
**marketer:deleted** - Emitted when a marketer is deleted.

#### Mandobe Events

**mandobe:new** - Emitted when a new mandobe is created.
**mandobe:updated** - Emitted when a mandobe is updated.
**mandobe:deleted** - Emitted when a mandobe is deleted.

#### Supplier Events

**supplier:new** - Emitted when a new supplier is created.
**supplier:updated** - Emitted when a supplier is updated.
**supplier:deleted** - Emitted when a supplier is deleted.

#### Vault Events

**vault:transaction** - Emitted when a vault transaction is created.
**vault:balance_updated** - Emitted when vault balance changes.

### Client Event Handling

```javascript
socket.on('order:new', (data) => {
  console.log('New order created:', data);
  // Update UI with new order
});

socket.on('order:updated', (data) => {
  console.log('Order updated:', data);
  // Refresh order data
});

socket.on('order:deleted', (data) => {
  console.log('Order deleted:', data);
  // Remove order from UI
});
```

## Rate Limiting

Currently, rate limiting is disabled as per project requirements. However, the infrastructure is in place to enable it if needed.

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Request Sanitization**: MongoDB injection prevention
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation
- **Error Handling**: Secure error responses without sensitive information

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String, Required)
- `username` (String, Required, Unique) - Login username
- `phone` (String, Optional) - Phone number
- `password_hash` (String, Required)
- `role` (Enum: admin, marketer, mandobe, sales)
- `permissions` (JSON, Optional) - User-specific permissions object

### Orders Table
- `id` (Primary Key)
- `order_code` (String, Unique, Indexed) - Auto-generated sequential code
- `customer_name` (String, Required)
- `phone` (String, Required, Indexed)
- `phone_two` (String, Optional)
- `address` (String, Optional)
- `city` (String, Optional, Indexed)
- `date_time` (DateTime, Indexed) - Order date/time
- `total` (Decimal, Required)
- `status` (Enum: pending, accept, refuse, delay)
- `notes` (Text, Optional)
- `sells` (Boolean, Default: false) - Commission payment status
- `mandobe` (Boolean, Default: false) - Mandobe assignment status
- `nameAdd` (String) - User who created the order
- `nameEdit` (String) - User who last edited the order
- `mandobe_id` (Foreign Key to mandobes)
- `marketer_id` (Foreign Key to marketers)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Products Table
- `id` (Primary Key)
- `code` (String, Required, Unique)
- `name` (String, Required)
- `count` (Integer, Required)
- `type` (Enum: gift, mattress, regular, Default: regular)

### Order Details Table
- `id` (Primary Key)
- `order_id` (Foreign Key to orders)
- `product_id` (Foreign Key to products)
- `quantity` (Integer, Required)
- `price` (Decimal, Required)
- `details` (Text, Optional)

### Suppliers, Marketers, Mandobes Tables
- `id` (Primary Key)
- `name` (String, Required)
- `phone` (String, Required)

### Vault Table
- `id` (Primary Key)
- `balance` (Decimal, Default: 0) - Current vault balance
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Vault Transactions Table
- `id` (Primary Key)
- `vault_id` (Foreign Key to vault)
- `amount` (Decimal, Required) - Transaction amount (positive or negative)
- `type` (Enum: deposit, withdrawal, order_payment, supplier_payment, mandobe_payment, etc.)
- `description` (Text, Optional)
- `reference_id` (Integer, Optional) - Reference to related entity (order, payment, etc.)
- `reference_type` (String, Optional) - Type of reference (order, payment, etc.)
- `created_by` (Foreign Key to users)
- `date_time` (DateTime, Required)
- `created_at` (Timestamp)

### Product History Table
- `id` (Primary Key)
- `product_id` (Foreign Key to products)
- `count_delta` (Integer, Required) - Change in stock (positive or negative)
- `count_before` (Integer, Required) - Stock before change
- `count_after` (Integer, Required) - Stock after change
- `note` (Text, Optional) - Reason for change
- `date_time` (DateTime, Required)
- `created_by` (Foreign Key to users)
- `created_at` (Timestamp)

### Mandobe Payments Table
- `id` (Primary Key)
- `mandobe_id` (Foreign Key to mandobes)
- `amount` (Decimal, Required)
- `payment_date` (Date, Required)
- `note` (Text, Optional)
- `created_by` (Foreign Key to users)
- `created_at` (Timestamp)

### Supplier Orders Table
- `id` (Primary Key)
- `supplier_id` (Foreign Key to suppliers)
- `total` (Decimal, Required)
- `status` (Enum: pending, completed, cancelled)
- `order_date` (Date, Required)
- `notes` (Text, Optional)
- `created_by` (Foreign Key to users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Supplier Payments Table
- `id` (Primary Key)
- `supplier_id` (Foreign Key to suppliers)
- `supplier_order_id` (Foreign Key to supplier_orders, Optional)
- `amount` (Decimal, Required)
- `payment_date` (Date, Required)
- `note` (Text, Optional)
- `created_by` (Foreign Key to users)
- `created_at` (Timestamp)

### Order Codes Table
- `id` (Primary Key, Always 1)
- `current` (Integer, Required) - Current order code counter
- `updated_at` (Timestamp)

## Field Mapping (Flutter ⇄ Backend)

For compatibility with Flutter application, the following field mappings are used:

### Orders
| Flutter Field | Backend Field | Notes |
|--------------|---------------|-------|
| `orderCode` | `order_code` | Auto-generated if not provided |
| `dateTime` | `date_time` | ISO8601 format |
| `phoneTow` | `phone_two` | Optional second phone |
| `mandobeName` | `mandobe_id` | Can send name, returns both ID and name |
| `code` | `marketer_id` | Can send name, returns both ID and name |

### Order Details
| Flutter Field | Backend Field | Notes |
|--------------|---------------|-------|
| `count` | `quantity` | Number of items |

### General Rules
- All dates are in ISO8601 format
- Boolean fields: `sells`, `mandobe`
- Numeric fields: `total`, `price`, `count`
- All responses include `timestamp` field

## API Changes Summary (v2.0)

### New Endpoints
1. **Authentication**
   - `POST /auth/refresh` - Refresh access token
   - `POST /auth/logout` - Logout user

2. **Orders**
   - `GET /orders/:id` - Get single order
   - `PUT /orders/:id/status` - Update order status
   - `PUT /orders/:id/mandobe` - Update order mandobe
   - `PUT /orders/:id/payment` - Update commission payment status
   - `GET /orders/statistics` - Get orders statistics
   - `GET /orders/next-code` - Get next order code

3. **Products**
   - `PUT /products/:id/stock` - Update product stock
   - `GET /products/:id/history` - Get stock change history

### Enhanced Features
1. **Orders**
   - Advanced filtering (status, city, dates, mandobe, marketer, sells)
   - Sorting by date (ascending/descending)
   - Search in order code
   - Auto-generated order codes
   - Commission payment tracking

2. **Products**
   - Product types (gift, mattress, regular)
   - Stock change tracking with history
   - Delta-based stock updates

3. **Authentication**
   - Refresh tokens (90 days expiry)
   - User permissions in login response
   - Sales role support

4. **Socket.io**
   - Product events (new, updated, deleted, stock_updated)
   - Marketer events
   - Mandobe events
   - Supplier events
   - Vault events

### Breaking Changes
None. All changes are backward compatible. New fields are optional.

### Deprecated
None.

## Token Management

### Access Token
- **Expiry**: 30 days (configurable via JWT_EXPIRES_IN)
- **Usage**: Include in Authorization header for all authenticated requests
- **Format**: `Authorization: Bearer <token>`

### Refresh Token
- **Expiry**: 90 days
- **Usage**: Use to get new access token when expired
- **Endpoint**: `POST /auth/refresh`
- **Storage**: Store securely on client side

### Recommended Flow
1. Login → Receive `token` and `refreshToken`
2. Use `token` for API requests
3. On 401 error → Call `/auth/refresh` with `refreshToken`
4. Receive new `token` → Retry original request
5. If refresh fails → Redirect to login

## Pagination

All list endpoints support pagination with the following parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering & Sorting

### Orders Filtering
- `status` - Filter by order status
- `city` - Filter by city (partial match)
- `mandobe_id` - Filter by mandobe
- `marketer_id` - Filter by marketer
- `sells` - Filter by commission payment (paid/unPaid)
- `dateFrom` - Filter from date (ISO8601)
- `dateTo` - Filter to date (ISO8601)
- `sort` - Sort order (dateTime_asc/dateTime_desc)
- `q` - Search in customer name, phone, or order code

### Example
```
GET /api/orders?status=accept&city=Cairo&dateFrom=2025-01-01T00:00:00Z&dateTo=2025-12-31T23:59:59Z&sort=dateTime_desc&page=1&limit=20
```

## Best Practices

### 1. Error Handling
Always check the `success` field in responses:
```javascript
if (response.success) {
  // Handle success
  const data = response.data;
} else {
  // Handle error
  const message = response.message;
  const errors = response.errors; // Validation errors
}
```

### 2. Token Refresh
Implement automatic token refresh:
```javascript
async function apiCall(endpoint, options) {
  let response = await fetch(endpoint, options);
  
  if (response.status === 401) {
    // Token expired, refresh it
    const newToken = await refreshToken();
    options.headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(endpoint, options);
  }
  
  return response;
}
```

### 3. Socket.io Connection
Connect once and reuse:
```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: false
});

// Connect after login
socket.connect();

// Listen to events
socket.on('order:new', handleNewOrder);
socket.on('product:stock_updated', handleStockUpdate);

// Disconnect on logout
socket.disconnect();
```

### 4. Date Handling
Always use ISO8601 format:
```javascript
// JavaScript
const date = new Date().toISOString();

// Flutter/Dart
final date = DateTime.now().toIso8601String();
```

## Support & Documentation

- **API Documentation**: This file (API.md)
- **Permissions Guide**: PERMISSIONS.md
- **Flutter Integration Guide**: FLUTTER_INTEGRATION.md
- **Quick Start Guide**: QUICKSTART.md
- **Authentication Changes**: AUTH_CHANGES.md
- **Changes Log**: CHANGES.md
- **Summary**: SUMMARY.md

## Version History

### v2.0 (Current)
- Added refresh token support
- Added advanced order filtering
- Added order statistics endpoint
- Added product stock management
- Added product history tracking
- Added auto-generated order codes
- Enhanced Socket.io events
- Added 7 new database tables
- **Added comprehensive permissions system (14 permissions)**
- **Added users management endpoints (8 new endpoints)**
- **Added role-based access control (4 roles: admin, sales, marketer, mandobe)**
- **Changed authentication from phone to username**
- Added `roleNameArabic` field for Arabic role names
- Added custom permissions per user with role defaults

### v1.0
- Initial release
- Basic CRUD for orders, products, suppliers, marketers, mandobes
- JWT authentication
- Socket.io real-time events
- Pagination support
