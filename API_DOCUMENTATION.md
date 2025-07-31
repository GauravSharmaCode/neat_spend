# NeatSpend API Documentation

> Complete API reference for the NeatSpend microservices platform

## Base URLs

- **Nginx API Gateway**: `http://localhost:8080`
- **User Service (Direct)**: `http://localhost:3001`
- **Gateway Health Check**: `http://localhost:8090/nginx-health`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

### Token Format
```json
{
  "id": "user-uuid",
  "iat": 1753487210
}
```

---

## Gateway Endpoints

### Gateway Info
```http
GET /
```

**Response:**
```json
{
  "status": "success",
  "message": "NeatSpend Nginx API Gateway"
}
```

### Gateway Health
```http
GET /health
```

**Response:**
```json
{
  "status": "success",
  "message": "Gateway healthy"
}
```

---

## Authentication Endpoints

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-07-31T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "jwt-token-here"
  }
}
```

---

## User Management Endpoints

### Get Current User Profile
```http
GET /api/v1/users/me
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "b4945363-9211-47ed-b9a3-ff9f5485202e",
      "email": "test@gmail.com",
      "firstName": "Test",
      "lastName": "User",
      "name": "Test User",
      "phone": "891231",
      "isActive": true,
      "isVerified": false,
      "role": "user",
      "lastLoginAt": "2025-07-25T23:48:12.784Z",
      "createdAt": "2025-07-25T23:43:54.626Z",
      "updatedAt": "2025-07-25T23:48:12.785Z",
      "deletedAt": null
    }
  }
}
```

### List All Users (Admin Only)
```http
GET /api/v1/users
Authorization: Bearer <admin-jwt-token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "User",
        "lastName": "Name",
        "role": "user",
        "isActive": true,
        "createdAt": "2025-07-31T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Response (403):**
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "status": "fail|error",
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Authentication Errors

**No Token:**
```json
{
  "status": "fail",
  "message": "You are not logged in! Please log in to get access."
}
```

**Invalid Token:**
```json
{
  "status": "fail",
  "message": "Invalid token. Please log in again!"
}
```

**Insufficient Permissions:**
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action"
}
```

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per second
- **General API endpoints**: 10 requests per second
- **Burst limit**: 20 requests

---

## Recent Updates

### ✅ Fixed Issues (Latest)
- **Nginx Gateway Routing**: Fixed `/api/v1/users/*` → `/users/*` mapping
- **Nginx Gateway Routing**: Fixed `/api/v1/auth/*` → `/auth/*` mapping
- **Error Handling**: All errors now return proper JSON responses
- **Authentication**: JWT token validation working correctly
- **Authorization**: Role-based access control implemented

### 🔧 Technical Details
- **Gateway**: Nginx-based high-performance routing
- **Authentication**: JWT tokens with role-based permissions
- **Error Format**: Standardized JSON error responses
- **Health Checks**: Comprehensive service monitoring

---

## Testing Examples

### Using cURL

**Get current user:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/v1/users/me
```

**Login:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@gmail.com","password":"password"}' \
     http://localhost:8080/api/v1/auth/login
```

### Using Postman

1. Set base URL: `http://localhost:8080`
2. Add Authorization header: `Bearer <your-jwt-token>`
3. Set Content-Type: `application/json` for POST requests

---

## Support

For issues or questions:
- Check service health: `GET /health`
- View logs: `docker-compose logs <service-name>`
- Restart services: `docker-compose restart`