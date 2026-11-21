````markdown
# Academic Hub

> A REST API for managing university subjects, coursework, assessments, grades, and academic deadlines in one place.

**Project status:** Backend under active development · Integration tests passing locally · Frontend not yet implemented · Not production-ready

Academic Hub aims to simplify university life by consolidating information that is often spread across learning platforms, spreadsheets, and personal notes.

The current repository implements the **backend API**, including authentication, user-owned academic records, weighted grade calculation, and deadline aggregation.

---

## Features

| Module | Implemented Capabilities |
| --- | --- |
| **Authentication** | User registration, email/password login, Argon2id password hashing, 15-minute JWT access tokens, and authenticated profile retrieval |
| **Subjects** | Create, list, retrieve, update, and delete subjects belonging to the authenticated user |
| **Activities** | Create, list, retrieve, update, and delete coursework with due dates and progress statuses |
| **Assessments** | Create, list, retrieve, update, and delete assessments with optional grades, weights, and due dates |
| **Grades** | Calculate a subject's weighted average, excluding ungraded assessments |
| **Deadlines** | Combine unfinished activities and ungraded assessments into a chronological list of up to 50 entries |
| **Developer Experience** | Zod schemas, Swagger UI, PostgreSQL migrations, unit tests, and integration tests |

### Academic Rules

- Each subject belongs to one user.
- Academic records are accessed through ownership-scoped database queries.
- An activity has one of three statuses: `pending`, `in_progress`, or `completed`.
- Assessment grades are optional (`null` until graded).
- Grades range from **0 to 10** and support up to two decimal places.
- Assessment weights are integers ranging from **1 to 10**.
- Weighted averages are rounded to two decimal places.
- When no assessments have grades, the average is `null`.
- Deadlines include activities that are not completed and assessments without grades.
- Deadlines are sorted chronologically, with a maximum of 50 results.
- Overdue items may also appear in the deadline list.
- Deleting a subject cascades to its associated activities and assessments.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 24 |
| Language | TypeScript |
| Web Framework | Fastify 5 |
| Database | PostgreSQL 17 |
| Database Driver | `pg` (node-postgres) |
| Database Migrations | `node-pg-migrate` |
| Validation | Zod |
| Schema Integration | `fastify-type-provider-zod` |
| Authentication | `@fastify/jwt` |
| Password Hashing | Argon2id (`argon2`) |
| API Documentation | Swagger / OpenAPI |
| Local Infrastructure | Docker Compose |
| Test Runner | Built-in Node.js test runner with `tsx` |

---

## Architecture

Academic Hub follows a modular backend architecture.

The main academic modules use the following layered design:

**Routes → Services → Repositories → PostgreSQL**

```text
HTTP Request
    |
    v
Fastify Routes
    |
    v
Zod Validation + JWT Authentication
    |
    v
Service Layer
    |
    v
Repository Layer
    |
    v
PostgreSQL Database
```

### Route Layer

Responsible for:

- Registering HTTP endpoints.
- Processing incoming requests.
- Validating request parameters and payloads.
- Applying authentication guards.
- Returning HTTP responses.

### Service Layer

Responsible for:

- Coordinating application operations.
- Organizing application logic.
- Separating HTTP handling from data access.
- Invoking the appropriate repository methods.

### Repository Layer

Responsible for:

- Executing parameterized SQL queries.
- Retrieving database records.
- Creating, updating, and deleting records.
- Enforcing ownership restrictions in database queries.
- Converting database values into appropriate response structures.

### Authentication Module

Authentication has dedicated routes, schemas, password utilities, and JWT protection.

### Testable Application Design

The Fastify application is created in `src/app.ts`.

The server startup logic is separated into `src/server.ts`.

This allows integration tests to construct the application without starting an HTTP listener.

Tests interact with the API using Fastify's `app.inject()` method.

---

## Project Structure

```text
academicHub/
│
├── .env.example
├── .env.test.example
├── .gitignore
├── .node-version
├── README.md
├── compose.yaml
├── package.json
├── package-lock.json
├── tsconfig.json
│
├── migrations/
│   └── 1793226435441_initial-schema.ts
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── database/
│   │   └── db.ts
│   │
│   ├── types/
│   │   └── jwt.d.ts
│   │
│   └── modules/
│       ├── auth/
│       ├── subjects/
│       ├── activities/
│       └── assessments/
│
├── tests/
│   ├── helpers/
│   │   └── test-context.ts
│   │
│   ├── auth.integration.test.ts
│   ├── subjects.integration.test.ts
│   ├── authorization.integration.test.ts
│   ├── activities.integration.test.ts
│   ├── assessments.integration.test.ts
│   ├── grades.integration.test.ts
│   ├── deadlines.integration.test.ts
│   ├── grade.test.ts
│   └── tsconfig.json
│
└── dist/
    └── Generated after compilation
```

The `dist/` directory contains generated build artifacts and is excluded from version control.

---

## Getting Started

### Requirements

Before running Academic Hub, install:

- Node.js **24**
- npm
- Docker
- Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/programmer977/academicHub.git

cd academicHub
```

Install dependencies:

```bash
npm ci
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The example configuration contains:

```dotenv
POSTGRES_USER=academichub
POSTGRES_PASSWORD=localDevPass123
POSTGRES_DB=academichub

DATABASE_URL=postgresql://academichub:localDevPass123@127.0.0.1:5433/academichub

JWT_SECRET=replace_this_with_a_secure_random_secret_of_32_characters_or_more

PORT=3000
```

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

Replace the placeholder `JWT_SECRET` value in `.env`.

**Important:**

- Never commit `.env`.
- Never reuse example credentials in production.
- Keep the PostgreSQL password and the password in `DATABASE_URL` consistent.
- Changing `.env` does not automatically reset credentials in an existing PostgreSQL Docker volume.

### 3. Start PostgreSQL

Start the database container:

```bash
docker compose up -d db
```

Check its status:

```bash
docker compose ps
```

The Docker configuration uses:

```text
PostgreSQL Version: 17

Host Address: 127.0.0.1
Host Port: 5433

Container Port: 5432
```

Database records are persisted in a named Docker volume.

### 4. Run Database Migrations

Load environment variables into the current Bash session:

```bash
set -a
source .env
set +a
```

Apply migrations:

```bash
npm run migrate -- up
```

The initial migration creates:

- `users`
- `subjects`
- `activities`
- `assessments`

It also defines:

- Primary keys.
- Foreign keys.
- Unique constraints.
- Data validation constraints.
- Database indexes.
- Cascading deletion relationships.

**Warning:** Rolling back migrations can remove tables and stored data.

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

API base path:

```text
http://localhost:3000/api/v1
```

### 6. Access API Documentation

Swagger UI is available at:

```text
http://localhost:3000/docs
```

It provides interactive documentation for registered endpoints and their request/response schemas.

### 7. Build the Application

Check TypeScript types:

```bash
npm run typecheck
```

Compile the backend:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

---

## REST API Reference

All API routes use the following base path:

```text
/api/v1
```

Except for registration and login, endpoints require JWT authentication.

Authenticated requests must include:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Authentication Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/v1/auth/me` | Retrieve the authenticated user |

JWT access tokens currently expire after **15 minutes**.

### Subject Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/subjects` | List the authenticated user's subjects |
| `GET` | `/api/v1/subjects/:id` | Retrieve a subject by ID |
| `POST` | `/api/v1/subjects` | Create a subject |
| `PATCH` | `/api/v1/subjects/:id` | Update a subject |
| `DELETE` | `/api/v1/subjects/:id` | Delete a subject |

### Activity Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/activities` | List activities |
| `GET` | `/api/v1/activities/:id` | Retrieve an activity |
| `POST` | `/api/v1/activities` | Create an activity |
| `PATCH` | `/api/v1/activities/:id` | Update an activity |
| `DELETE` | `/api/v1/activities/:id` | Delete an activity |

### Assessment Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/assessments` | List assessments |
| `GET` | `/api/v1/assessments/:id` | Retrieve an assessment |
| `POST` | `/api/v1/assessments` | Create an assessment |
| `PATCH` | `/api/v1/assessments/:id` | Update an assessment |
| `DELETE` | `/api/v1/assessments/:id` | Delete an assessment |

### Grade Calculation

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/subjects/:id/average` | Calculate a subject's weighted average |

### Academic Deadlines

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/deadlines` | Retrieve outstanding academic deadlines |

Resource identifiers use UUIDs.

Request dates must use ISO 8601 date-time strings with a timezone offset.

Example:

```text
2027-04-10T09:00:00-03:00
```

---

## API Usage Examples

The following examples use `curl`.

### Register a User

```bash
curl -i -X POST \
  http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'
```

Registration requires:

- A name containing 2–100 characters.
- A valid email address.
- A password containing 12–128 characters.

### User Login

```bash
curl -i -X POST \
  http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'
```

A successful login returns:

```json
{
  "accessToken": "<JWT_TOKEN>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Store the access token:

```bash
TOKEN="<JWT_TOKEN>"
```

### Create a Subject

```bash
curl -i -X POST \
  http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Networks",
    "description": "Networking fundamentals and protocols"
  }'
```

Store the generated subject UUID:

```bash
SUBJECT_ID="<SUBJECT_UUID>"
```

### Retrieve Subjects

```bash
curl -i \
  http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer $TOKEN"
```

### Create an Activity

```bash
curl -i -X POST \
  http://localhost:3000/api/v1/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"subjectId\": \"$SUBJECT_ID\",
    \"name\": \"Network Topology Assignment\",
    \"description\": \"Create a network topology diagram\",
    \"status\": \"pending\",
    \"dueAt\": \"2027-03-15T18:00:00-03:00\"
  }"
```

### Update an Activity

```bash
curl -i -X PATCH \
  http://localhost:3000/api/v1/activities/<ACTIVITY_UUID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Create an Assessment

```bash
curl -i -X POST \
  http://localhost:3000/api/v1/assessments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"subjectId\": \"$SUBJECT_ID\",
    \"title\": \"Midterm Exam\",
    \"grade\": null,
    \"weight\": 3,
    \"dueAt\": \"2027-04-10T09:00:00-03:00\"
  }"
```

Assessment grades may initially be `null`.

### Retrieve a Subject's Average

```bash
curl -i \
  "http://localhost:3000/api/v1/subjects/$SUBJECT_ID/average" \
  -H "Authorization: Bearer $TOKEN"
```

### Retrieve Academic Deadlines

```bash
curl -i \
  http://localhost:3000/api/v1/deadlines \
  -H "Authorization: Bearer $TOKEN"
```

---

## Weighted Grade Calculation

Academic Hub implements weighted academic averages.

The formula is:

```text
Weighted Average = Σ(Grade × Weight) / Σ(Weight)
```

Consider these assessments:

| Assessment | Grade | Weight |
| --- | ---: | ---: |
| Assignment 1 | 7.0 | 2 |
| Midterm Exam | 8.0 | 3 |
| Final Exam | 9.0 | 1 |

Calculation:

```text
(7 × 2 + 8 × 3 + 9 × 1) / (2 + 3 + 1)

= (14 + 24 + 9) / 6

= 47 / 6

= 7.83
```

The resulting weighted average is:

```text
7.83
```

### Calculation Rules

- Assessments without grades are excluded.
- A grade of `0` is valid and participates in calculations.
- Assessment weights must be valid positive integers between 1 and 10.
- Results are rounded to two decimal places.
- An existing subject without graded assessments returns JSON `null` with status `200`.
- Requests for nonexistent or inaccessible subjects return an error response.

---

## Database Design

Academic Hub uses a relational PostgreSQL database.

### Entity Relationships

```text
USERS
  |
  | 1:N
  |
  v
SUBJECTS
  |
  |----------------------|
  |                      |
  | 1:N                  | 1:N
  v                      v
ACTIVITIES            ASSESSMENTS
```

### Users

Stores user account information.

Main columns:

```text
id
name
email
password_hash
role
created_at
```

Email uniqueness is case-insensitive.

Passwords are stored as cryptographic hashes.

### Subjects

Stores academic subjects.

Main columns:

```text
id
user_id
name
description
created_at
```

Each subject belongs to one user.

Subject names must be unique within each user's records.

### Activities

Stores academic tasks and assignments.

Main columns:

```text
id
subject_id
title
description
status
due_at
created_at
```

Each activity belongs to a subject.

### Assessments

Stores graded academic evaluations.

Main columns:

```text
id
subject_id
title
grade
weight
due_at
created_at
```

The database enforces grade and weight constraints.

### Referential Integrity

Foreign keys maintain relationships between records.

The database uses `ON DELETE CASCADE`:

- Deleting a user removes their subjects.
- Deleting a subject removes its activities and assessments.

Parameterized SQL queries and ownership filters help prevent unauthorized access to other users' academic records.

---

## Automated Testing

Academic Hub includes unit and integration tests.

The tests use the built-in Node.js test runner with `tsx`.

### Testing Strategy

The project uses two testing approaches.

**Unit Testing**

Validates isolated application logic.

Currently used for weighted-grade calculations.

**Integration Testing**

Validates application behavior across:

```text
HTTP Request
    |
    v
Fastify
    |
    v
Authentication + Validation
    |
    v
Service
    |
    v
Repository
    |
    v
PostgreSQL
```

Integration tests use Fastify's `app.inject()` method and a real PostgreSQL database.

### Current Integration Test Results

The latest locally reported integration execution completed with:

```text
tests 31
pass 31
fail 0
cancelled 0
skipped 0
```

**Result: 31 passing test-runner entries and zero failures.**

The Node.js test runner includes seven parent suite tests in this total.

Therefore, the suite contains **24 individual integration scenarios** across seven files.

These results were obtained locally.

They do not represent exhaustive API coverage or an automated CI execution.

### Integration Test Coverage

| Module | Verified Behavior |
| --- | --- |
| Authentication | Registration, login, duplicate emails, incorrect passwords, missing tokens, invalid tokens, and expired tokens |
| Subjects | Creation, validation, listing, retrieval, updates, deletion, and persistence |
| Authorization | Restrictions against reading or modifying another user's subjects |
| Activities | Valid creation, ownership restrictions, and status validation |
| Assessments | Grade validation, weight validation, successful creation, and deletion |
| Grades | Weighted average calculation using persisted data |
| Deadlines | Chronological ordering of outstanding academic responsibilities |

### Test Directory

```text
tests/
│
├── helpers/
│   └── test-context.ts
│
├── auth.integration.test.ts
├── subjects.integration.test.ts
├── authorization.integration.test.ts
├── activities.integration.test.ts
├── assessments.integration.test.ts
├── grades.integration.test.ts
├── deadlines.integration.test.ts
│
├── grade.test.ts
│
└── tsconfig.json
```

### Test Isolation

Integration tests use a dedicated PostgreSQL database:

```text
academichub_test
```

The test helpers validate the target database name before executing operations.

Tests create isolated fixtures and clean up registered test users after each suite.

This prevents tests from intentionally operating on the main development database.

---

## Setting Up the Test Database

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Create the Test Database

Run:

```bash
docker compose exec db psql \
  -U academichub \
  -d postgres \
  -c 'CREATE DATABASE academichub_test;'
```

Execute this command only if `academichub_test` does not already exist.

### 3. Configure the Test Environment

Create a local test configuration:

```bash
cp .env.test.example .env.test
```

The example configuration contains:

```dotenv
TEST_DATABASE_URL=postgresql://academichub:localDevPass123@127.0.0.1:5433/academichub_test
```

Load the test variables:

```bash
set -a
source .env.test
set +a
```

The `.env.test` file is excluded from version control.

**Note:** The integration test command does not automatically load `.env.test`. Export or source the variables before running the tests.

### 4. Apply Test Database Migrations

```bash
DATABASE_URL="$TEST_DATABASE_URL" npm run migrate -- up
```

This applies the database schema to `academichub_test`.

The development database remains separate.

### 5. Run Unit Tests

```bash
npm run test:unit
```

### 6. Run Integration Tests

```bash
npm run test:integration
```

The underlying script is:

```bash
node --import tsx --test --test-concurrency=1 tests/*.integration.test.ts
```

This executes the integration test files sequentially.

### 7. Check TypeScript Types

Check application types:

```bash
npm run typecheck
```

Check test-related types:

```bash
npx tsc -p tests/tsconfig.json --noEmit
```

**Important:** The main application type check and the test-specific type check use different TypeScript configurations.

If the test-specific configuration reports errors involving `request.user.sub`, verify that it includes the JWT type augmentation declared in:

```text
src/types/jwt.d.ts
```

For example, the test configuration can include both test and application source files:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "rootDir": "..",
    "noEmit": true
  },
  "include": [
    "./**/*.ts",
    "../src/**/*.ts"
  ]
}
```

Passing runtime tests does not automatically guarantee that every TypeScript configuration compiles successfully.

### 8. Build Verification

```bash
npm run build
```

### Recommended Final Verification

```bash
npm run typecheck

npx tsc -p tests/tsconfig.json --noEmit

npm run test:unit

npm run test:integration

npm run build
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with file watching |
| `npm run typecheck` | Check application TypeScript types |
| `npm run build` | Compile the backend into `dist/` |
| `npm start` | Run the compiled application |
| `npm run migrate -- up` | Apply database migrations |
| `npm run migrate -- down` | Roll back a migration |
| `npm run test:unit` | Run weighted-grade unit tests |
| `npm run test:integration` | Execute integration tests sequentially |
| `npm test` | Placeholder script; use the explicit test commands |

---

## Security

Academic Hub implements foundational security measures.

### Implemented Measures

#### Password Hashing

Passwords are hashed using **Argon2id** before database storage.

#### JWT Authentication

Protected endpoints require valid JWT access tokens.

Tokens currently expire after 15 minutes.

#### User Data Isolation

Academic records are associated with individual users.

Database queries restrict access based on authenticated user ownership.

#### Parameterized SQL

Repositories use parameterized SQL queries to reduce SQL injection risks.

#### Input Validation

Zod schemas validate incoming data and route parameters.

#### Database Constraints

PostgreSQL constraints enforce relational integrity and selected business rules.

#### Environment Variables

Database configuration and JWT secrets are stored outside the source code.

### Security Limitations

The current implementation is not production-ready.

Additional security work is required, including:

- Authentication rate limiting.
- Password recovery.
- Security auditing.
- Production secret management.
- Deployment configuration hardening.
- Expanded authorization testing.
- Review of error responses and information disclosure.
- Additional testing of malformed and concurrent requests.

---

## Known Limitations

### 1. Backend-Only Application

Academic Hub currently provides a REST API.

A student-facing frontend has not yet been implemented.

### 2. Incomplete Test Coverage

The existing integration suite validates representative workflows.

However, additional tests are needed for:

- Activity retrieval, updates, and deletion.
- Assessment retrieval and updates.
- Additional ownership and authorization scenarios.
- Invalid request combinations.
- Concurrent database operations.
- Edge cases involving related records.
- More comprehensive error handling.

### 3. API Error Consistency

Some error responses are not fully standardized.

For example, a missing assessment retrieved through:

```http
GET /api/v1/assessments/:id
```

currently returns `400`, although `404` would be more conventional.

### 4. CI/CD

Automated GitHub Actions workflows have not yet been implemented.

The reported integration test results come from a local execution.

### 5. Production Readiness

The project requires additional security hardening, testing, deployment configuration, and operational monitoring before production use.

---

## Development Roadmap

### Phase 1 — Backend Foundation

- [x] Initialize Node.js and TypeScript.
- [x] Configure Fastify.
- [x] Configure PostgreSQL.
- [x] Set up Docker Compose.
- [x] Implement database migrations.
- [x] Configure environment validation.
- [x] Integrate Swagger documentation.

### Phase 2 — Authentication and Authorization

- [x] Implement user registration.
- [x] Implement email/password login.
- [x] Implement Argon2id password hashing.
- [x] Implement JWT authentication.
- [x] Implement protected routes.
- [x] Implement authenticated profile retrieval.
- [x] Apply user ownership restrictions to academic resources.
- [x] Add initial authorization integration tests.

### Phase 3 — Academic Management

- [x] Implement subject CRUD operations.
- [x] Implement activity CRUD operations.
- [x] Implement activity statuses.
- [x] Implement activity deadlines.
- [x] Associate activities with academic subjects.
- [x] Restrict academic records to their owners.

### Phase 4 — Assessments and Grades

- [x] Create assessment database structure.
- [x] Implement assessment CRUD endpoints.
- [x] Validate grades and weights.
- [x] Implement weighted grade calculations.
- [x] Implement subject average endpoint.
- [x] Correct assessment response serialization.
- [x] Correct assessment deletion reporting.
- [x] Add initial assessment integration tests.
- [ ] Expand assessment CRUD regression coverage.

### Phase 5 — Academic Deadlines

- [x] Implement deadline aggregation.
- [x] Combine incomplete activities and ungraded assessments.
- [x] Correct SQL deadline ordering.
- [x] Normalize deadline date serialization.
- [x] Validate chronological ordering through integration tests.

### Phase 6 — Testing and Reliability

- [x] Implement weighted-grade unit tests.
- [x] Configure a dedicated PostgreSQL test database.
- [x] Create reusable integration test helpers.
- [x] Implement authentication integration tests.
- [x] Implement subject integration tests.
- [x] Implement authorization integration tests.
- [x] Implement activity integration tests.
- [x] Implement assessment integration tests.
- [x] Implement grade integration tests.
- [x] Implement deadline integration tests.
- [x] Achieve 31 passing integration test-runner entries locally.
- [ ] Confirm the dedicated test TypeScript configuration passes.
- [ ] Expand endpoint and edge-case coverage.
- [ ] Standardize API error responses.
- [ ] Add automated CI checks.

### Phase 7 — Frontend Development

- [ ] Initialize the frontend application.
- [ ] Implement registration and login interfaces.
- [ ] Create a student dashboard.
- [ ] Implement subject management interfaces.
- [ ] Implement activity management interfaces.
- [ ] Implement assessment management interfaces.
- [ ] Display weighted grades and averages.
- [ ] Create an academic deadline overview.

### Phase 8 — Deployment

- [ ] Prepare production environment configuration.
- [ ] Configure secure database deployment.
- [ ] Implement CI/CD workflows.
- [ ] Perform additional security testing.
- [ ] Add operational monitoring.
- [ ] Deploy the full-stack application.

---

## Project Objectives

Academic Hub is being developed as both an academic management solution and a practical software engineering project.

Its development focuses on:

- Backend development with TypeScript and Node.js.
- REST API design.
- Modular software architecture.
- Relational database modeling.
- SQL query development.
- Authentication and authorization.
- Runtime data validation.
- Automated unit testing.
- Integration testing with PostgreSQL.
- Software maintainability.
- Secure development practices.
- Future full-stack development.

The long-term goal is to build a full-stack academic management platform that allows university students to organize subjects, activities, grades, and deadlines through a unified interface.

---

## Author

Developed by **[programmer977](https://github.com/programmer977)**.

**Repository:** [programmer977/academicHub](https://github.com/programmer977/academicHub)

**License declaration:** ISC, as specified in `package.json`.

---

**Academic Hub — A modular academic management REST API under active development.**
````