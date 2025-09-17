# SaaS-prototype

# 🚀 Multi-Tenant SaaS Application

A complete multi-tenant SaaS application with granular role-based access control (RBAC), built with modern technologies.

## 🏗️ Architecture

**Frontend:** React + TypeScript + Tailwind CSS + Vite  
**Backend:** ElysiaJS + Bun + TypeScript  
**Database:** PostgreSQL + Prisma ORM  
**Authentication:** OTP-based passwordless login with HTTP-only cookies  
**Authorization:** Role-based access control with teams, groups, and permissions

## ✨ Features

### 🔐 Authentication & Authorization

- Passwordless login via OTP (One-Time Password)
- Session-based authentication with secure HTTP-only cookies
- Admin user verification system
- Multi-tenant architecture with data isolation
- Granular permission system (CRUD per module)

### 👥 User & Access Management

- **Users**: Registration, verification, and management
- **Teams**: Organize users within tenants
- **Roles**: Define permissions for vault, financials, and reporting modules
- **Groups**: Bind roles to teams and assign users

### 📦 Core Modules

- **🔒 Vault**: Secure secret management with reveal/hide functionality
- **💰 Financials**: Transaction tracking with amounts and descriptions
- **📊 Reporting**: Document creation and content management

### 🎨 User Interface

- Responsive design with Tailwind CSS
- Permission-aware navigation (show/hide based on access)
- Modal-based CRUD operations
- Real-time permission checking
- Loading states and error handling

## 🗂️ Project Structure

```
saas-app/
├── backend/                 # ElysiaJS Backend
│   ├── src/
│   │   ├── routes/          # API routes (auth, modules, management)
│   │   ├── utils/           # Utilities (auth, OTP, session, email)
│   │   ├── db/              # Database configuration
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── package.json
│   ├── railway.json         # Railway deployment config
│   └── .env.example         # Environment variables template
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── hooks/           # Custom hooks (permissions)
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # API client and utilities
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # React entry point
│   ├── package.json
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── index.html           # HTML template
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (for backend)
- [Node.js](https://nodejs.org/) 18+ (for frontend)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/saas-app.git
cd saas-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials and email settings

# Setup database
bunx prisma generate
bunx prisma migrate dev --name "initial"

# Start backend server
bun run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Initial Setup

1. Create a tenant in your database
2. Create an admin user (set `verified: true`)
3. Login and start creating teams, roles, and groups!

## ⚙️ Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/saas_db"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
SESSION_SECRET="your-super-secret-session-key"
NODE_ENV="development"
```

### Frontend (.env.local)

```env
VITE_API_URL="http://localhost:3000"
```

## 🗃️ Database Schema

The application uses a comprehensive database schema supporting:

- **Multi-tenancy**: All data isolated by tenant
- **User Management**: Users belong to tenants and teams
- **RBAC System**: Roles define permissions, groups bind roles to teams
- **Module Data**: Secrets, transactions, and reports tied to teams
- **Session Management**: Secure session storage
- **OTP System**: One-time passwords for authentication

Key relationships:

- Users → Teams (many-to-one)
- Users → Groups (many-to-many via UserGroup)
- Groups → Roles (many-to-many via GroupRole)
- Groups → Teams (many-to-one)

## 🔒 Permission System

### Permission Structure

```typescript
type Permission = "create" | "read" | "update" | "delete";
type Module = "vault" | "financials" | "reporting";

interface Role {
  permissions: Record<Module, Permission[]>;
}
```

### Access Control Flow

1. User belongs to a Team
2. User is assigned to Groups within that Team
3. Groups have Roles assigned
4. Roles define permissions per module
5. User inherits all permissions from their groups

### Frontend Permission Gates

Components automatically show/hide based on user permissions:

```tsx
<PermissionGate module="vault" permission="create">
  <CreateSecretButton />
</PermissionGate>
```
