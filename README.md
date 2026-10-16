# CAMPUSFIND — Campus Lost & Found Management System

CAMPUSFIND is a modern, production-grade, RESTful backend API built for college campuses to manage lost and found items. It enables students to report lost or found property, search and filter listings, discover automated matches between lost and found items, and submit verified ownership claims with proof. Administrators can supervise users, review claims, monitor resolution statistics, and manage inventory via a dedicated admin portal.

---

## 🚀 Key Features

- **Authentication & RBAC:**
  - Secure registration and login using JWT (JSON Web Tokens).
  - Role-Based Access Control (`STUDENT` vs `ADMIN`).
  - Password hashing with bcrypt.
  - Profile retrieval and password updates.
- **Lost & Found Reporting:**
  - Report lost items with descriptions, dates, category, and campus locations.
  - Report found items with optional image uploads.
  - Automatic status tracking (`LOST`, `FOUND`, `CLAIMED`, `RESOLVED`, `CANCELLED`).
  - Search by keyword and filter by category, location, date range, and status.
- **Smart Rule-Based Matching Algorithm:**
  - Automatically correlates lost items with found items based on category, location, title keyword matching, and date proximity.
  - Scores candidate matches to help students quickly locate their belongings.
- **Claim & Verification Workflow:**
  - Students submit ownership claims for found items with detailed proof description and verification questions.
  - Administrators review claims with approval/rejection notes.
  - Approved claims automatically transition item status to `CLAIMED` / `RESOLVED` and reject competing pending claims.
- **Admin Management & Dashboard:**
  - System statistics (total items, resolved rate, claim activity, active students).
  - Student status management (activate / deactivate accounts).
  - Item listing override and purge controls.
- **Developer Experience:**
  - Auto-generated Swagger/OpenAPI interactive documentation (`/docs`) and ReDoc (`/redoc`).
  - Complete Postman collection included (`postman/CampusFind.postman_collection.json`).
  - Comprehensive Pytest test suite with SQLite in-memory testing for fast CI/local runs.

---

## 🏛️ System Architecture & Directory Structure

```text
Campus Lost and Found System/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Application entry point, lifecycle events & middleware
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic v2 settings & environment variables
│   │   └── security.py          # Password hashing, JWT token generation & verification
│   ├── database/
│   │   ├── __init__.py
│   │   ├── base.py              # DeclarativeBase model foundation
│   │   └── database.py          # SQLAlchemy engine, session maker & get_db dependency
│   ├── exceptions/
│   │   ├── __init__.py
│   │   ├── exceptions.py        # Custom domain exception classes
│   │   └── handlers.py          # Global FastAPI exception handlers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User model & UserRole enum
│   │   ├── item.py              # Item model, ItemType, Category, ItemStatus enums
│   │   └── claim.py             # Claim model & ClaimStatus enum
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py   # Database queries for users
│   │   ├── item_repository.py   # Database queries, filters & search for items
│   │   └── claim_repository.py  # Database queries for claims
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # Pydantic validation schemas for user requests/responses
│   │   ├── item.py              # Pydantic schemas for item CRUD & matching
│   │   ├── claim.py             # Pydantic schemas for claims & reviews
│   │   └── admin.py             # Pydantic schemas for admin dashboard
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py              # /api/auth endpoints (register, login)
│   │   ├── users.py             # /api/users endpoints (me, update password)
│   │   ├── items.py             # /api/items endpoints (CRUD, search, match, upload)
│   │   ├── claims.py            # /api/claims endpoints (submit, review, status)
│   │   └── admin.py             # /api/admin endpoints (dashboard, user & item management)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Authentication business logic
│   │   ├── item_service.py      # Item management & matching engine
│   │   └── claim_service.py     # Claim submission & approval workflow
│   └── utils/
│       ├── __init__.py
│       └── file_upload.py       # Validated image upload handling
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Pytest fixtures & in-memory test database
│   ├── test_auth.py             # Auth & user endpoint tests
│   ├── test_items.py            # Item CRUD, search & match tests
│   ├── test_claims.py           # Claim submission & approval workflow tests
│   └── test_admin.py            # Admin dashboard & management tests
├── postman/
│   └── CampusFind.postman_collection.json  # Complete Postman collection
├── .env.example                 # Example configuration template
├── .gitignore
├── pytest.ini                   # Pytest configuration
├── requirements.txt             # Project dependencies
└── README.md                    # Documentation
```

---

## ⚙️ Prerequisites

- **Python:** 3.12 or higher (use `python3` command)
- **MySQL:** 8.0 or higher
- **pip:** Latest version

---

## 🛠️ Step-by-Step Setup Guide

### 1. Clone or Open the Project
Open a terminal in the project root directory:
```bash
cd "Campus Lost and Found System"
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Review and adjust settings in `.env`:
```ini
# Database
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/campus_lost_found

# Security
JWT_SECRET_KEY=super-secret-key-change-this-in-production-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Admin Seed Account
ADMIN_EMAIL=admin@campusfind.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=System Administrator
ADMIN_STUDENT_ID=ADMIN001

# App
DEBUG=True
UPLOAD_DIR=uploads/items
MAX_FILE_SIZE_MB=5
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Set Up MySQL Database
Log into MySQL and create the database:
```sql
CREATE DATABASE campus_lost_found CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Install Dependencies
Using `python3`:
```bash
python3 -m pip install -r requirements.txt
```
*(If you are using a virtual environment, activate it first, e.g. `.venv\Scripts\activate` on Windows or `source .venv/bin/activate` on Linux/macOS).*

### 5. Initialize the Database & Seed Admin
The database tables and initial administrator user are automatically initialized on application startup when running FastAPI. Alternatively, table creation is invoked by the `app.main:create_tables` and `app.main:seed_admin` routines.

---

## 🏃 Running the Application

Start the development server with **python3**:
```bash
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Once started, the following URLs will be available:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`
- **Alternative Documentation (ReDoc):** `http://127.0.0.1:8000/redoc`
- **Health Check Endpoint:** `http://127.0.0.1:8000/health`

---

## 🧪 Running Automated Tests

CAMPUSFIND comes with an automated test suite covering authentication, items, matching, claims, and administrative functions. The tests run against an isolated SQLite in-memory database with foreign key constraints enabled, requiring no external MySQL instance for testing.

Run tests using **python3**:
```bash
python3 -m pytest
```

To run with verbose output and coverage:
```bash
python3 -m pytest -v
```

---

## 🔑 Default Credentials

### Administrator Account (Pre-seeded)
- **Email:** `admin@campusfind.com`
- **Password:** `Admin@123`
- **Role:** `ADMIN`
- **Student ID:** `ADMIN001`

### Student Account (Sample)
To create a student account, send a `POST` request to `/api/auth/register`:
- **Student ID:** `STU2024001`
- **Name:** `John Doe`
- **Email:** `john.doe@campus.edu`
- **Password:** `Student@123`
- **Department:** `Computer Science`
- **Phone:** `9876543210`

---

## 📬 Postman Collection Setup

A pre-configured Postman collection is included in the project:
`postman/CampusFind.postman_collection.json`

### How to use:
1. Open Postman.
2. Click **Import** in the top left corner.
3. Select `postman/CampusFind.postman_collection.json`.
4. The collection is organized by resource folders:
   - `Auth` (Register, Login, Me, Update Password)
   - `Items` (Report Lost, Report Found, Search, Match, Upload Image)
   - `Claims` (Submit Claim, My Claims, Review Claim)
   - `Admin` (Dashboard, User Management, Item Moderation)
5. **Automatic Token Handling:** Logging in automatically stores the bearer JWT in the collection variable `token`, so subsequent requests are authenticated automatically.

---

## 🔍 Smart Match Algorithm

When a student reports a lost or found item, they can retrieve potential matches via:
`GET /api/items/{id}/matches`

The matching algorithm evaluates candidate opposite-type items (`LOST` vs `FOUND`):
1. **Category Match:** Items must belong to the exact same category (e.g., `ELECTRONICS`, `DOCUMENTS`, `KEYS`).
2. **Title & Description Token Overlap:** Compares word stems and keywords.
3. **Location Proximity:** Boosts match score if reported in the same campus sector or hall.
4. **Date Consistency:** Checks whether the found date is on or after the lost date within a 14-day threshold.
5. **Confidence Rating:** Results are ranked from highest to lowest confidence score.

---

## ❓ Troubleshooting

- **`ModuleNotFoundError: No module named 'fastapi'`**: Ensure you installed dependencies using `python3 -m pip install -r requirements.txt` or have activated the virtual environment where requirements were installed.
- **MySQL Connection Refused**: Verify that your MySQL server is running and the credentials in `.env` match your local MySQL configuration.
- **Table creation failed on startup**: Ensure the database specified in `DATABASE_URL` exists (`CREATE DATABASE campus_lost_found;`).
- **Image upload errors**: Ensure the user running the process has write permissions to the configured `UPLOAD_DIR` (`uploads/items`).

---

## 📄 License
This project is developed for educational and campus use. Open source under the MIT License.
