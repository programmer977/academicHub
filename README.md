# AcademicHub

[![CI](https://github.com/programmer977/academicHub/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/programmer977/academicHub/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deployed%20on-Render-000000?logo=render&logoColor=white)

> A full-stack academic management application for organizing university subjects, coursework, assessments, grades, and deadlines in a single workspace.

**Project status:** Deployed on Render · Active development.

## Overview

University students often manage multiple subjects, assignments, exams, grading criteria, and deadlines across different learning platforms, spreadsheets, and personal notes. AcademicHub centralizes these responsibilities into a single application, helping students track their academic progress and understand their performance.

The project consists of a versioned REST API built with Node.js, TypeScript, and Fastify, a relational PostgreSQL database, and a framework-free TypeScript single-page application powered by Vite.

AcademicHub also serves as a practical software engineering project covering relational modeling, API design, authentication, authorization, automated testing, containerization, continuous integration, and cloud deployment.

## Features

| Feature | Description |
| --- | --- |
| Account management | Register, sign in, retrieve the authenticated profile, and sign out through the web client. |
| Academic dashboard | View subject counts, activity progress, overdue work, assessments awaiting grades, upcoming deadlines, and subject averages. |
| Subject management | Create, list, view, update, and delete subjects; inspect related activities and assessments. |
| Activity management | Manage coursework with deadlines, descriptions, and progress statuses; filter activities and mark them as completed. |
| Assessment management | Create, edit, and delete assessments with configurable weights, due dates, and optional grades. |
| Weighted grades | Calculate subject averages on the backend using recorded grades and their respective weights. |
| Deadline tracking | Combine incomplete activities and ungraded assessments into a chronological list, with urgency classification in the frontend. |
| Resource isolation | Restrict academic records to their authenticated owners through server-side authorization. |
| API documentation | Explore REST endpoints and bearer authentication using Swagger UI. |
| Operational endpoints | Check HTTP liveness and PostgreSQL connectivity using `/health` and `/ready`. |

**Activity statuses:** `pending`, `in_progress`, and `completed`.

**Deadline classification:** overdue (past due), urgent (within 24 hours), upcoming (more than 24 hours and up to 7 days), and future (more than 7 days).

**Weighted grade calculation**

```text
Weighted average = sum(grade × weight) / sum(weight)
```

Grades range from 0 to 10 with up to two decimal places. Weights are integers from 1 to 10. Ungraded assessments are excluded from both sums, while a grade of zero is included. Results are rounded to two decimal places; a subject with no recorded grades returns `null`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 24 |
| Language | TypeScript, native ES modules |
| Backend | Fastify 5, REST API |
| Frontend | Vanilla TypeScript, HTML5, CSS3, Vite 8 |
| Database | PostgreSQL 17 |
| Data access | `pg` (node-postgres), connection pooling, parameterized SQL |
| Database migrations | `node-pg-migrate` |
| Validation | Zod 4, `fastify-type-provider-zod` |
| Authentication | `@fastify/jwt`, Argon2id |
| API documentation | OpenAPI, Swagger UI |
| Testing | Node.js test runner, `tsx`, Fastify `app.inject()` |
| Containerization | Docker, Docker Compose |
| Continuous integration | GitHub Actions |
| Cloud deployment | Render Web Service (Docker), Render PostgreSQL |
| Version control | Git, GitHub |

## Architecture

AcademicHub uses a modular monolithic backend and a separate frontend source tree. In production, both application layers are packaged into a single Docker image: Fastify exposes the REST API and serves the compiled frontend. PostgreSQL runs as a separate service.

```mermaid
flowchart TD
    U[Student / Browser] -->|HTTPS in production| F[Fastify HTTP server]
    subgraph APP[Application container]
        F --> W[Static Vite frontend]
        F --> R[Versioned REST routes]
        R --> V[Zod validation and JWT guards]
        V --> S[Academic services]
        S --> P[Repositories]
        V --> A[Authentication routes]
    end
    P -->|Parameterized SQL| D[(PostgreSQL)]
    A -->|Parameterized SQL| D
```

**Backend responsibilities**

- Routes define HTTP contracts, validation schemas, authentication guards, and response handling.
- Services coordinate domain operations and business rules, including weighted grade calculation.
- Repositories handle SQL and ownership-scoped data access. Authentication routes currently query the database directly rather than using a separate service/repository layer.
- `src/app.ts` constructs a Fastify application with an injected database pool and JWT secret. `src/server.ts` checks database connectivity and starts the HTTP listener.
- `src/database/db.ts` configures a connection pool with a maximum of 10 connections and a 5-second connection timeout.

**Frontend responsibilities**

The web client uses hash-based routing, page renderers, reusable components, typed API services, an in-memory session module, and a shared Fetch client. It sends relative requests to `/api/v1`, allowing the production frontend and API to share a single origin. During development, Vite proxies `/api` requests to the local Fastify server.

**Repository structure**

```text
academicHub/
├── .github/workflows/ci.yml      # CI workflow
├── migrations/                   # Versioned database schema changes
├── scripts/start.sh              # Container startup and migrations
├── src/                          # Backend
│   ├── app.ts                    # Fastify application factory
│   ├── server.ts                 # HTTP server entry point
│   ├── config/                   # Environment validation
│   ├── database/                 # PostgreSQL pool
│   ├── modules/
│   │   ├── auth/
│   │   ├── subjects/
│   │   ├── activities/
│   │   └── assessments/
│   └── types/                    # JWT type declarations
├── tests/                        # Unit and integration tests
│   └── helpers/                  # Shared integration fixtures
├── web/                          # Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── core/                 # HTTP client and session
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── vite.config.ts
├── .env.example
├── .env.test.example
├── .dockerignore
├── .gitignore
├── .node-version
├── compose.yaml
├── Dockerfile
├── package.json
├── package-lock.json
└── tsconfig.json
```

The backend build is written to `dist/`, and the frontend build is written to `web/dist/`.

## Database Schema

PostgreSQL stores users, subjects, activities, and assessments. Subjects belong to users; activities and assessments belong to subjects.

```mermaid
erDiagram
    USERS ||--o{ SUBJECTS : owns
    SUBJECTS ||--o{ ACTIVITIES : contains
    SUBJECTS ||--o{ ASSESSMENTS : contains

    USERS {
        uuid id PK
        text name
        text email
        text password_hash
        text role
        timestamptz created_at
    }
    SUBJECTS {
        uuid id PK
        uuid user_id FK
        text name
        text description
        timestamptz created_at
    }
    ACTIVITIES {
        uuid id PK
        uuid subject_id FK
        text title
        text description
        text status
        timestamptz due_at
        timestamptz created_at
    }
    ASSESSMENTS {
        uuid id PK
        uuid subject_id FK
        text title
        numeric grade
        integer weight
        timestamptz due_at
        timestamptz created_at
    }
```

| Table | Main constraints |
| --- | --- |
| `users` | UUID primary key; case-insensitive unique email; role restricted to `user` or `admin`, defaulting to `user`; required password hash. |
| `subjects` | Required user foreign key; unique subject name per user; optional description. |
| `activities` | Required subject foreign key and due date; status constrained to the three supported values; optional description. |
| `assessments` | Required subject foreign key and due date; nullable `NUMERIC(4,2)` grade constrained to 0–10; integer weight constrained to 1–10, defaulting to 1 at the database level. |

Foreign keys use `ON DELETE CASCADE`: deleting a user deletes their subjects and associated academic records, and deleting a subject deletes its activities and assessments. Indexes support foreign-key lookups and deadline queries. Date-time fields use `TIMESTAMPTZ`.

The activities table stores the activity name as `title`; the REST API exposes it as `name`.

The outstanding deadline list is derived from existing activities and assessments, rather than stored in a separate table.

## Getting Started

### Prerequisites

- Node.js 24 and npm (for native development and local tests).
- Git.
- Docker Engine or Docker Desktop with the Docker Compose plugin.
- OpenSSL or another cryptographically secure random generator for the JWT secret.

Commands assume a Bash-compatible terminal. For a fully containerized local environment, see [Docker](#docker).

### Environment Variables

Create a local `.env` from the tracked example after cloning the repository:

```bash
cp -n .env.example .env
```

| Variable | Purpose | Development example |
| --- | --- | --- |
| `POSTGRES_USER` | Initial PostgreSQL user for Compose | `academichub` |
| `POSTGRES_PASSWORD` | Initial PostgreSQL password for Compose | `localDevPass123` |
| `POSTGRES_DB` | Initial PostgreSQL database for Compose | `academichub` |
| `DATABASE_URL` | PostgreSQL connection string for the backend and migrations | `postgresql://academichub:localDevPass123@127.0.0.1:5433/academichub` |
| `JWT_SECRET` | JWT signing secret, at least 32 characters | Generate a unique value |
| `PORT` | Fastify HTTP listening port | `3000` |
| `TEST_DATABASE_URL` | Separate integration-test database connection | Configured in `.env.test` |
| `NODE_ENV` | Runtime environment | `development` locally; `production` in the Docker runtime |

Generate a JWT secret and insert it into `.env`:

```bash
openssl rand -hex 32
chmod 600 .env
```

The example database password is for disposable local development only. Keep `POSTGRES_*` consistent with the local connection URL. Use URL-safe credentials or correctly percent-encode URL components where necessary. Existing PostgreSQL volumes retain their original credentials even if the environment file changes.

> Never commit `.env`, `.env.test`, real connection strings, production secrets, or database dumps containing sensitive data.

### Installation

```bash
git clone https://github.com/programmer977/academicHub.git
cd academicHub

npm ci
npm --prefix web ci

cp -n .env.example .env
```

Set `JWT_SECRET` and the database credentials as described above. The frontend and backend maintain independent npm manifests and lockfiles.

### Database Migrations

Start the local PostgreSQL service and wait for its healthcheck:

```bash
docker compose up -d --wait db
```

Apply migrations when running the backend directly on the host:

```bash
(
  set -a
  source .env
  set +a
  npm run migrate -- up
)
```

The initial migration creates the four application tables, constraints, and indexes. `node-pg-migrate` tracks applied migrations so subsequent runs apply only pending changes.

When using the application Docker image, `scripts/start.sh` runs migrations automatically before starting Fastify.

### Running Locally

For development with hot reload, leave PostgreSQL running in Docker and start the backend in a terminal at the repository root:

```bash
npm run dev
```

Start the Vite development server in a second terminal:

```bash
npm --prefix web run dev
```

| Service | Local address |
| --- | --- |
| Frontend | http://localhost:5173 |
| REST API | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/docs |
| Liveness | http://localhost:3000/health |
| Readiness | http://localhost:3000/ready |
| PostgreSQL | `127.0.0.1:5433` |

If the API container is already running, stop it with `docker compose stop api` before starting the native backend on port 3000. If the backend port changes, adjust the Vite proxy in `web/vite.config.ts` accordingly.

To compile and run the application without Vite's development server (after applying migrations):

```bash
npm run build
npm --prefix web run build
npm start
```

Fastify serves the compiled frontend at `http://localhost:3000` when `web/dist/` exists.

## API Documentation

**API base path:** `/api/v1`  
**Interactive documentation:** `/docs` (OpenAPI / Swagger UI)

The following resource paths are relative to `/api/v1`.

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Register an account | Public |
| `POST` | `/auth/login` | Obtain an access token | Public |
| `GET` | `/auth/me` | Retrieve the authenticated profile | JWT |
| `GET` | `/subjects` | List owned subjects | JWT |
| `POST` | `/subjects` | Create a subject | JWT |
| `GET` | `/subjects/:id` | Retrieve a subject | JWT |
| `PATCH` | `/subjects/:id` | Update a subject | JWT |
| `DELETE` | `/subjects/:id` | Delete a subject | JWT |
| `GET` | `/subjects/:id/average` | Retrieve the weighted subject average | JWT |
| `GET` | `/activities` | List activities | JWT |
| `POST` | `/activities` | Create an activity | JWT |
| `GET` | `/activities/:id` | Retrieve an activity | JWT |
| `PATCH` | `/activities/:id` | Update an activity | JWT |
| `DELETE` | `/activities/:id` | Delete an activity | JWT |
| `GET` | `/assessments` | List assessments | JWT |
| `POST` | `/assessments` | Create an assessment | JWT |
| `GET` | `/assessments/:id` | Retrieve an assessment | JWT |
| `PATCH` | `/assessments/:id` | Update an assessment | JWT |
| `DELETE` | `/assessments/:id` | Delete an assessment | JWT |
| `GET` | `/deadlines` | List outstanding deadlines in chronological order | JWT |

Operational endpoints are outside the versioned API:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Return HTTP 200 when the HTTP process responds. |
| `GET` | `/ready` | Execute `SELECT 1`; return HTTP 200 when the database is reachable or HTTP 503 otherwise. |

Resource IDs are UUIDs. Date-time inputs use ISO 8601 with a timezone offset or UTC `Z`.

**Example: register, authenticate, and create a subject**

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Student","email":"student@example.com","password":"ExamplePassword123!"}'

curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@example.com","password":"ExamplePassword123!"}'
```

Copy the access token returned by the login endpoint:

```bash
TOKEN='<access-token>'

curl -i -X POST http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Computer Networks","description":"Networking fundamentals"}'
```

**Example assessment request body** for `POST /api/v1/assessments`:

```json
{
  "subjectId": "<subject-uuid>",
  "title": "Midterm exam",
  "grade": 8.5,
  "weight": 3,
  "dueAt": "2027-04-10T09:00:00-03:00"
}
```

Use `null` or omit `grade` for an ungraded assessment. Replace placeholder UUIDs with real subject IDs. Refer to Swagger UI for complete request and response schemas.

## Authentication and Authorization

Authentication is based on signed JSON Web Tokens. Passwords are hashed using Argon2id before storage. Email addresses are normalized, and registration requires passwords between 12 and 128 characters.

1. The client submits credentials to `/api/v1/auth/login`.
2. The backend verifies the stored password hash and signs a JWT containing the user ID (`sub`) and role.
3. The client sends the token with protected requests using `Authorization: Bearer <access-token>`.
4. Fastify verifies the token, and academic data access is scoped to the authenticated user.

Access tokens expire after 15 minutes (900 seconds). The frontend stores its token in JavaScript memory, redirects unauthenticated users to the login page, and clears the session on logout or authenticated HTTP 401 responses.

Authorization is enforced on the backend through ownership-scoped SQL queries, not merely through frontend route restrictions. The database and JWT payload support `user` and `admin` roles, but a dedicated administration interface and a broader role-based permission model are not implemented.

Additional controls include Zod request validation, parameterized SQL, database constraints, and environment-based secret configuration. These provide a security foundation, not a guarantee of production security.

## Testing

AcademicHub uses the native Node.js test runner with `tsx`. Backend integration tests exercise Fastify through `app.inject()` and a real PostgreSQL database without requiring an HTTP listener.

| Suite | Coverage |
| --- | --- |
| Unit (`grade.test.ts`) | Weighted averages, null grades, zero grades, boundary conditions, and invalid inputs. |
| Authentication | Registration, login, duplicate email handling, and token validation. |
| Authorization | Isolation of academic records between users. |
| Subjects | CRUD, validation, and persistence. |
| Activities | Creation, validation, and ownership. |
| Assessments | Creation, validation, and deletion. |
| Grades | Weighted averages derived from persisted records. |
| Deadlines | Outstanding deadline aggregation and chronological ordering. |

Run unit tests:

```bash
npm run test:unit
```

Integration tests require a separate database named `academichub_test`. With the development PostgreSQL container running, create it once:

```bash
docker compose up -d --wait db

docker compose exec db psql -U academichub -d postgres \
  -c 'CREATE DATABASE academichub_test;'

cp -n .env.test.example .env.test
```

Use your configured PostgreSQL username if different. Skip the database creation command if it already exists, and adjust `.env.test` to match your local credentials.

Load the test environment, migrate the test database, and execute the suite:

```bash
(
  set -a
  source .env.test
  set +a
  DATABASE_URL="$TEST_DATABASE_URL" npm run migrate -- up &&
    npm run test:integration
)
```

The test helpers verify the database name before using it and clean up created test fixtures. Integration files execute sequentially to reduce interference. Never run these tests against production data.

Additional validation commands:

```bash
npm run typecheck
npm run build
npm --prefix web run build
```

The root `npm test` script is still a placeholder; use the explicit unit and integration commands. Automated browser and end-to-end tests are not yet implemented.

## Docker

The project includes a multi-stage `Dockerfile` and a `compose.yaml` defining two local services:

| Service | Purpose | Published address |
| --- | --- | --- |
| `api` | Fastify API and compiled Vite frontend | `127.0.0.1:3000` |
| `db` | PostgreSQL 17 with persistent storage | `127.0.0.1:5433` |

The build stage installs dependencies and compiles both application layers. The runtime stage installs production backend dependencies, copies compiled artifacts and migrations, and runs as the non-root `node` user.

From the repository root, with `.env` configured:

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

Open http://localhost:3000 for the application or http://localhost:3000/docs for Swagger UI.

The API depends on the PostgreSQL healthcheck and connects using the Compose service hostname `db:5432`. The published port `5433` is used only by clients running on the host, including native development and local migrations.

**Container startup:** the Dockerfile invokes `/bin/sh /app/scripts/start.sh`, which runs pending migrations and then starts `node dist/server.js` using `exec`. If migrations fail, the script exits instead of starting the application with an unprepared database.

Useful lifecycle commands:

| Command | Purpose |
| --- | --- |
| `docker compose up -d --build api` | Rebuild and recreate the application service. |
| `docker compose logs --tail=50 db` | Inspect recent PostgreSQL logs. |
| `docker compose stop` | Stop services without removing containers. |
| `docker compose down` | Remove project containers and network while preserving the named database volume. |

PostgreSQL data is stored in the named `postgres_data` volume. **Do not use `docker compose down -v` unless you deliberately intend to delete the local database volume and its contents.**

## Deployment

AcademicHub has been successfully deployed to Render using a Docker Web Service and a separate managed PostgreSQL instance. The web service serves both the frontend and REST API over HTTPS; PostgreSQL is accessed through the Render private network.

```mermaid
flowchart LR
    G[GitHub main branch] --> CI[GitHub Actions CI]
    CI -->|Successful checks| R[Render Docker Web Service]
    U[Browser] -->|HTTPS| R
    R -->|Internal database URL| P[(Render PostgreSQL 17)]
```

**Render configuration**

1. Create a managed PostgreSQL 17 database and a Docker Web Service in the same Render workspace and region.
2. Connect the Web Service to `programmer977/academicHub` on the `main` branch.
3. Use the repository root as the build context and `./Dockerfile` as the Dockerfile path. Leave Root Directory and Docker Command empty to use the image defaults.
4. Set production environment variables through the Render dashboard; copy the database's **Internal Database URL** rather than using local credentials.
5. Configure `/ready` as the health check path and select **After CI Checks Pass** for auto-deploys.
6. Deploy and verify the frontend, authentication, database-backed operations, and operational endpoints.

| Variable | Production value |
| --- | --- |
| `DATABASE_URL` | Internal Database URL generated by Render. |
| `JWT_SECRET` | Unique cryptographically generated production secret. |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render's default web service port). |

The application binds to `0.0.0.0` and uses its environment-provided port. Migrations are executed by the container startup script before Fastify begins listening, so a separate paid pre-deploy command is not required for this deployment strategy. Docker Compose is used for local infrastructure; it is not needed to provision the Render database.

Verify the deployment using the actual public service URL shown in the Render dashboard:

```bash
BASE_URL='https://<your-render-service>.onrender.com'
curl -i "$BASE_URL/health"
curl -i "$BASE_URL/ready"
```

The Swagger interface is available at `/docs` on the same domain. Both health endpoints should return HTTP 200 when the application and database are available. Readiness checks connectivity, not the completeness of the database schema.

The free-tier deployment is intended for prototyping and demonstration. Free web services can spin down when idle, and free PostgreSQL instances expire after 30 days. Do not rely on this setup for durable real-user data without an appropriate database plan and a tested backup strategy.

## CI Pipeline

The workflow at [`.github/workflows/ci.yml`](.github/workflows/ci.yml) implements continuous integration for pushes and pull requests. It uses a GitHub-hosted Ubuntu runner, Node.js 24, and an isolated PostgreSQL 17 service container.

The workflow runs the following checks in order:

| Step | Command or action |
| --- | --- |
| Checkout | `actions/checkout@v6`, without persisted credentials |
| Setup | `actions/setup-node@v6`, Node.js 24, npm cache for both lockfiles |
| Backend dependencies | `npm ci` |
| Frontend dependencies | `npm --prefix web ci` |
| Type checking | `npm run typecheck` |
| Unit tests | `npm run test:unit` |
| Database migrations | `npm run migrate -- up` |
| Integration tests | `npm run test:integration` |
| Backend build | `npm run build` |
| Frontend build | `npm --prefix web run build` |
| Docker image build | `docker build -t academichub:ci .` |

The job has read-only repository-content permissions and a 15-minute timeout. Its temporary `academichub_test` database is exposed to the runner at `127.0.0.1:5433` and uses dedicated disposable credentials. The PostgreSQL healthcheck ensures the service is available before the job steps begin.

CI validates the code, database integration, and Docker image construction. Render handles deployment separately. The workflow does not publish an image to a registry or run a production-container smoke test.

Check the live CI badge or the repository's Actions tab for the current run status.

## Architectural Decisions

| Decision | Rationale and trade-off |
| --- | --- |
| Modular monolith | Keeps deployment and development simple while maintaining domain boundaries. Independent service scaling is not currently required. |
| Fastify with Zod | Integrates typed HTTP contracts, request validation, and OpenAPI documentation with minimal framework overhead. |
| PostgreSQL and explicit SQL | Makes relational constraints, ownership, and queries visible; avoids an ORM abstraction but requires manual query and mapping maintenance. |
| Application factory with dependency injection | Allows integration tests to construct the application with isolated database connections and test secrets. |
| Backend-owned academic calculations | Keeps grade calculation consistent across clients and testable independently of UI code. |
| Framework-free TypeScript frontend | Provides direct control over browser APIs and minimizes dependencies; component and state management require more manual implementation as the UI grows. |
| Same-origin production hosting | Simplifies deployment and frontend-to-API communication without a separate CORS configuration for the bundled client. |
| Short-lived JWTs and in-memory token storage | Avoids persistent browser token storage, at the cost of requiring reauthentication after expiration or page reload. |
| Multi-stage Docker build and non-root runtime | Separates build tooling from production dependencies and reduces unnecessary runtime privileges. |
| Versioned database migrations at startup | Ensures pending schema changes run before application startup; convenient for the current single-instance deployment, but a dedicated migration phase is preferable before horizontal scaling. |
| Separate development, CI, and deployment configuration | Keeps test data isolated and secrets outside source code while reusing the same application implementation. |
| CI-gated deployment | Separates automated validation from hosting and reduces the chance of publishing code that fails configured checks. |

## Known Limitations

- **Session lifecycle:** Tokens are lost on page reload and expire after 15 minutes. Refresh tokens and server-side revocation are not implemented; logout clears the local session only.
- **Deadline aggregation:** The endpoint returns a maximum of 50 outstanding records, including overdue entries. Large overdue backlogs may hide later deadlines.
- **Testing scope:** Backend unit and integration tests exist, but automated browser tests, end-to-end coverage, and production-container smoke tests are missing.
- **Security hardening:** Dedicated rate limiting, comprehensive security headers, account recovery, and a broader authorization model are not implemented. The initial Render build also reported production dependency vulnerabilities that require a fresh audit and remediation; their current status is not asserted here.
- **Operational readiness:** The readiness endpoint verifies database connectivity but not schema integrity. Structured logs and basic health endpoints exist, while dedicated monitoring, alerting, and automated recovery procedures remain future work.
- **Hosting constraints:** Free-tier database expiration, limited resources, and web-service cold starts make the current deployment a demonstration environment rather than a high-availability production system.
- **Migration strategy:** Startup migrations are suited to the current deployment, but should be separated from replica initialization as the system scales.

## Future Improvements

- [ ] Improve authentication lifecycle with refresh tokens, revocation, and account recovery.
- [ ] Audit and remediate dependency vulnerabilities; introduce automated dependency and security scanning.
- [ ] Implement rate limiting, security headers, and additional abuse prevention on public authentication endpoints.
- [ ] Expand regression, authorization, frontend, and end-to-end tests; add coverage reporting and container smoke tests.
- [ ] Add deadline pagination, richer filtering, and more efficient server-side dashboard aggregation.
- [ ] Improve frontend accessibility, responsive behavior, and user feedback.
- [ ] Standardize API error responses and extend observability with metrics, alerts, and request tracing.
- [ ] Configure branch protection and required CI checks before merging into `main`.
- [ ] Establish automated database backups and validate recovery procedures before storing real-user data.
- [ ] Define reproducible cloud infrastructure using a Render Blueprint (`render.yaml`).
- [ ] Evaluate registry-based image distribution and a dedicated migration phase as deployment requirements grow.

---

Developed by [programmer977](https://github.com/programmer977). The root `package.json` declares the ISC license; a standalone license file has not yet been added to the repository.
