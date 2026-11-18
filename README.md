# Academic Hub

> A REST API for organizing university subjects, activities, assessments, grades, and academic deadlines.

**Status:** Active development · Backend only · Not production-ready

Academic Hub is a university-focused academic management project built with **Node.js, TypeScript, Fastify, and PostgreSQL**.

Its goal is to centralize coursework, deadlines, and academic results in a single application, helping university students manage their academic responsibilities more efficiently.

Instead of navigating multiple platforms to track assignments, examinations, grades, and deadlines, students will be able to organize their academic information through a unified system.

The current repository contains the backend REST API and database infrastructure. A student-facing frontend is planned for future development.

---

## Features and Development Status

The project is actively being developed, with several core modules already implemented and additional functionality under construction.

### Current Features

| Module | Functionality | Status |
|---|---|---|
| Authentication | Registration, login, JWT authentication, and user profiles | Implemented |
| Subjects | Create, list, update, and delete academic subjects | Implemented |
| Activities | Manage assignments, due dates, and completion statuses | Implemented |
| Assessments | Manage examinations, grades, weights, and deadlines | Under development |
| Grade Calculation | Calculate weighted averages for individual subjects | Implemented in source |
| Deadlines | Aggregate upcoming activities and assessments | Under development |
| API Documentation | Interactive documentation using Swagger | Configured |
| Database | PostgreSQL with versioned migrations | Implemented |

> **Development notice:** Functionality implemented in the source code has not necessarily been validated through automated integration tests. Some assessment and deadline operations currently contain known issues.

### Authentication and Authorization

The authentication module provides:

- User registration.
- Login using email and password.
- Secure password hashing with Argon2id.
- JSON Web Token (JWT) authentication.
- Protected API routes.
- Retrieval of authenticated user information.
- User-specific access to academic records.

JWT access tokens currently expire after **15 minutes**.

### Subject Management

Authenticated users can:

- Register academic subjects.
- List their registered subjects.
- Update subject information.
- Delete subjects.
- Associate activities and assessments with subjects.

Each subject belongs to a specific user.

Database queries are scoped to the authenticated user to prevent unauthorized access to other users' academic records.

### Activity Management

Activities represent assignments, projects, coursework, or other academic responsibilities.

The API supports:

- Creating activities.
- Retrieving activities.
- Updating existing activities.
- Deleting activities.
- Associating activities with subjects.
- Defining submission deadlines.
- Tracking activity progress.

Each activity has one of three possible statuses:

| Status | Description |
|---|---|
| `pending` | The activity has not been started |
| `in_progress` | The activity is currently being worked on |
| `completed` | The activity has been completed |

Activities can be retrieved in chronological order according to their deadlines.

### Assessment Management

The assessment module is designed to manage graded academic evaluations.

Each assessment contains:

- Title.
- Associated subject.
- Optional grade.
- Assessment weight.
- Due date.

Grades range from **0 to 10**, supporting up to two decimal places.

Assessment weights range from **1 to 10**.

The module contains routes for creating, retrieving, updating, and deleting assessments.

**Current limitation:** Assessment endpoints have been added to the codebase, but some operations still require corrections before the complete CRUD workflow can be considered functional.

### Weighted Grade Calculation

Academic Hub includes a dedicated service for calculating weighted academic averages.

The formula is:

```text
Weighted Average = Σ(Grade × Weight) / Σ(Weight)
```

For example, consider the following assessments:

| Assessment | Grade | Weight |
|---|---:|---:|
| Assignment 1 | 8.0 | 2 |
| Midterm Exam | 7.0 | 3 |
| Final Exam | 9.0 | 5 |

The weighted average is calculated as:

```text
(8.0 × 2 + 7.0 × 3 + 9.0 × 5) / (2 + 3 + 5)

= (16 + 21 + 45) / 10

= 8.20
```

The resulting average is **8.20**.

Assessments without assigned grades are excluded from calculations.

If a subject has no graded assessments, the average calculation returns `null`.

Results are rounded to two decimal places.

### Academic Deadlines

Academic Hub also includes an aggregated deadline endpoint.

Its purpose is to combine pending academic responsibilities into a single chronological list.

The implementation considers:

- Activities that have not been completed.
- Assessments without registered grades.
- Deadline dates.
- The authenticated user's academic records.

The query is designed to return up to **50 items**, ordered by deadline.

**Current limitation:** The SQL query requires correction before this functionality can be considered operational.

---

## Tech Stack

Academic Hub uses the following technologies:

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Programming Language | TypeScript |
| HTTP Framework | Fastify 5 |
| Database | PostgreSQL 17 |
| PostgreSQL Client | pg (node-postgres) |
| Database Migrations | node-pg-migrate |
| Authentication | @fastify/jwt |
| Password Hashing | Argon2id |
| Data Validation | Zod |
| Type-safe Schemas | fastify-type-provider-zod |
| API Documentation | Swagger / OpenAPI |
| Local Database Infrastructure | Docker Compose |
| Development Runner | tsx |

### Why These Technologies?

**Node.js and TypeScript**

Provide a JavaScript runtime with static type checking, supporting maintainable backend development.

**Fastify**

Offers a lightweight HTTP framework with schema validation, plugin support, and efficient request handling.

**PostgreSQL**

Provides relational data storage with constraints, indexing, and transactional capabilities.

**Zod**

Enables runtime input validation and helps enforce the expected structure of API requests and responses.

**JWT**

Provides token-based authentication for protected endpoints.

**Docker Compose**

Simplifies local PostgreSQL setup and helps maintain a consistent development environment.

---

## Software Architecture

Academic Hub follows a modular backend architecture.

The subjects, activities, and assessments modules are organized using the following pattern:

**Route → Service → Repository → Database**

```text
                  CLIENT
                    |
                    v
              HTTP REQUEST
                    |
                    v
               FASTIFY API
                    |
                    v
            ROUTE + VALIDATION
                    |
                    v
              SERVICE LAYER
                    |
                    v
             REPOSITORY LAYER
                    |
                    v
                POSTGRESQL
```

### Route Layer

Responsible for:

- Registering HTTP endpoints.
- Receiving requests.
- Validating incoming data.
- Applying authentication guards.
- Returning HTTP responses.

### Service Layer

Responsible for coordinating application operations and separating application logic from HTTP handlers.

### Repository Layer

Responsible for:

- Executing database queries.
- Retrieving stored records.
- Inserting new data.
- Updating records.
- Deleting records.
- Applying ownership restrictions.

Database access uses parameterized SQL queries.

### Authentication Module

Authentication is organized separately, with dedicated routes, request schemas, password utilities, and JWT protection.

---

## Project Structure

```text
academicHub/
│
├── .env.example
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
└── src/
    │
    ├── app.ts
    ├── server.ts
    │
    ├── config/
    │   └── env.ts
    │
    ├── database/
    │   └── db.ts
    │
    ├── modules/
    │   │
    │   ├── auth/
    │   │   ├── auth.guard.ts
    │   │   ├── auth.routes.ts
    │   │   ├── auth.schemas.ts
    │   │   └── password.ts
    │   │
    │   ├── subjects/
    │   │   ├── subjects.repository.ts
    │   │   ├── subjects.routes.ts
    │   │   ├── subjects.schemas.ts
    │   │   └── subjects.service.ts
    │   │
    │   ├── activities/
    │   │   ├── activities.repository.ts
    │   │   ├── activities.route.ts
    │   │   ├── activities.schema.ts
    │   │   └── activities.service.ts
    │   │
    │   └── assessments/
    │       ├── assessments.repository.ts
    │       ├── assessments.routes.ts
    │       ├── assessments.schema.ts
    │       ├── assessments.service.ts
    │       └── grades.service.ts
    │
    └── types/
        └── jwt.d.ts
```

---

## Getting Started

### Prerequisites

Before running Academic Hub, make sure the following tools are installed:

- Node.js 24
- npm
- PostgreSQL 17, preferably through Docker
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/programmer977/academicHub.git
```

Navigate to the project directory:

```bash
cd academicHub
```

Install dependencies:

```bash
npm ci
```

### 2. Configure Environment Variables

Create a local environment configuration using the provided template:

```bash
cp .env.example .env
```

The template includes:

```dotenv
POSTGRES_USER=academichub

POSTGRES_PASSWORD=localDevPass123

POSTGRES_DB=academichub

DATABASE_URL=postgresql://academichub:localDevPass123@127.0.0.1:5433/academichub

JWT_SECRET=replace_this_with_a_secure_random_secret_of_32_characters_or_more

PORT=3000
```

For security, generate a new JWT secret:

```bash
openssl rand -hex 32
```

Replace the placeholder value of `JWT_SECRET` with the generated secret.

**Security notice:** Never commit the `.env` file or use example credentials in a production environment.

If the PostgreSQL password is changed, ensure the password in `DATABASE_URL` matches the database configuration.

### 3. Start PostgreSQL

Academic Hub includes a Docker Compose configuration for PostgreSQL.

Start the database container:

```bash
docker compose up -d db
```

Verify that the container is running:

```bash
docker compose ps
```

The database uses:

```text
Container Port: 5432

Host Address: 127.0.0.1

Host Port: 5433
```

### 4. Run Database Migrations

The application uses `node-pg-migrate` to manage database schema changes.

Load the environment variables into your Bash session:

```bash
set -a
source .env
set +a
```

Apply migrations:

```bash
npm run migrate -- up
```

To roll back a migration:

```bash
npm run migrate -- down
```

**Warning:** Rolling back migrations may delete database tables and stored information.

### 5. Start the Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

The versioned API base path is:

```text
http://localhost:3000/api/v1
```

### 6. Access API Documentation

Swagger UI is configured at:

```text
http://localhost:3000/docs
```

This interface allows developers to inspect registered routes, request schemas, and documented response structures.

### 7. Build the Application

To check TypeScript types:

```bash
npm run typecheck
```

Compile the application:

```bash
npm run build
```

Run the compiled server:

```bash
npm start
```

---

## REST API Reference

The API uses the following base path:

```text
/api/v1
```

All endpoints except registration and login require JWT authentication.

Authenticated requests must include:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Authenticate and receive a JWT |
| GET | `/api/v1/auth/me` | Retrieve authenticated user information |

### Subject Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/subjects` | List registered subjects |
| POST | `/api/v1/subjects` | Create a subject |
| PATCH | `/api/v1/subjects/:id` | Update a subject |
| DELETE | `/api/v1/subjects/:id` | Delete a subject |

### Activity Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/activities` | Retrieve activities |
| POST | `/api/v1/activities` | Create an activity |
| GET | `/api/v1/activities/:id` | Retrieve an activity by ID |
| PATCH | `/api/v1/activities/:id` | Update an activity |
| DELETE | `/api/v1/activities/:id` | Delete an activity |

### Assessment Endpoints

**Status: Under development**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/assessments` | List assessments |
| POST | `/api/v1/assessments` | Create an assessment |
| GET | `/api/v1/assessments/:id` | Retrieve an assessment by ID |
| PATCH | `/api/v1/assessments/:id` | Update an assessment |
| DELETE | `/api/v1/assessments/:id` | Delete an assessment |

These routes are registered in the application, but some operations require corrections before they can be considered fully functional.

### Grade Calculation Endpoint

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/subjects/:id/average` | Calculate the weighted average of a subject |

### Academic Deadline Endpoint

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/deadlines` | Retrieve aggregated academic deadlines |

The deadline endpoint is still under development and requires SQL corrections.

---

## API Usage Examples

The following examples demonstrate how to interact with the API using `curl`.

### Register a User

**Request**

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

Passwords must contain between 12 and 128 characters.

### User Login

**Request**

```bash
curl -i -X POST \
  http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'
```

**Successful response format**

```json
{
  "accessToken": "<JWT_TOKEN>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

The access token is valid for 900 seconds.

Store the token in a shell variable:

```bash
TOKEN="<YOUR_ACCESS_TOKEN>"
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
  -d '{
    "subjectId": "<SUBJECT_UUID>",
    "name": "Network Topology Assignment",
    "description": "Create a network topology diagram",
    "status": "pending",
    "dueAt": "2027-03-15T18:00:00-03:00"
  }'
```

The `subjectId` field must reference a subject owned by the authenticated user.

Dates must use ISO 8601 format with a timezone offset.

### Retrieve Activities

```bash
curl -i \
  http://localhost:3000/api/v1/activities \
  -H "Authorization: Bearer $TOKEN"
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

### Delete an Activity

```bash
curl -i -X DELETE \
  http://localhost:3000/api/v1/activities/<ACTIVITY_UUID> \
  -H "Authorization: Bearer $TOKEN"
```

### Assessment Data Structure

The following JSON illustrates the assessment creation schema:

```json
{
  "subjectId": "<SUBJECT_UUID>",
  "title": "Midterm Exam",
  "grade": null,
  "weight": 3,
  "dueAt": "2027-04-10T09:00:00-03:00"
}
```

The grade may initially be `null` when the assessment has not yet been graded.

**Note:** Assessment creation currently contains an SQL error and must be corrected before this endpoint can reliably process the request.

---

## Database Design

Academic Hub uses a relational database implemented with PostgreSQL.

The initial migration defines four main tables.

### Users

Stores information about registered users.

Main fields:

```text
id
name
email
password_hash
role
created_at
```

User passwords are stored as cryptographic hashes rather than plaintext.

### Subjects

Stores academic subjects registered by users.

Main fields:

```text
id
user_id
name
description
created_at
```

Each subject belongs to one user.

A user cannot register multiple subjects with the same name under the current database uniqueness constraint.

### Activities

Stores academic tasks and assignments.

Main fields:

```text
id
subject_id
title
description
status
due_at
created_at
```

Each activity belongs to one subject.

### Assessments

Stores graded academic evaluations.

Main fields:

```text
id
subject_id
title
grade
weight
due_at
created_at
```

Each assessment belongs to one subject.

Grades and weights are validated using database constraints.

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

The database uses foreign keys to enforce referential integrity.

Deleting a user cascades to their subjects.

Deleting a subject cascades to its associated activities and assessments.

---

## Security

Security considerations are part of the project's backend architecture.

### Implemented Security Measures

**Password Hashing**

Passwords are hashed using Argon2id before storage.

**JWT Authentication**

Protected API routes require valid JWT access tokens.

**Data Isolation**

Subject, activity, and assessment queries use authenticated user information to restrict access to owned resources.

**Parameterized SQL**

Database queries use parameterized statements to reduce SQL injection risks.

**Input Validation**

Zod validates request payloads and route parameters.

**Environment Configuration**

Sensitive configuration values are loaded from environment variables.

### Security Limitations

The application is still under development.

The following protections are not yet implemented or verified:

- Refresh-token management.
- Password recovery.
- Authentication rate limiting.
- Comprehensive integration testing.
- Production configuration hardening.
- Security auditing.
- Verified production deployment.

The current implementation should not be treated as production-ready.

---

## Known Limitations

The project contains functionality that still requires corrections and testing.

### 1. Assessment Deletion

The repository currently checks its deletion result incorrectly.

The existing logic compares a returned row object against a numeric value.

This can cause the application to report failure even after a database record has been deleted.

The repository should instead verify whether the `DELETE ... RETURNING` statement returned a row.

### 2. Assessment Response Serialization

PostgreSQL `NUMERIC` and timestamp fields require consistent conversion.

The API schemas expect numeric grade values and ISO 8601 date-time strings.

These conversions require verification through integration tests.

### 3. Automated Testing

The project declares unit and integration test scripts.

However, the referenced test files are not currently present in the repository.

The default `npm test` command is also a placeholder.

### 4. API Error Handling

Some endpoints return inconsistent error messages or HTTP status codes.

Error handling requires further standardization.

### 5. Frontend

The repository currently contains the backend application only.

A user-facing web interface has not yet been developed.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run build` | Compile the TypeScript project |
| `npm start` | Start the compiled application |
| `npm run migrate -- up` | Apply database migrations |
| `npm run migrate -- down` | Roll back a migration |
| `npm test` | Placeholder test command |
| `npm run test:unit` | Declared unit test command; test file missing |
| `npm run test:integration` | Declared integration test command; test file missing |

---

## Development Roadmap

### Phase 1 — Backend Foundation

- [x] Initialize Node.js and TypeScript.
- [x] Configure Fastify.
- [x] Configure PostgreSQL.
- [x] Implement database migrations.
- [x] Configure environment validation.
- [x] Integrate Swagger documentation.

### Phase 2 — Authentication

- [x] Implement user registration.
- [x] Implement user login.
- [x] Implement Argon2id password hashing.
- [x] Implement JWT authentication.
- [x] Implement protected routes.
- [x] Implement authenticated profile retrieval.

### Phase 3 — Academic Management

- [x] Implement subject management.
- [x] Implement activity management.
- [x] Implement activity statuses.
- [x] Implement activity deadlines.
- [x] Implement user-specific academic records.

### Phase 4 — Assessments and Grades

- [x] Create the assessment database structure.
- [x] Add assessment CRUD route handlers.
- [x] Implement weighted grade calculation logic.
- [x] Add subject average endpoint.
- [x] Correct assessment creation SQL.
- [ ] Correct assessment deletion logic.
- [ ] Verify assessment response serialization.
- [ ] Validate assessment CRUD through integration tests.

### Phase 5 — Academic Deadlines

- [x] Add an aggregated deadlines endpoint.
- [x] Implement deadline aggregation query.
- [ ] Correct deadline query issues.
- [ ] Verify deadline ordering and serialization.
- [ ] Add deadline-related tests.

### Phase 6 — Testing and Reliability

- [ ] Implement unit tests.
- [ ] Implement integration tests.
- [ ] Standardize API error responses.
- [ ] Improve request and response consistency.
- [ ] Strengthen configuration security.
- [ ] Validate database operations and edge cases.

### Phase 7 — Frontend Development

- [ ] Initialize the frontend application.
- [ ] Implement authentication pages.
- [ ] Create the student dashboard.
- [ ] Implement subject management interfaces.
- [ ] Implement activity management interfaces.
- [ ] Implement assessment management interfaces.
- [ ] Display grades and weighted averages.
- [ ] Implement an academic deadline overview.

### Phase 8 — Deployment

- [ ] Prepare production environment configuration.
- [ ] Configure secure database deployment.
- [ ] Implement deployment automation.
- [ ] Perform security testing.
- [ ] Deploy the application.

---

## Project Objectives

Academic Hub is being developed as both an academic management solution and a practical software engineering project.

Its development focuses on:

- Backend development using TypeScript and Node.js.
- REST API design.
- Modular software architecture.
- Relational database modeling.
- SQL query development.
- Authentication and authorization.
- Input validation.
- Software maintainability.
- Application testing.
- Secure development practices.

The long-term goal is to evolve the current backend into a full-stack application capable of helping university students organize their academic responsibilities through a single interface.

---

## Author

Developed by **programmer977**.

GitHub: [github.com/programmer977](https://github.com/programmer977)

Project Repository: [Academic Hub](https://github.com/programmer977/academicHub)

**Package license declaration:** ISC, as specified in `package.json`.

---

**Academic Hub — An academic management application under active development.**