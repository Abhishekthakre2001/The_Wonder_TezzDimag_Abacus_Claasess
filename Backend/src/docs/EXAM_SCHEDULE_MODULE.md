# Exam Schedule CRUD Module

Complete CRUD module for managing exam schedules in the Abacus Product backend.

## Overview

This module provides a production-ready implementation for creating, reading, updating, and deleting exam schedules. It includes comprehensive validation, pagination, filtering, searching, and export functionality.

## Files Created

```
Backend/
├── src/
│   ├── models/
│   │   └── examSchedule.model.js          # Database operations
│   ├── services/
│   │   └── examSchedule.service.js        # Business logic and validation
│   ├── controllers/
│   │   └── examSchedule.controller.js     # HTTP request handlers
│   ├── routes/
│   │   └── examSchedule.routes.js         # API endpoints
│   ├── docs/
│   │   └── examSchedule.swagger.yaml      # Swagger documentation
│   └── migrations/
│       └── 002_create_exam_schedules.sql  # Database schema
└── server.js                               # Updated with new routes
```

## Database Setup

### 1. Create Table

Run the migration SQL to create the `exam_schedules` table:

```bash
cd Backend
mysql -u root -p your_database < src/migrations/002_create_exam_schedules.sql
```

Or execute directly in MySQL:

```sql
-- Copy the content from src/migrations/002_create_exam_schedules.sql and run it
```

### 2. Table Structure

```sql
CREATE TABLE exam_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_title VARCHAR(255) NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  exam_status ENUM('Active', 'Inactive') DEFAULT 'Active',
  exam_category ENUM('Abacus', 'Vedic') NOT NULL,
  exam_type ENUM('Mock', 'Main Exam') NOT NULL,
  exam_level JSON,
  exam_set JSON,
  exam_state JSON,
  exam_district JSON,
  exam_institute JSON,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## API Endpoints

### Base URL
```
/exam-schedules
```

### Authentication
All endpoints require JWT authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### 1. Create Exam Schedule

**Endpoint:** `POST /exam-schedules`

**Request Body:**
```json
{
  "exam_title": "Mathematics Final Exam",
  "start_datetime": "2026-07-15T10:00:00Z",
  "end_datetime": "2026-07-15T12:00:00Z",
  "exam_status": "Active",
  "exam_category": "Abacus",
  "exam_type": "Mock",
  "exam_level": [1, 2, 3],
  "exam_set": [101, 102],
  "exam_state": [1, 2],
  "exam_district": [10, 11],
  "exam_institute": [5, 6]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Exam Schedule created successfully",
  "data": {
    "id": 1,
    "exam_title": "Mathematics Final Exam",
    "start_datetime": "2026-07-15T10:00:00Z",
    "end_datetime": "2026-07-15T12:00:00Z",
    "exam_status": "Active",
    "exam_category": "Abacus",
    "exam_type": "Mock",
    "exam_level": [1, 2, 3],
    "exam_set": [101, 102],
    "exam_state": [1, 2],
    "exam_district": [10, 11],
    "exam_institute": [5, 6]
  }
}
```

---

### 2. Get All Exam Schedules

**Endpoint:** `GET /exam-schedules`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number for pagination |
| limit | integer | 10 | Records per page (max 100) |
| search | string | - | Search by exam_title |
| exam_status | string | - | Filter: "Active" or "Inactive" |
| exam_category | string | - | Filter: "Abacus" or "Vedic" |
| exam_type | string | - | Filter: "Mock" or "Main Exam" |

**Examples:**

Get all schedules (page 1, 10 records):
```
GET /exam-schedules
```

Get with pagination:
```
GET /exam-schedules?page=2&limit=20
```

Search by title:
```
GET /exam-schedules?search=Mathematics
```

Filter by status and category:
```
GET /exam-schedules?exam_status=Active&exam_category=Abacus
```

Combined filters:
```
GET /exam-schedules?page=1&limit=10&search=Math&exam_status=Active&exam_category=Abacus&exam_type=Mock
```

**Response (200):**
```json
{
  "success": true,
  "message": "Exam Schedules retrieved successfully",
  "data": [
    {
      "id": 1,
      "exam_title": "Mathematics Final Exam",
      "start_datetime": "2026-07-15T10:00:00Z",
      "end_datetime": "2026-07-15T12:00:00Z",
      "exam_status": "Active",
      "exam_category": "Abacus",
      "exam_type": "Mock",
      "exam_level": [1, 2, 3],
      "exam_set": [101, 102],
      "exam_state": [1, 2],
      "exam_district": [10, 11],
      "exam_institute": [5, 6],
      "created_by": 1,
      "created_at": "2026-07-02T10:30:00Z",
      "updated_at": "2026-07-02T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### 3. Get Single Exam Schedule

**Endpoint:** `GET /exam-schedules/:id`

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Exam Schedule ID |

**Response (200):**
```json
{
  "success": true,
  "message": "Exam Schedule retrieved successfully",
  "data": {
    "id": 1,
    "exam_title": "Mathematics Final Exam",
    "start_datetime": "2026-07-15T10:00:00Z",
    "end_datetime": "2026-07-15T12:00:00Z",
    "exam_status": "Active",
    "exam_category": "Abacus",
    "exam_type": "Mock",
    "exam_level": [1, 2, 3],
    "exam_set": [101, 102],
    "exam_state": [1, 2],
    "exam_district": [10, 11],
    "exam_institute": [5, 6],
    "created_by": 1,
    "created_at": "2026-07-02T10:30:00Z",
    "updated_at": "2026-07-02T10:30:00Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Exam Schedule not found"
}
```

---

### 4. Update Exam Schedule

**Endpoint:** `PUT /exam-schedules/:id`

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Exam Schedule ID |

**Request Body (partial update allowed):**
```json
{
  "exam_title": "Mathematics Final Exam - Updated",
  "exam_status": "Inactive"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Exam Schedule updated successfully",
  "data": {
    "id": 1,
    "exam_title": "Mathematics Final Exam - Updated",
    "start_datetime": "2026-07-15T10:00:00Z",
    "end_datetime": "2026-07-15T12:00:00Z",
    "exam_status": "Inactive",
    "exam_category": "Abacus",
    "exam_type": "Mock",
    "exam_level": [1, 2, 3],
    "exam_set": [101, 102],
    "exam_state": [1, 2],
    "exam_district": [10, 11],
    "exam_institute": [5, 6],
    "created_by": 1,
    "created_at": "2026-07-02T10:30:00Z",
    "updated_at": "2026-07-02T15:45:00Z"
  }
}
```

---

### 5. Delete Exam Schedule

**Endpoint:** `DELETE /exam-schedules/:id`

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Exam Schedule ID |

**Response (200):**
```json
{
  "success": true,
  "message": "Exam Schedule deleted successfully"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Exam Schedule not found"
}
```

---

### 6. Export Exam Schedules

**Endpoint:** `GET /exam-schedules/export`

**Query Parameters:**
| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| format | string | json, csv | json | Export format |
| search | string | - | - | Search term |
| exam_status | string | Active, Inactive | - | Filter by status |
| exam_category | string | Abacus, Vedic | - | Filter by category |
| exam_type | string | Mock, Main Exam | - | Filter by type |

**Examples:**

Export as JSON:
```
GET /exam-schedules/export?format=json
```

Export as CSV:
```
GET /exam-schedules/export?format=csv
```

Export filtered data as CSV:
```
GET /exam-schedules/export?format=csv&exam_status=Active&exam_category=Abacus
```

**Response (200) - JSON Format:**
```json
{
  "success": true,
  "message": "Export successful",
  "data": [
    {
      "id": 1,
      "exam_title": "Mathematics Final Exam",
      "start_datetime": "2026-07-15T10:00:00Z",
      "end_datetime": "2026-07-15T12:00:00Z",
      "exam_status": "Active",
      "exam_category": "Abacus",
      "exam_type": "Mock",
      "exam_level": [1, 2, 3],
      "exam_set": [101, 102],
      "exam_state": [1, 2],
      "exam_district": [10, 11],
      "exam_institute": [5, 6],
      "created_by": 1,
      "created_at": "2026-07-02T10:30:00Z",
      "updated_at": "2026-07-02T10:30:00Z"
    }
  ]
}
```

**Response (200) - CSV Format:**
```
id,exam_title,start_datetime,end_datetime,exam_status,exam_category,exam_type,exam_level,exam_set,exam_state,exam_district,exam_institute,created_by,created_at,updated_at
1,"Mathematics Final Exam","2026-07-15 10:00:00","2026-07-15 12:00:00","Active","Abacus","Mock","[1,2,3]","[101,102]","[1,2]","[10,11]","[5,6]",1,"2026-07-02 10:30:00","2026-07-02 10:30:00"
```

---

## Validation Rules

### Required Fields
- `exam_title` - Non-empty string
- `start_datetime` - Valid datetime
- `end_datetime` - Valid datetime
- `exam_status` - Required for creation
- `exam_category` - Required for creation
- `exam_type` - Required for creation

### Enum Values

**exam_status:**
- `Active`
- `Inactive`

**exam_category:**
- `Abacus`
- `Vedic`

**exam_type:**
- `Mock`
- `Main Exam`

### Business Rules
- `end_datetime` must be greater than `start_datetime`
- Each user can only access their own records (`created_by = req.user.id`)
- Update and delete operations only work for the record creator
- All JSON array fields (exam_level, exam_set, exam_state, exam_district, exam_institute) are optional

### Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "end_datetime must be greater than start_datetime"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Exam Schedule not found"
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Failed to create exam schedule"
}
```

---

## Code Architecture

### Model (`examSchedule.model.js`)
- Direct database operations using mysql2/promise
- Handles SQL query execution
- All methods are async

### Service (`examSchedule.service.js`)
- Business logic and validation
- Data transformation and parsing
- CSV conversion
- Error handling with proper status codes

### Controller (`examSchedule.controller.js`)
- HTTP request/response handling
- Calls service methods
- Returns JSON responses with standard format
- Error catching and proper status codes

### Routes (`examSchedule.routes.js`)
- Route definitions
- JWT middleware protection
- Route documentation

---

## Usage Examples

### cURL Examples

**Create Exam Schedule:**
```bash
curl -X POST http://localhost:4001/exam-schedules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "exam_title": "Mathematics Final Exam",
    "start_datetime": "2026-07-15T10:00:00Z",
    "end_datetime": "2026-07-15T12:00:00Z",
    "exam_status": "Active",
    "exam_category": "Abacus",
    "exam_type": "Mock",
    "exam_level": [1, 2, 3],
    "exam_set": [101, 102]
  }'
```

**Get All Exam Schedules:**
```bash
curl -X GET "http://localhost:4001/exam-schedules?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Get Single Exam Schedule:**
```bash
curl -X GET http://localhost:4001/exam-schedules/1 \
  -H "Authorization: Bearer <token>"
```

**Update Exam Schedule:**
```bash
curl -X PUT http://localhost:4001/exam-schedules/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "exam_title": "Mathematics Final Exam - Updated"
  }'
```

**Delete Exam Schedule:**
```bash
curl -X DELETE http://localhost:4001/exam-schedules/1 \
  -H "Authorization: Bearer <token>"
```

**Export as CSV:**
```bash
curl -X GET "http://localhost:4001/exam-schedules/export?format=csv" \
  -H "Authorization: Bearer <token>" \
  -o exam-schedules.csv
```

---

## Swagger Documentation

Access the Swagger UI at: `http://localhost:4001/swagger`

All endpoints are documented with:
- Request/response schemas
- Query parameters
- Request body examples
- Response examples
- HTTP status codes

---

## Testing

### Postman Collection

You can import the endpoints into Postman:

1. Create a new collection
2. Add requests for each endpoint
3. Set the `Authorization` header with Bearer token
4. Test different combinations of query parameters

### Unit Testing

The service layer can be tested independently:

```javascript
const service = require('./src/services/examSchedule.service');

// Test validation
const validation = service.validateExamSchedule({
  exam_title: "Test Exam",
  start_datetime: "2026-07-15T10:00:00Z",
  end_datetime: "2026-07-15T12:00:00Z",
  exam_status: "Active",
  exam_category: "Abacus",
  exam_type: "Mock"
});

console.log(validation);
```

---

## Performance Considerations

### Indexes
The migration creates indexes on:
- `created_by` - Faster user-specific queries
- `exam_status`, `exam_category`, `exam_type` - Faster filtering
- `created_at` - Faster sorting
- `exam_title` - Full-text search support

### Pagination
- Default limit: 10 records
- Maximum limit: 100 records
- Prevents large result sets from impacting performance

### JSON Columns
- Stored as JSON in database
- Automatically serialized/deserialized by the service layer
- Supports filtering if needed in future

---

## Common Issues & Solutions

### Issue: "Exam Schedule not found"
**Cause:** Trying to access another user's record
**Solution:** Only authenticated users can access their own records. Check `created_by` matches `req.user.id`

### Issue: "end_datetime must be greater than start_datetime"
**Cause:** Invalid datetime range
**Solution:** Ensure end_datetime is after start_datetime

### Issue: JWT token expired
**Cause:** Token has expired
**Solution:** Re-authenticate and get a new token

### Issue: CSV export contains escaped quotes
**Cause:** String values with special characters
**Solution:** This is normal CSV format; Excel/Sheets handles it correctly

---

## Security Features

✅ JWT authentication required for all endpoints
✅ User-level data isolation (created_by check)
✅ Prepared statements to prevent SQL injection
✅ Input validation and sanitization
✅ CORS middleware enabled
✅ Helmet security headers
✅ Rate limiting available (currently optional in server.js)

---

## Future Enhancements

- Batch operations (create/update multiple records)
- Bulk delete functionality
- Advanced filtering (date range, etc.)
- Exam status change notifications
- Scheduled email notifications
- Integration with exam execution system
- Performance metrics and analytics

---

## Support

For issues or questions:
1. Check the Swagger documentation at `/swagger`
2. Review the error messages returned
3. Check the migration file for table structure
4. Verify JWT token is valid
5. Check user permissions

---

## Changelog

### Version 1.0.0
- Initial release
- Complete CRUD operations
- Pagination, search, filtering, sorting
- CSV/JSON export
- Comprehensive validation
- Swagger documentation
- Migration script

