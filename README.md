# 🚀 Production Grade Backend API

> A robust, RESTful backend service for a collaborative project management system. Engineered with a focus on security, role-based access control (RBAC), and hierarchical data integrity.

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## 📋 Engineering Overview

This project is not just a CRUD application. It is architected to solve the complexities of team collaboration, secure authentication, and state management.

### Core Architecture
* **Layered Architecture:** Strict separation of concerns between Routes, Controllers, and Models for maintainability.
* **Security First:**
    * **Token Rotation:** Implements Access & Refresh token rotation to prevent session hijacking.
    * **Input Sanitization:** Uses `express-validator` middleware to validate all incoming data before it reaches the controller.
    * **Secure Headers:** CORS configuration restricts access to trusted origins only.

## ✨ Key Features

* **🔐 Advanced Auth:** Secure registration flow with email verification (Nodemailer/Mailgen) and password resets.
* **🛡️ Granular RBAC:** distinct permission levels for **Admins** (system wide), **Project Admins** (project scope), and **Members**.
* **📂 Hierarchical Data:** Handles complex relationships: Projects → Tasks → Subtasks.
* **⚡ Resilient Error Handling:** Centralized `ApiError` class ensures consistent error responses across the entire application.

## 🛠️ Tech Stack & Utilities

* **Runtime:** Node.js & Express.js
* **Database:** MongoDB with Mongoose ODM
* **Validation:** Express-Validator
* **Async Handling:** Custom `asyncHandler` wrapper to avoid repetitive try-catch blocks.

## 🏗️ System Architecture

The application follows a production-ready **MVC (Model-View-Controller)** pattern to ensure separation of concerns and scalability.

### Data Flow Strategy
1.  **Request Entry:** Client hits the API Route `(src/routes/*.js)`.
2.  **Security Layer:** Request passes through Middleware `(src/middlewares)`:
    * **CORS:** Origin validation.
    * **Cookie Parser:** extracting secure HTTPOnly cookies.
    * **Validation:** `express-validator` sanitizes inputs.
3.  **Business Logic:** Controllers `(src/controllers)` handle the complexity, stripping logic away from routes.
    * *Example:* `registerUser` handles the transaction, hashing, and token generation.
4.  **Data Access:** Mongoose Models `(src/models)` strictly define the schema and handle DB interactions.
5.  **Utilities:** Reusable helpers like `AsyncHandler` and `ApiError` standardize responses across the system.

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/project-camp-backend.git](https://github.com/YOUR_USERNAME/project-camp-backend.git)
    cd project-camp-backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    PORT=8000
    MONGODB_URI=your_mongodb_connection_string
    CORS_ORIGIN=http://localhost:5173
    ACCESS_TOKEN_SECRET=your_access_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_secret
    REFRESH_TOKEN_EXPIRY=10d
    ```

4.  **Run the Server**
    ```bash
    npm run dev
    ```

## 👨‍💻 Author

**Anurag Bhatt**
* Full Stack Developer

---
*This project strictly follows the architecture defined in the [Design Document](PRD.md).*
