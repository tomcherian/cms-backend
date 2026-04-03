# CMS Backend - Frontend Integration Guide

## 1. Project Overview

This is a **Content Management System (CMS) Backend** focused on **attendance management**. The system manages team leads and their team members, allowing:
- User authentication (Admin and Team Lead roles)
- Admin users can create team leads and members
- Team leads can mark attendance for their team members
- Attendance tracking with history export capabilities
- Role-based access control

The backend uses **MongoDB** for data storage and **JWT tokens** for authentication.

---

## 2. Base URL & Port

- **Base URL**: `http://localhost:5000`
- **API Prefix**: `/api`
- **Full API base**: `http://localhost:5000/api`

### Environment Configuration
The server reads `PORT` from environment variables, defaulting to `5000` if not set.

Example for different environments:
- **Development**: `http://localhost:5000/api`
- **Production**: Update the port as per your deployment configuration

---

## 3. Authentication

### Authentication Method
- **Type**: JWT (JSON Web Token)
- **Algorithm**: HS256
- **Token Expiration**: 1 day (86400 seconds)

### Token Storage
- Store the JWT token in your client-side storage (localStorage or sessionStorage)
- Example: `localStorage.setItem('authToken', response.token)`

### Sending Tokens in Requests
- **Header**: `Authorization`
- **Format**: `Bearer <token>`
- **Example**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Token Payload Structure
```json
{
  "id": "user_mongo_id",
  "role": "ADMIN" or "TEAM_LEAD"
}
```

### Login Response
After successful login, you'll receive:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN"
  }
}
```

---

## 4. API Endpoints

### 4.1 Authentication Endpoints

#### Login
| Property | Value |
|----------|-------|
| **Method** | POST |
| **Path** | `/api/auth/login` |
| **Authentication Required** | No |

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 - Success):**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "string (MongoDB ObjectId)",
    "name": "string",
    "email": "string",
    "role": "ADMIN | TEAM_LEAD"
  }
}
```

**Response (401 - Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

#### Test Admin Access (Protected Route)
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Path** | `/api/auth/admin-test` |
| **Authentication Required** | Yes |
| **Role Required** | ADMIN |

**Response (200 - Success):**
```json
{
  "message": "Admin access granted"
}
```

---

### 4.2 Admin Endpoints

All admin endpoints require authentication and ADMIN role.

#### Create Team Lead
| Property | Value |
|----------|-------|
| **Method** | POST |
| **Path** | `/api/admin/team-lead` |
| **Authentication Required** | Yes (ADMIN only) |

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)"
}
```

**Response (201 - Created):**
```json
{
  "_id": "string (MongoDB ObjectId)",
  "name": "string",
  "email": "string",
  "password": "string (hashed, never expose to frontend)",
  "role": "TEAM_LEAD",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

**Response (400 - Email Already Exists):**
```json
{
  "message": "Email already exists"
}
```

---

#### Create Member
| Property | Value |
|----------|-------|
| **Method** | POST |
| **Path** | `/api/admin/member` |
| **Authentication Required** | Yes (ADMIN only) |

**Request Body:**
```json
{
  "name": "string (required)",
  "phone": "string (optional)",
  "teamLeadId": "string (required, MongoDB ObjectId of Team Lead)"
}
```

**Response (201 - Created):**
```json
{
  "_id": "string (MongoDB ObjectId)",
  "name": "string",
  "phone": "string",
  "teamLead": "string (Team Lead's MongoDB ObjectId)",
  "active": "boolean (default: true)",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

---

#### Get All Members
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Path** | `/api/admin/members` |
| **Authentication Required** | Yes (ADMIN only) |

**Query Parameters:** None

**Response (200 - Success):**
```json
[
  {
    "_id": "string (MongoDB ObjectId)",
    "name": "string",
    "phone": "string",
    "teamLead": {
      "_id": "string (Team Lead's MongoDB ObjectId)",
      "name": "string (Team Lead's name)",
      "email": "string (Team Lead's email)"
    },
    "active": "boolean",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
]
```

---

#### Get Members by Team Lead
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Path** | `/api/admin/members/:teamLeadId` |
| **Authentication Required** | Yes (ADMIN only) |

**URL Parameters:**
- `teamLeadId`: string (MongoDB ObjectId of Team Lead)

**Response (200 - Success):**
```json
[
  {
    "_id": "string (MongoDB ObjectId)",
    "name": "string",
    "phone": "string",
    "teamLead": "string (Team Lead's MongoDB ObjectId)",
    "active": "boolean",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
]
```

---

#### Mark Team Lead Attendance
| Property | Value |
|----------|-------|
| **Method** | POST |
| **Path** | `/api/admin/team-lead-attendance` |
| **Authentication Required** | Yes (ADMIN only) |

**Request Body:**
```json
{
  "teamLeadId": "string (required, MongoDB ObjectId)",
  "status": "PRESENT | ABSENT (required)",
  "reason": "string (optional, used for ABSENT status)"
}
```

**Response (201 - Created) or (200 - Updated if record exists for today):**
```json
{
  "_id": "string (MongoDB ObjectId)",
  "date": "ISO-8601 date (today's date at 00:00:00 UTC)",
  "member": "string (the Team Lead's MongoDB ObjectId)",
  "teamLead": "string (the Admin's MongoDB ObjectId)",
  "status": "PRESENT | ABSENT",
  "reason": "string (optional)",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

---

#### Export Attendance Data
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Path** | `/api/admin/export-attendance` |
| **Authentication Required** | Yes (ADMIN only) |

**Query Parameters:**
- `date`: string (required, format: YYYY-MM-DD or ISO-8601 date string)

**Response (200 - Success):**
- **Content-Type**: `text/csv`
- **File Name**: `attendance.csv`
- **CSV Format**:
```
Member,TeamLead,Status,Reason
John Doe,Jane Smith,PRESENT,
Jane Doe,Jane Smith,ABSENT,Sick leave
```

---

### 4.3 Team Lead Endpoints

All team lead endpoints require authentication and TEAM_LEAD role.

#### Get My Members
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Path** | `/api/team-lead/members` |
| **Authentication Required** | Yes (TEAM_LEAD only) |

**Response (200 - Success):**
```json
[
  {
    "_id": "string (MongoDB ObjectId)",
    "name": "string",
    "phone": "string",
    "teamLead": "string (current user's MongoDB ObjectId)",
    "active": "boolean",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
]
```

---

#### Mark Member Attendance
| Property | Value |
|----------|-------|
| **Method** | POST |
| **Path** | `/api/team-lead/attendance` |
| **Authentication Required** | Yes (TEAM_LEAD only) |

**Request Body:**
```json
{
  "memberId": "string (required, MongoDB ObjectId of team member)",
  "status": "PRESENT | ABSENT (required)",
  "reason": "string (optional, typically used for ABSENT)"
}
```

**Response (201 - Created) or (200 - Updated if record exists for today):**
```json
{
  "_id": "string (MongoDB ObjectId)",
  "date": "ISO-8601 date (today's date at 00:00:00 UTC)",
  "member": "string (the Member's MongoDB ObjectId)",
  "teamLead": "string (the current Team Lead's MongoDB ObjectId)",
  "status": "PRESENT | ABSENT",
  "reason": "string (optional)",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

**Response (403 - Forbidden):**
```json
{
  "message": "Not allowed to mark attendance for this member"
}
```

---

#### Get My Attendance History
| Property | Value |
|----------|-------|
| **Method** | GET |
| **Path** | `/api/team-lead/attendance-history` |
| **Authentication Required** | Yes (TEAM_LEAD only) |

**Query Parameters (Optional):**
- `startDate`: string (ISO-8601 date format, e.g., 2024-01-01T00:00:00Z)
- `endDate`: string (ISO-8601 date format, e.g., 2024-12-31T23:59:59Z)

*Note: If you provide `startDate` without `endDate` (or vice versa), both are ignored and all records are returned.*

**Response (200 - Success):**
```json
[
  {
    "_id": "string (MongoDB ObjectId)",
    "date": "ISO-8601 date",
    "member": {
      "_id": "string (Member's MongoDB ObjectId)",
      "name": "string (Member's name)"
    },
    "teamLead": "string (current user's MongoDB ObjectId)",
    "status": "PRESENT | ABSENT",
    "reason": "string (optional)",
    "createdAt": "ISO-8601 timestamp",
    "updatedAt": "ISO-8601 timestamp"
  }
]
```

---

## 5. Data Models

### 5.1 User Model
Represents system users (Admins and Team Leads)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | MongoDB ObjectId | Auto | Unique identifier |
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Unique email address |
| `password` | String | Yes | Hashed with bcryptjs (10 rounds) - never expose to frontend |
| `role` | String (Enum) | Yes | Either `ADMIN` or `TEAM_LEAD` |
| `createdAt` | ISO-8601 Timestamp | Auto | Creation timestamp |
| `updatedAt` | ISO-8601 Timestamp | Auto | Last update timestamp |

**User Roles:**
- `ADMIN`: Can create team leads and members, manage attendance
- `TEAM_LEAD`: Can manage their own members and mark attendance

---

### 5.2 Member Model
Represents team members under a Team Lead

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | MongoDB ObjectId | Auto | Unique identifier |
| `name` | String | Yes | Member's full name |
| `phone` | String | No | Member's phone number |
| `teamLead` | MongoDB ObjectId (Ref: User) | Yes | Reference to the Team Lead user |
| `active` | Boolean | No | Default: `true`. Used to mark member as active/inactive |
| `createdAt` | ISO-8601 Timestamp | Auto | Creation timestamp |
| `updatedAt` | ISO-8601 Timestamp | Auto | Last update timestamp |

---

### 5.3 Attendance Model
Represents attendance records for members and team leads

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `_id` | MongoDB ObjectId | Auto | Unique | Unique identifier |
| `date` | Date | Yes | Unique per member | Set to 00:00:00 UTC (normalized daily) |
| `member` | MongoDB ObjectId (Ref: Member) | Yes | - | Reference to the Member |
| `teamLead` | MongoDB ObjectId (Ref: User) | Yes | - | Reference to the Team Lead who marked attendance |
| `status` | String (Enum) | Yes | `PRESENT` or `ABSENT` | Attendance status |
| `reason` | String | No | - | Optional reason (e.g., sick leave, personal emergency) |
| `createdAt` | ISO-8601 Timestamp | Auto | - | Creation timestamp |
| `updatedAt` | ISO-8601 Timestamp | Auto | - | Last update timestamp |

**Unique Index:** `date + member` (Only one attendance record per member per day)

**Attendance Status Values:**
- `PRESENT`: Member is present
- `ABSENT`: Member is absent

---

## 6. Environment Variables

The backend requires the following environment variables. Create a `.env` file in the project root:

```bash
# Database Configuration
MONGO_URI=mongodb://localhost:27017/cms

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
```

### Environment Variables Explained

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `MONGO_URI` | String | No | `""` | MongoDB connection string. If empty or not set, connection will fail. |
| `JWT_SECRET` | String | Yes | N/A | Secret key for signing JWT tokens. Must be strong and unique in production. Tokens expires in 1 day. |
| `PORT` | Number | No | `5000` | Port on which the server runs. Automatically set to 5000 if not provided. |

### Example `.env` for Development
```bash
MONGO_URI=mongodb://localhost:27017/cms
JWT_SECRET=dev_secret_key_12345
PORT=5000
```

### Example `.env` for Production
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cms
JWT_SECRET=production_secret_key_very_long_and_random_string_here
PORT=3000
```

---

## 7. Error Handling

### Standard Error Response Format
All **error** responses follow this format:

```json
{
  "message": "string (error description)"
}
```

### Common HTTP Status Codes & Error Messages

| Status Code | Scenario | Response | Notes |
|-------------|----------|----------|-------|
| 200 | Success | Success response with data | Standard successful GET/POST request |
| 201 | Created | Created resource data | Returned when a new resource is created (POST) |
| 400 | Bad Request | `{ "message": "Email already exists" }` | Invalid email when creating user (email must be unique) |
| 401 | Unauthorized | `{ "message": "Invalid credentials" }` | Wrong email/password during login |
| 401 | Unauthorized | `{ "message": "Not authorized" }` | Missing or malformed Authorization header |
| 401 | Unauthorized | `{ "message": "Token invalid" }` | JWT token is invalid or expired (1 day expiry) |
| 403 | Forbidden | `{ "message": "Forbidden" }` | User lacks required role (e.g., TEAM_LEAD trying to access ADMIN endpoint) |
| 403 | Forbidden | `{ "message": "Not allowed to mark attendance for this member" }` | Team Lead trying to mark attendance for a member not under them |
| 500 | Server Error | `{ "message": "Server error" }` | Unexpected server error (catch-all for unhandled exceptions) |

### Error Handling Best Practices for Frontend

1. **Always check the status code** - Don't rely solely on response data
2. **Handle 401/403 errors** - Redirect user to login or permission denied page
3. **Display error messages** - Show the `message` field to users for clarity
4. **Retry logic for 500 errors** - Implement exponential backoff for server errors
5. **Token expiration** - If you receive a 401 "Token invalid" error, clear stored token and redirect to login

### Example Error Handling in JavaScript/React

```javascript
try {
  const response = await fetch('/api/admin/team-lead', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 401) {
      // Token expired or invalid - clear and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (response.status === 403) {
      // Permission denied
      console.error('Access denied:', error.message);
    } else if (response.status === 400) {
      // Bad request (e.g., email exists)
      console.error('Validation error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return;
  }

  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Network error:', error);
}
```

---

## 8. CORS Configuration

### Current CORS Setup
- **Status**: **Enabled for all origins**
- **Allowed Origins**: `*` (any origin can access the API)
- **Allowed Methods**: All standard HTTP methods (GET, POST, PUT, DELETE, etc.) are allowed

### Current Code
```javascript
app.use(cors());
```

### Important Notes for Frontend Development

1. **No credential headers required** - CORS requests do not require additional headers like `Origin` or `Access-Control-Allow-Credentials`
2. **All request types supported** - GET, POST, PUT, DELETE requests will work without issues
3. **Browser security** - Modern browsers will still enforce CORS policies, so ensure your frontend is served from the correct domain or `localhost`
4. **Testing locally** - When testing from `http://localhost:3000` (React/Next.js frontend), it should work fine with this CORS configuration

### Production Recommendation
For production, update the CORS configuration to restrict access to known frontend domains:

```javascript
// Example for production (not currently implemented)
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

---

## 9. Integration Checklist for Frontend Developer

- [ ] Set base URL to `http://localhost:5000/api` (adjust for production)
- [ ] Implement login form with email and password
- [ ] Store JWT token from login response (localStorage/sessionStorage)
- [ ] Add `Authorization: Bearer <token>` header to all protected requests
- [ ] Implement role-based conditional rendering (check user.role from login response)
- [ ] Create Admin dashboard with:
  - [ ] Create Team Lead form
  - [ ] Create Member form
  - [ ] View all members list
  - [ ] Mark attendance for team leads
  - [ ] Export attendance data (download CSV)
- [ ] Create Team Lead dashboard with:
  - [ ] View my members list
  - [ ] Mark attendance for members
  - [ ] View attendance history with date range filter
- [ ] Implement error handling (401, 403, 400, 500)
- [ ] Add token expiration check (redirect to login on 401)
- [ ] Handle loading states during API calls
- [ ] Validate form inputs before sending requests
- [ ] Test all endpoints with Postman/Insomnia before building UI

---

## 10. Example API Calls

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Create Team Lead Example
```bash
curl -X POST http://localhost:5000/api/admin/team-lead \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Mark Member Attendance Example
```bash
curl -X POST http://localhost:5000/api/team-lead/attendance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"memberId":"507f1f77bcf86cd799439011","status":"PRESENT"}'
```

### Export Attendance Example
```bash
curl -X GET "http://localhost:5000/api/admin/export-attendance?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o attendance.csv
```

---

## 11. Database Relationships

```
User (Admin/Team Lead)
  ├── 1:N → Member (Team Lead has multiple Members)
  │         └── 1:N → Attendance (Member has multiple Attendance records)
  └── 1:N → Attendance (Team Lead marked these attendance records)
```

### Detailed Relationships

1. **User → Member**: One Team Lead can have many Members (1:N)
2. **Member → Attendance**: One Member can have many Attendance records (1:N)
3. **User → Attendance**: One Team Lead can have many Attendance records they marked (1:N)

---

## 12. Quick Start for Frontend Dev

1. **Clone this repo** and run `npm install`
2. **Start backend**: `npm run dev`
3. **Backend runs on**: `http://localhost:5000`
4. **Create your frontend app** in React/Vue/Next.js/etc.
5. **Use base URL**: `http://localhost:5000/api`
6. **Test login**: Email and password must exist in database first
7. **Refer to this document** for all endpoint details

---

**Last Updated**: 2024
**Backend Version**: 1.0.0
