# Collaborative Project Management / Issue Tracker

A full-stack, real-time issue tracking and project management application — a Linear/Jira-style tool where teams organize work into workspaces, projects, and issues, collaborate on a live Kanban board, and stay in sync through real-time updates.

Built to demonstrate production-grade full-stack engineering: a clean layered backend, relational data modeling, authentication and role-based access control, real-time collaboration over WebSockets, and containerized deployment.

---

## Tech Stack

**Frontend**
- React (Vite) + TypeScript
- Tailwind CSS
- React Query (server state)
- React Router

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM
- Zod (request validation)
- Socket.io (real-time)
- JWT authentication (access + refresh tokens)

**Database**
- PostgreSQL

**Infrastructure**
- Docker
- GitHub Actions (CI/CD)
- Vercel (frontend) · Render/Railway (backend + database)

---

## Architecture

The project is a monorepo with a clear separation between client and server.

```
issue-tracker/
├── client/                 # React + Vite + TypeScript frontend
│   └── src/
│       ├── api/            # API client (axios)
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level views
│       └── hooks/          # Custom React hooks
│
└── server/                 # Node + Express + TypeScript backend
    ├── prisma/             # Prisma schema and migrations
    └── src/
        ├── lib/            # Shared Prisma client
        ├── routes/         # URL route definitions
        ├── controllers/    # Request handling + validation
        ├── services/       # Business logic + database access
        └── middleware/     # Error handling, authentication
```

The backend follows a layered pattern so responsibilities stay isolated and testable:

```
Request → Route → Controller → Service → Prisma → PostgreSQL
                  (validates)   (logic)   (query)
```

- **Routes** map URLs to handlers.
- **Controllers** parse and validate requests (Zod), then shape responses.
- **Services** hold business logic and all database access.
- **Middleware** centralizes error handling and authentication.

---

## Database Schema

The data model captures the natural hierarchy of a team workflow: users belong to workspaces (with a role), workspaces contain projects, projects contain issues, and issues carry labels and comments.

```mermaid
erDiagram
  USER ||--o{ MEMBERSHIP : has
  WORKSPACE ||--o{ MEMBERSHIP : has
  WORKSPACE ||--o{ PROJECT : contains
  PROJECT ||--o{ ISSUE : contains
  USER ||--o{ ISSUE : "assigned to"
  ISSUE ||--o{ LABEL : has
  ISSUE ||--o{ COMMENT : has
  USER ||--o{ COMMENT : writes
  USER {
    string id PK
    string email UK
    string password
    string name
    datetime createdAt
  }
  WORKSPACE {
    string id PK
    string name
    datetime createdAt
  }
  MEMBERSHIP {
    string id PK
    enum role
    string userId FK
    string workspaceId FK
  }
  PROJECT {
    string id PK
    string name
    string key
    string workspaceId FK
    datetime createdAt
  }
  ISSUE {
    string id PK
    string title
    string description
    enum status
    enum priority
    string projectId FK
    string assigneeId FK
    datetime createdAt
    datetime updatedAt
  }
  LABEL {
    string id PK
    string name
    string color
    string issueId FK
  }
  COMMENT {
    string id PK
    string body
    string issueId FK
    string authorId FK
    datetime createdAt
  }
```

`Membership` is a join table linking users and workspaces many-to-many, and it carries the user's `role` (OWNER / ADMIN / MEMBER), which forms the basis for role-based access control.

---

## API Overview

The API follows REST conventions: nested routes where ownership matters (creating a project *within* a workspace) and flat routes for operating on a single resource by its own id.

### Workspaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/workspaces` | Create a workspace |
| GET    | `/api/workspaces` | List workspaces |
| GET    | `/api/workspaces/:id` | Get one workspace |
| PUT    | `/api/workspaces/:id` | Update a workspace |
| DELETE | `/api/workspaces/:id` | Delete a workspace |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/workspaces/:workspaceId/projects` | Create a project in a workspace |
| GET    | `/api/workspaces/:workspaceId/projects` | List projects in a workspace |
| GET    | `/api/projects/:id` | Get one project |
| PUT    | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

### Issues, Labels, Comments
Issue, label, and comment endpoints (with filtering, pagination, and partial updates) follow the same patterns. See the roadmap below for current status.

All endpoints validate input with Zod and return consistent error responses through centralized error-handling middleware.

---

## Features

- Workspaces, projects, and issues with a clean relational model
- Input validation on every endpoint (Zod)
- Centralized error handling with meaningful HTTP status codes
- JWT authentication with access and refresh tokens *(planned)*
- Role-based access control per workspace *(planned)*
- Kanban board with drag-and-drop *(planned)*
- Real-time collaboration via WebSockets *(planned)*
- Pagination and filtering on list endpoints *(planned)*
- Comments and labels on issues *(planned)*

---

## Roadmap

- [x] Monorepo setup (client + server)
- [x] Database schema and migrations (Prisma + PostgreSQL)
- [x] Workspace CRUD API
- [x] Project CRUD API
- [ ] Issues, labels, and comments API (filtering + pagination)
- [ ] Frontend scaffolding and API integration
- [ ] Authentication (JWT + refresh tokens)
- [ ] Role-based access control
- [ ] Kanban board with drag-and-drop
- [ ] Real-time updates (Socket.io)
- [ ] Dockerization
- [ ] CI/CD (GitHub Actions)
- [ ] Production deployment

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (running locally or hosted)

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd issue-tracker

# --- Backend ---
cd server
npm install

# Create a .env file with your database connection:
# DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/issue_tracker"

# Run migrations
npx prisma migrate dev

# Start the backend
npm run dev          # http://localhost:4000

# --- Frontend ---
cd ../client
npm install
npm run dev          # http://localhost:5173
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens *(planned)* |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens *(planned)* |

---

## License

MIT