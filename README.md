# Academic Hub

**Academic Hub** is an academic management REST API designed to help university students organize their courses, assignments, deadlines, and, eventually, assessments and grades in one place.

The backend is built with **Node.js, TypeScript, Fastify, and PostgreSQL**. It uses JWT-based authentication and a modular Route → Service → Repository architecture.

> **Project status:** Work in progress. Authentication, subject management, and activity management are implemented in the codebase. The frontend, assessment endpoints, and automated test coverage are not yet available. **Not production-ready.**

## Features

### Implemented

- **Authentication:** user registration, login, and authenticated profile retrieval.
- **Password security:** password hashing and verification with Argon2id.
- **JWT access tokens:** 15-minute expiration and protection of authenticated routes.
- **Subjects:** create, list, update, and delete the signed-in user's subjects.
- **Activities:** create, list, retrieve, update, and delete activities associated with the signed-in user's subjects.
- **Activity tracking:** descriptions, due dates, and `pending`, `in_progress`, or `completed` statuses.
- **Data isolation:** subject and activity queries are scoped to the authenticated user.
- **Validation:** request validation with Zod and Fastify.
- **Database:** PostgreSQL schema and versioned migrations with `node-pg-migrate`.
- **API documentation:** Swagger UI at `/docs`.

**Implemented in source code does not mean fully tested:** automated unit and integration tests are not currently present in the repository.

### Planned

- Assessment and grade management endpoints.
- Weighted grade calculations and academic summaries.
- Student-facing frontend and dashboard.
- Automated unit and integration tests.
- Additional error handling, configuration hardening, and production safeguards.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 24 |
| Language | TypeScript |
| HTTP framework | Fastify 5 |
| Database | PostgreSQL 17 |
| Database client | `pg` (node-postgres) |
| Database migrations | `node-pg-migrate` |
| Authentication | `@fastify/jwt` |
| Password hashing | Argon2id (`argon2`) |
| Validation and schemas | Zod + `fastify-type-provider-zod` |
| API documentation | Swagger / OpenAPI |
| Local database | Docker Compose |

## Project Structure

```text
academicHub/
├── .env.example
├── compose.yaml
├── migrations/
│   └── 1793226435441_initial-schema.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── database/
│   │   └── db.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schemas.ts
│   │   │   └── password.ts
│   │   ├── subjects/
│   │   │   ├── subjects.repository.ts
│   │   │   ├── subjects.routes.ts
│   │   │   ├── subjects.schemas.ts
│   │   │   └── subjects.service.ts
│   │   └── activities/
│   │       ├── activities.repository.ts
│   │       ├── activities.route.ts
│   │       ├── activities.schema.ts
│   │       └── activities.service.ts
│   └── types/
│       └── jwt.d.ts
├── package.json
└── tsconfig.json
```

Business logic in the subjects and activities modules is separated into routes, services, and repositories. Repositories use parameterized SQL queries to access PostgreSQL.

## Getting Started

### Requirements

- Node.js 24 and npm
- Docker with Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/programmer977/academicHub.git
cd academicHub
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` to provide the following variables:

```dotenv
DATABASE_URL=postgresql://academichub:<YOUR_DB_PASSWORD>@127.0.0.1:5433/academichub
JWT_SECRET=<GENERATE_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS_LONG>
PORT=3000
```

Replace the placeholders with real local values. You can generate a JWT secret with:

```bash
openssl rand -hex 32
```

**Important configuration mismatch:** at the time of writing, the password in `.env.example` does **not** match the `POSTGRES_PASSWORD` value committed in `compose.yaml`. Set the password portion of `DATABASE_URL` to match your local database configuration, or update the Compose configuration so both agree. If you have an existing Docker volume, changing `POSTGRES_PASSWORD` alone does not update the password of an already-initialized database.

> Do not commit `.env` or reuse the sample Compose credentials in a real deployment. The current Compose configuration is intended for local development only.

### 3. Start PostgreSQL

```bash
docker compose up -d db
docker compose ps
```

The development database is exposed on `127.0.0.1:5433` on the host and listens on port `5432` inside the container.

### 4. Apply migrations

The migration CLI needs access to `DATABASE_URL`. In **Bash**, load the local environment file before running it:

```bash
set -a
source .env
set +a

npm run migrate -- up
```

Run this after the database is available. To roll back a migration, use:

```bash
npm run migrate -- down
```

### 5. Start the API

```bash
npm run dev
```

- API base URL: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`

The API checks the database connection during startup. `npm run dev` does **not** start the database container automatically.

## API Endpoints

The following endpoints are registered in the current source code. Except for registration and login, they require a valid bearer token.

### Authentication

| Method | Endpoint | Purpose | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a user | No |
| `POST` | `/api/v1/auth/login` | Log in and receive a JWT | No |
| `GET` | `/api/v1/auth/me` | Retrieve the authenticated user | Yes |

### Subjects

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/subjects` | List the user's subjects |
| `POST` | `/api/v1/subjects` | Create a subject |
| `PATCH` | `/api/v1/subjects/:id` | Update a subject |
| `DELETE` | `/api/v1/subjects/:id` | Delete a subject |

### Activities

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/activities` | List activities across the user's subjects, ordered by due date |
| `POST` | `/api/v1/activities` | Create an activity linked to an owned subject |
| `GET` | `/api/v1/activities/:id` | Retrieve an activity |
| `PATCH` | `/api/v1/activities/:id` | Update activity fields or move it to another owned subject |
| `DELETE` | `/api/v1/activities/:id` | Delete an activity |

All subject and activity endpoints require authentication. The `:id` route parameter is a UUID.

Successful resource creation uses HTTP `201`; successful deletion uses HTTP `204`. Missing or inaccessible resources generally produce HTTP `404`. These are route-level behaviors defined in code, not results from a complete integration test suite.

## Request Examples

The examples below use `curl`.

### Register a user

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'
```

Passwords must contain 12–128 characters.

### Log in

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'
```

A successful response includes an `accessToken`, `tokenType: "Bearer"`, and `expiresIn: 900` (seconds).

For the remaining requests, set `TOKEN` to the token returned by login:

```bash
TOKEN="<YOUR_ACCESS_TOKEN>"
```

### Create a subject

```bash
curl -i -X POST http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Networks",
    "description": "Networking fundamentals"
  }'
```

Save the created subject's `id` to use in activity requests.

### Create an activity

```bash
curl -i -X POST http://localhost:3000/api/v1/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": "<SUBJECT_UUID>",
    "name": "Finish network topology assignment",
    "description": "Submit the topology diagram and report",
    "status": "pending",
    "dueAt": "2027-03-15T18:00:00-03:00"
  }'
```

For activity creation:

- `subjectId` must identify a subject owned by the authenticated user.
- `name` is required (1–150 characters).
- `description` is optional, nullable, and limited to 2,000 characters.
- `status` is optional and defaults to `pending`.
- `dueAt` is required and must be an ISO 8601 date-time with a timezone offset.

### List activities

```bash
curl -i http://localhost:3000/api/v1/activities \
  -H "Authorization: Bearer $TOKEN"
```

### Update an activity

```bash
curl -i -X PATCH http://localhost:3000/api/v1/activities/<ACTIVITY_UUID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Delete an activity

```bash
curl -i -X DELETE http://localhost:3000/api/v1/activities/<ACTIVITY_UUID> \
  -H "Authorization: Bearer $TOKEN"
```

You can inspect the other endpoints and schemas through Swagger UI at `/docs`.

## Database Model

The initial migration defines four tables:

| Table | Purpose | Current HTTP API |
| --- | --- | --- |
| `users` | User accounts, roles, and password hashes | Registration, login, profile |
| `subjects` | Courses belonging to a user | CRUD routes |
| `activities` | Tasks, statuses, and due dates linked to subjects | CRUD routes |
| `assessments` | Grades, weights, and assessment deadlines | Not implemented yet |

**Relationships**

- One user can own multiple subjects.
- One subject can contain multiple activities and assessments.
- Deleting a user cascades to their subjects.
- Deleting a subject cascades to its activities and assessments.
- Subjects have a unique `(user_id, name)` constraint.
- User email uniqueness is enforced case-insensitively.

## Design and Security Notes

- Passwords are stored as Argon2id hashes, not plaintext.
- JWTs expire after 15 minutes; refresh tokens are not implemented.
- SQL statements use parameterized queries.
- Subject and activity access is scoped through the authenticated user's ID.
- Incoming request bodies and UUID parameters are validated with Zod.
- PostgreSQL migrations define and evolve the schema.

This architecture provides a useful foundation for learning backend development, but it has **not** undergone a production security assessment.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API in watch mode |
| `npm run typecheck` | Type-check without generating JavaScript files |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server |
| `npm run migrate -- up` | Apply database migrations |
| `npm run migrate -- down` | Roll back a migration |

**Testing notice:** `test:unit` and `test:integration` exist in `package.json`, but the test files they reference are not committed. The default `npm test` script is also a placeholder. Do not treat these as functioning test suites.

## Known Limitations

- **No frontend:** the repository currently contains the backend API only.
- **No assessment HTTP endpoints:** the `assessments` table exists, but assessment management and weighted grade calculations are still planned.
- **No automated regression coverage:** the endpoints have not been verified by a committed integration test suite.
- **Configuration mismatch:** `.env.example` and `compose.yaml` currently specify different PostgreSQL passwords.
- **Development-only database credentials:** the Compose file contains a hard-coded password; use secure configuration and rotate credentials before any real deployment.
- **API error consistency:** responses and failure paths still need standardized integration tests; for example, the activity deletion route currently returns `Subject not found` when the requested activity does not exist.
- **Authentication lifecycle:** refresh tokens, password recovery, rate limiting, and other production protections are not implemented.

## Roadmap

- [x] Initialize Node.js + TypeScript + Fastify backend
- [x] Set up PostgreSQL and migrations
- [x] Implement user registration and login
- [x] Add JWT-protected subject routes
- [x] Add JWT-protected activity routes
- [ ] Add automated tests for authentication, subjects, and activities
- [ ] Standardize error responses and improve configuration security
- [ ] Implement assessments and grade calculations
- [ ] Build a student-facing frontend and dashboard
- [ ] Prepare deployment and production hardening

## Author

Developed by [programmer977](https://github.com/programmer977) as an ongoing backend development and academic management project.
