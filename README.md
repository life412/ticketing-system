# 🎟️ Enterprise Helpdesk Management System

A production-ready, role-driven enterprise ticketing system built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**. Features custom **Edge JWT authentication** (`jose`), strict **Server Action business logic**, role-enforcing middleware, and intuitive SaaS workspaces (Linear / Jira design system).

---

## 🚀 Key Features & Highlights

- **Role-Based Access Control (RBAC)**:
  - **Managers**: Full organizational visibility, ticket re-assignment, capacity tracking, and status overrides.
  - **Technicians**: Assigned resolution workspace, status milestone workflow (`ASSIGNED` → `IN_PROGRESS` → `RESOLVED`), and technical notes.
  - **Employees**: Ticket submission portal, progress tracking, and resolution confirmation (`RESOLVED` → `CLOSED`).
- **Next.js 14 Server Actions**: 100% Server Action architecture with `revalidatePath` instant cache updates. Zero legacy API routes.
- **Prisma & PostgreSQL**: Robust data models (`User`, `Ticket`, `Activity`) with autoincrement visual ticket IDs (`TKT-001`).
- **Audit & Timeline Logging**: System event logs tracking creation, status transitions, assignments, and user discussion comments.
- **Edge Middleware**: Role-enforcing route protection and session injection.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Styling** | Tailwind CSS + Dark Glassmorphic Design System |
| **Database & ORM** | PostgreSQL 13 + Prisma ORM v5.22.0 |
| **Authentication** | `jose` (Edge-compatible JWT) + HTTP-Only Cookies + `bcryptjs` |
| **Forms & Validation** | `react-hook-form` + `@hookform/resolvers/zod` |

---

## 🔑 Pre-Seeded Test Credentials

All accounts are pre-seeded with the password: **`password123`**

| Role | Email | Name | Capabilities |
| :--- | :--- | :--- | :--- |
| **MANAGER** | `manager1@company.com` | Sarah Jenkins | Assign tickets, view all queues, team capacity |
| **MANAGER** | `manager2@company.com` | David Ross | Override statuses, assign techs, system audit |
| **TECH** | `tech1@company.com` | Alex Vance | Network specialist, active work queue |
| **TECH** | `tech2@company.com` | Elena Rostova | Hardware specialist, active work queue |
| **TECH** | `tech3@company.com` | Marcus Chen | SysAdmin & Security, active work queue |
| **EMPLOYEE** | `emp1@company.com` | Emily Watson | Create tickets, confirm resolution |
| **EMPLOYEE** | `emp2@company.com` | Jordan Lee | Create tickets, track progress |
| **EMPLOYEE** | `emp3@company.com` | Carlos Mendez | Create tickets, track progress |

---

## 💻 Quickstart Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/life412/ticketing-system.git
cd ticketing-system
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` matches your local PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/ticketing_db?schema=public"
JWT_SECRET="super-secret-jwt-key-change-in-production"
```

### 3. Database Setup (Docker or Local PostgreSQL)

#### Option A: Docker (Recommended)
Run PostgreSQL in a Docker container:
```bash
docker run --name ticketing-postgres -e POSTGRES_PASSWORD=root -e POSTGRES_DB=ticketing_db -p 5432:5432 -d postgres:13
```

#### Option B: Local PostgreSQL
Create database using `psql`:
```sql
CREATE DATABASE ticketing_db;
```

### 4. Sync Prisma Schema & Generate Client
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Database with 8 Users & 15 Sample Tickets
```bash
npx prisma db seed
```

### 6. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧠 Architectural & Interview Deep-Dive

### 1. Database & Schema Design
- **Visual vs DB Primary Key**: Secure CUID/UUID strings are used for primary keys and foreign key relations, while an autoincrement integer (`ticketNumber`) generates human-friendly ticket IDs (`TKT-001`, `TKT-002`).
- **Audit & Timeline Model**: The `Activity` entity records status transitions, technician assignments, and user discussion comments in a single unified timeline log.

### 2. Role-Based Access Control (RBAC) & Edge Middleware
- **Multi-Layer Security**: Auth checks are enforced twice—at the Edge Runtime in `middleware.ts` (protecting route paths and injecting user headers) and inside Server Actions (validating entity ownership and state machine permission rules).
- **Session Tokens**: Handled via stateless `jose` JWTs stored in HTTP-Only, SameSite cookies (`auth_token`).

### 3. End-to-End Type Safety & Validation Strategy
- **Shared Zod Schemas**: Zod validation schemas in `src/lib/validations/` are shared between client-side React Hook Form instances and server-side Server Action logic.
- **Server Action Contract**: Every action returns a unified result contract `{ success: boolean, data?: T, error?: string }`.

### 4. Server Actions vs. Legacy API Routes
- **Zero API Routes**: All operations (`createTicket`, `assignTicket`, `updateTicketStatus`, `addComment`) are implemented as Server Actions using `"use server"`.
- **Instant Cache Updates**: Operations execute `revalidatePath` to trigger instant, zero-latency server re-renders.

### 5. Robust Error Handling
- Defensive try-catch wrapping in Server Actions catches database constraints and returns user-friendly error messages without swallowing errors or leaking stack traces to the client.

---

## 📊 Database ERD Architecture

```mermaid
erDiagram
    USER ||--o{ TICKET : "createdTickets"
    USER ||--o{ TICKET : "assignedTickets"
    USER ||--o{ ACTIVITY : "activities"
    TICKET ||--o{ ACTIVITY : "activities"

    USER {
        string id PK "cuid()"
        string email UK
        string passwordHash
        string name
        Role role "MANAGER | TECH | EMPLOYEE"
        datetime createdAt
    }

    TICKET {
        string id PK "uuid()"
        int ticketNumber "autoincrement (TKT-001)"
        string title
        string description
        TicketStatus status "OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED"
        TicketPriority priority "LOW | MEDIUM | HIGH | CRITICAL"
        TicketCategory category "IT_SUPPORT | FACILITIES | HR | OTHER"
        string creatorId FK
        string assigneeId FK
        datetime createdAt
        datetime updatedAt
    }

    ACTIVITY {
        string id PK "cuid()"
        string ticketId FK
        string userId FK
        string text
        ActionType actionType "COMMENT | STATUS_CHANGE | ASSIGNMENT"
        TicketStatus previousStatus
        TicketStatus newStatus
        datetime createdAt
    }
```
