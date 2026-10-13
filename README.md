# Production-ready-backend-api

> A robust, RESTful backend API built with Node.js, Express, and MongoDB. Features dual-token JWT session rotation via HTTPOnly cookies, email verification workflows, input validation middleware, and centralized error handling.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white) ![Auth](https://img.shields.io/badge/Auth-JWT%20%26%20Cookies-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## Architecture and design

The service follows a layered architecture to keep routing, input sanitization, business logic, and database operations decoupled:

```
Request -> CORS / Cookie Parser -> Router -> express-validator -> Controller (asyncHandler) -> Mongoose Model
                                                                       |
                                                               (Throws ApiError)
                                                                       v
                                                           Centralized errorHandler -> JSON Response
```

### Core mechanisms

* **Session and token rotation:** Authentication issues a short-lived access token and a long-lived refresh token. Both are delivered in HTTPOnly, secure cookies to mitigate client-side script access. When the client hits `/refresh-token`, the stored refresh token is verified against MongoDB, invalidated, and replaced with a newly generated pair.
* **Input validation pipeline:** Route handlers use `express-validator` schemas before controller execution. Validation failures short-circuit with HTTP 422 and a structured list of field-level errors.
* **Centralized error handling:** All asynchronous controllers run through an `asyncHandler` wrapper. Controller exceptions throw instances of `ApiError`, which pass to a top-level error middleware that guarantees predictable JSON responses across all status codes.
* **Email verification and recovery:** Uses Nodemailer and Mailgen to send HTML verification emails and password reset links with time-bounded, SHA-256 hashed temporary tokens.

## Endpoints

Base URL: `/api/v1`

### Healthcheck

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/healthcheck` | Public | Returns service status and liveness confirmation |

### Authentication and sessions

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register user account and trigger verification email |
| `GET` | `/auth/verify-email/:verificationToken` | Public | Verify account email address |
| `POST` | `/auth/login` | Public | Authenticate user and issue access and refresh cookies |
| `POST` | `/auth/refresh-token` | Public | Rotate refresh token and issue new access token |
| `POST` | `/auth/forgot-password` | Public | Generate time-limited password reset link |
| `POST` | `/auth/reset-password/:resetToken` | Public | Set new password using reset token |
| `GET` | `/auth/current-user` | Protected | Fetch authenticated user profile |
| `POST` | `/auth/change-password` | Protected | Update password for authenticated user |
| `POST` | `/auth/resend-email-verification` | Protected | Trigger new verification email for unverified user |
| `POST` | `/auth/logout` | Protected | Invalidate refresh token and clear session cookies |

## Project layout

```
src/
├── controllers/      # Request handlers and business logic
├── db/               # Database connection logic
├── middlewares/      # Authentication, validation, and error middlewares
├── models/           # Mongoose schemas, hooks, and instance methods
├── routes/           # Express route definitions
├── utils/            # ApiError, ApiResponse, asyncHandler, and mail utilities
├── validators/       # Input validation schemas (express-validator)
├── app.js            # Express app assembly and middleware configuration
└── index.js          # Server entry point and database initialization
```

## Setup and local development

### Prerequisites

* Node.js 18 or later
* MongoDB instance (local or Atlas)
* SMTP credentials (such as Mailtrap) for email delivery

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/production-ready-backend-api.git
   cd production-ready-backend-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   PORT=8000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   MONGO_URI=mongodb://127.0.0.1:27017/production-ready-backend-api
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   MAILTRAP_SMTP_HOST=sandbox.smtp.mailtrap.io
   MAILTRAP_SMTP_PORT=2525
   MAILTRAP_SMTP_USER=your_smtp_user
   MAILTRAP_SMTP_PASS=your_smtp_password
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:8000`.

## Response format

All endpoints return a standardized JSON structure.

### Success response

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "66d1234567890abcdef12345",
      "username": "janedoe",
      "email": "jane@example.com",
      "isEmailVerified": false
    }
  },
  "message": "User registered successfully",
  "success": true
}
```

### Error response

```json
{
  "statusCode": 422,
  "message": "Received data is not valid",
  "success": false,
  "errors": [
    {
      "email": "Email is invalid"
    }
  ]
}
```

## License

MIT
