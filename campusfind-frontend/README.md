# CAMPUSFIND — Frontend Web Application

> **"Lost Something? Find It on Campus."**
> Modern, responsive Single Page Application (SPA) for the Campus Lost & Found Management System, connecting directly to the verified FastAPI backend.

---

## 📖 Overview

**CAMPUSFIND** is a modern college portal designed for students and administrators to manage misplaced and recovered belongings across campus. Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**, it features real-time search, automated smart matching, verified ownership claims, role-based dashboards, and image upload capabilities.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Core Framework** | React 18 (Functional components & hooks) |
| **Build Tool & Dev Server** | Vite 5 |
| **Language** | TypeScript 5 (Strict mode) |
| **Styling** | Tailwind CSS 3 (Custom palette, responsive grid) |
| **Routing** | React Router DOM v6 |
| **HTTP Client** | Axios (Centralized instance, Bearer tokens, 401 & 422 interceptors) |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0+ (tested on Node.js v24)
- **npm**: v9.0.0+
- **Backend API**: The FastAPI backend must be running locally on `http://127.0.0.1:8000`

### 1. Installation

```bash
cd campusfind-frontend
npm install
```

### 2. Environment Configuration

Create or verify `.env` in the `campusfind-frontend` directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> A `.env.example` template is provided for reference.

### 3. Start Development Server

```bash
npm run dev
```

The frontend application will be live at:
👉 **`http://localhost:5173`**

### 4. Build for Production

```bash
npm run build
```

To preview the built production bundle:
```bash
npm run preview
```

---

## 🔐 Authentication & Roles

Authentication is implemented using JWT tokens stored securely in `localStorage`:

- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` to all outgoing requests.
- **Response Interceptor**: Automatically detects `401 Unauthorized` responses, clears stored credentials, and redirects unauthenticated users to `/login`.
- **422 Validation Parser**: Formats backend FastAPI validation errors into human-readable messages.

### Supported Roles

1. **Student (`STUDENT`)**:
   - Access to Student Workspace (`/student/dashboard`, `/student/items`, `/profile`)
   - Report lost items (`/items/report-lost`) & found items (`/items/report-found`)
   - Submit ownership claims with verification evidence (`/claims`)
   - View automated matches for reported items (`/items/:id/matches`)

2. **Administrator (`ADMIN`)**:
   - Access to Admin Workspace (`/admin/dashboard`, `/admin/users`, `/admin/items`, `/admin/claims`)
   - View 9 system health metrics and recovery rates
   - Approve / Reject claims with required administrative remarks
   - Activate / Deactivate student accounts
   - Change item resolution status (`ACTIVE`, `CLAIMED`, `RETURNED`, `CLOSED`)

---

## 📱 Routes & Pages

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page with Hero, How It Works, Features & Footer |
| `/login` | Public | Student/Admin sign-in with quick demo credentials |
| `/register` | Public | Student account registration with Department selector |
| `/items` | Public | Lost & Found directory with debounced search & filter panel |
| `/items/:id` | Public / Auth | Full item detail, image upload, claim trigger |
| `/items/:id/matches` | Auth | Smart match recommendations with score percentage & criteria |
| `/student/dashboard` | Student | Welcome banner, quick actions, metric cards, recent reports |
| `/student/items` | Student | My reported items with tabs (Lost, Found, All), edit & delete |
| `/items/report-lost` | Student | Form to report a lost belonging |
| `/items/report-found` | Student | Form to report an item found on campus |
| `/items/:id/edit` | Owner/Admin | Edit an existing item report |
| `/claims` | Student | "My Claims" list with status badges & admin feedback |
| `/claims/:id` | Student | Detailed claim verification timeline & associated item info |
| `/profile` | Student/Admin | View and update student personal information |
| `/admin/dashboard` | Admin | 9 KPI statistic cards, recovery rate progress bar & task queues |
| `/admin/users` | Admin | Student user directory with status toggles & deletion |
| `/admin/items` | Admin | Manage all campus reports, update status & delete |
| `/admin/claims` | Admin | Claim triage queue with modal for approval/rejection remarks |
| `*` | Public | Custom 404 page |

---

## 📁 Project Architecture

```
campusfind-frontend/
├── public/                 # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── admin/          # StatCard, admin widgets
│   │   ├── claims/         # ClaimModal, ClaimCard
│   │   ├── common/         # Button, Input, Select, Textarea, Modal, Toast, Badge, Card, etc.
│   │   ├── items/          # ItemCard, ItemGrid, ItemImageUpload
│   │   └── layout/         # Navbar, Sidebar, Footer
│   ├── context/
│   │   └── AuthContext.tsx # Centralized user state & authentication methods
│   ├── hooks/
│   │   ├── useAuth.ts      # Authentication hook
│   │   └── useDebounce.ts  # Debounce hook for instant search
│   ├── layouts/
│   │   ├── AdminLayout.tsx # Admin dashboard layout with role check & sidebar
│   │   ├── AuthLayout.tsx  # Split-screen modern authentication layout
│   │   └── StudentLayout.tsx # Student layout with navigation & mobile drawer
│   ├── pages/
│   │   ├── admin/          # Admin pages (Dashboard, Users, Items, Claims)
│   │   ├── auth/           # Login & Register pages
│   │   ├── items/          # Browse, Details, Report Lost, Report Found, Edit, Matches
│   │   ├── student/        # Dashboard, My Items, Profile
│   │   ├── claims/         # My Claims, Claim Detail
│   │   ├── LandingPage.tsx # Public landing page
│   │   └── NotFoundPage.tsx # 404 page
│   ├── services/
│   │   ├── api.ts          # Central Axios client & error formatting
│   │   ├── authService.ts  # Login, register, me
│   │   ├── itemService.ts  # CRUD, search, matches, image upload
│   │   ├── claimService.ts # Submit claims, my claims, get claim
│   │   ├── userService.ts  # Profile updates, user items, user claims
│   │   └── adminService.ts # Metrics, user status, claim approval/rejection
│   ├── types/              # Strongly-typed TypeScript interfaces
│   ├── utils/              # Formatters, validators, constants
│   ├── App.tsx             # Route declarations
│   ├── main.tsx            # Vite root mount
│   └── index.css           # Tailwind base styles & font rules
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔧 Troubleshooting

1. **`Network Error` or `Failed to fetch`**:
   - Verify that the FastAPI backend is running: `http://127.0.0.1:8000/health`.
   - Ensure `VITE_API_BASE_URL` in `.env` is set to `http://127.0.0.1:8000`.

2. **Images not displaying**:
   - The backend mounts `/uploads/items` directly. The frontend formatter `getImageUrl()` prepends `VITE_API_BASE_URL` automatically.

3. **Admin access denied**:
   - Make sure you are signed in with an account having role `ADMIN` (e.g. `admin@campusfind.edu`).
