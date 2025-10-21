# Sales Management API Server

A comprehensive sales management API server built with Node.js, Express, Sequelize, MySQL, and Socket.io. This backend is designed to work seamlessly with Flutter applications.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (admin, marketer, mandobe)
- **Real-time Updates**: Socket.io integration for live notifications
- **Comprehensive CRUD Operations**: Full management of orders, products, suppliers, marketers, and mandobes
- **Data Validation**: Input validation using express-validator
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Winston-based logging system
- **Pagination**: Built-in pagination for all list endpoints
- **Security**: Helmet, CORS, and request sanitization
- **Database Migrations**: Sequelize migrations for database schema management

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=sales_db
   
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=30d
   
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run setup
   ```

   This command will:
   - Create the database if it doesn't exist
   - Run all migrations
   - Seed the database with initial data (admin user)

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "01000000000",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "name": "Admin",
      "phone": "01000000000",
      "role": "admin"
    }
  },
  "message": "Login successful",
  "timestamp": "2025-01-16T10:00:00.000Z"
}
```

### Protected Endpoints

All endpoints except `/api/auth/login` and `/api/health` require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Orders

#### List Orders (with pagination)
```http
GET /api/orders?page=1&limit=10&q=search_term
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

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

#### Update Order
```http
PUT /api/orders/:id
Content-Type: application/json

{
  "status": "accept",
  "notes": "Updated notes"
}
```

#### Delete Order
```http
DELETE /api/orders/:id
```

### Products

#### List Products
```http
GET /api/products?page=1&limit=10
```

#### Create Product
```http
POST /api/products
Content-Type: application/json

{
  "code": "PROD001",
  "name": "Product Name",
  "count": 100
}
```

#### Update Product
```http
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "count": 150
}
```

#### Delete Product
```http
DELETE /api/products/:id
```

### Suppliers, Marketers, Mandobes

Similar CRUD operations are available for:
- `/api/suppliers`
- `/api/marketers`
- `/api/mandobes`

### Profile Management

#### Get Profile
```http
GET /api/profile
```

#### Update Profile
```http
PUT /api/profile
Content-Type: application/json

{
  "name": "New Name",
  "phone": "01234567890"
}
```

#### Change Password
```http
PUT /api/profile/password
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Health Check

#### Check Server Status
```http
GET /api/health
```

## Socket.io Events

The server emits the following Socket.io events:

- `order:new` - When a new order is created
- `order:updated` - When an order is updated
- `order:deleted` - When an order is deleted

### Connecting to Socket.io

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('order:new', (data) => {
  console.log('New order:', data);
});

socket.on('order:updated', (data) => {
  console.log('Order updated:', data);
});

socket.on('order:deleted', (data) => {
  console.log('Order deleted:', data);
});
```

## Database Management

### Migrations
```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Reset database
npm run db:reset
```

### Seeders
```bash
# Run seeders
npm run db:seed

# Undo seeders
npm run db:seed:undo
```

## Logging

### View Logs
```bash
# View all logs
npm run logs

# View error logs only
npm run logs:error
```

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## Error Handling

The API uses a consistent error response format:

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

## User Roles

- **admin**: Full access to all operations
- **marketer**: Can create and update orders
- **mandobe**: Can view orders assigned to them

## Data Import

### Import Orders from External API
```bash
npm run import:orders
```

This will import orders from the configured source API (set `SOURCE_BASE_URL` and `SOURCE_TOKEN` in your `.env` file).

## Development

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Express middlewares
├── migrations/      # Database migrations
├── models/          # Sequelize models
├── routes/          # Express routes
├── seeders/         # Database seeders
├── utils/           # Utility functions
├── validators/      # Input validators
└── server.js        # Main server file
```

### Adding New Features

1. Create model in `src/models/`
2. Create migration in `src/migrations/`
3. Create controller in `src/controllers/`
4. Create validator in `src/validators/`
5. Add routes in `src/routes/index.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

