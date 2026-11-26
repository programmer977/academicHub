# Academic Hub

![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/status-active%20development-orange)

> A full-stack academic management application that brings university subjects, coursework, assessments, grades, and deadlines together in a single workspace.

**Status:** Core backend and web interface implemented · Active development · Not production-ready

## Overview

University students often manage several subjects at once, each with different assignments, exams, grading criteria, and deadlines. Keeping track of this information across learning platforms, spreadsheets, and personal notes creates unnecessary friction.

Academic Hub addresses this problem by providing a centralized workspace where students can organize their academic responsibilities, monitor progress, and calculate weighted grades.

The application consists of a versioned REST API built with Node.js, TypeScript, and Fastify, a PostgreSQL database, and a framework-free TypeScript web client powered by Vite. The current user interface is written in Brazilian Portuguese (pt-BR).

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [REST API](#rest-api)
- [Academic Rules and Data Model](#academic-rules-and-data-model)
- [Automated Testing](#automated-testing)
- [Security](#security)
- [Known Limitations](#known-limitations)
- [Development Roadmap](#development-roadmap)
- [Author and License](#author-and-license)

## Features

### Authentication and Account Management

- Register an account and sign in using email and password.
- Retrieve the authenticated user's profile.
- Protect academic resources through JWT authentication and ownership-scoped database queries.
- Sign out through the web interface.
- Redirect unauthenticated users to the login page and handle expired sessions.

### Academic Dashboard

The dashboard consolidates information from the API into a student-oriented overview:

- Total registered subjects.
- Pending, completed, and overdue activities.
- Assessments awaiting grades.
- Activity completion rate.
- Up to five upcoming deadlines from the API's deadline list.
- Weighted average for each subject, with links to individual subject details.

### Subject Management

- Create, view, update, and delete subjects.
- Associate activities and assessments with a subject.
- Open a subject detail page to review its description, current average, activities, and assessments.
- Keep each user's academic records isolated from those of other users.

### Activity Management

- Create, list, edit, and delete assignments and coursework.
- Assign a subject, name, optional description, deadline, and progress status.
- Filter activities by status in the web interface.
- Mark activities as completed directly from the activity list.

Supported statuses: `pending`, `in_progress`, and `completed`.

### Assessments and Grades

- Create, list, edit, and delete assessments.
- Define the associated subject, title, due date, grade, and weight.
- Leave grades unset until assessments have been graded.
- Calculate weighted subject averages automatically through the backend.
- View academic performance from the dashboard and subject detail pages.

### Academic Deadlines

The backend combines incomplete activities and ungraded assessments into a single chronological list. It returns up to 50 entries, including overdue records.

The web client classifies each deadline according to the time remaining:

| Status | Time remaining |
| --- | --- |
| Overdue | Deadline has passed |
| Urgent | 24 hours or less |
| Upcoming | More than 24 hours and up to 7 days |
| Future | More than 7 days |

### Web Application

The frontend is a single-page application (SPA) built with native TypeScript, HTML, and CSS, without React or another UI framework. It includes hash-based navigation, reusable UI components, responsive layout rules, typed API services, form validation, and loading/error feedback.

| Browser route | Purpose |
| --- | --- |
| `#/login` | Sign in |
| `#/register` | Create an account |
| `#/dashboard` | Academic overview |
| `#/subjects` | Manage subjects |
| `#/subjects/:id` | View subject details and performance |
| `#/activities` | Manage coursework |
| `#/assessments` | Manage assessments and grades |
| `#/deadlines` | Review academic deadlines |

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Runtime | Node.js 24 |
| Language | TypeScript |
| Backend | Fastify 5, REST, native ES modules |
| Frontend | Vanilla TypeScript, HTML5, CSS3, Vite 8 |
| Database | PostgreSQL 17 |
| Data access | `pg` (node-postgres), parameterized SQL |
| Migrations | `node-pg-migrate` |
| Validation | Zod 4, `fastify-type-provider-zod` |
| Authentication | `@fastify/jwt`, Argon2id |
| API documentation | OpenAPI / Swagger UI |
| Local infrastructure | Docker Compose |
| Testing | Node.js test runner, `tsx`, Fastify `app.inject()` |
| Version control | Git and GitHub |

## Architecture

Academic Hub uses a modular backend and a separate web client. The frontend communicates with the backend through HTTP requests rather than accessing the database directly.

```mermaid
flowchart TD
    U[Student] --> W[TypeScript SPA]
    W --> C[Typed API services / Fetch client]
    C -->|HTTP / JSON| R[Fastify REST API]
    R --> V[Zod validation / JWT authentication]
    V --> S[Academic services]
    S --> P[Repositories]
    V --> A[Authentication routes]
    P --> D[(PostgreSQL)]
    A --> D
```

### Backend

The academic modules follow a layered structure:

`Routes → Services → Repositories → PostgreSQL`

- **Routes:** Define HTTP endpoints, validation schemas, authentication guards, and response handling.
- **Services:** Coordinate academic operations and business logic, including weighted grade calculation.
- **Repositories:** Execute parameterized SQL, scope queries to resource owners, and map database records into API responses.
- **Authentication:** Uses dedicated routes, schemas, JWT guards, and password utilities. Its routes currently access the database directly.
- **Application bootstrap:** `src/app.ts` constructs the Fastify application using an injected database pool and JWT secret; `src/server.ts` initializes the HTTP server. This separation supports integration tests without opening a network listener.

### Frontend

The web application separates page rendering, API communication, session management, types, and reusable components.

- **Router:** Resolves hash-based routes and controls public and authenticated navigation.
- **Pages:** Render views, handle form submissions, and coordinate user interactions.
- **Services:** Encapsulate requests to specific REST resources.
- **API client:** Adds bearer tokens, handles JSON and HTTP errors, and clears the session when an authenticated request returns `401`.
- **Session:** Keeps the access token in JavaScript memory rather than persistent browser storage.
- **Components and utilities:** Provide reusable statistic cards, subject selection, date formatting, and deadline classification.

During local development, Vite proxies `/api` requests to `http://localhost:3000`. A separate deployment configuration is required for production hosting.

## Project Structure

```text
academicHub/
├── .env.example
├── .env.test.example
├── .node-version
├── compose.yaml
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
│
├── migrations/
│   └── 1793226435441_initial-schema.ts
│
├── src/                           # Backend
│   ├── app.ts                     # Fastify application factory
│   ├── server.ts                  # HTTP server entry point
│   ├── config/
│   │   └── env.ts
│   ├── database/
│   │   └── db.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── subjects/              # Includes deadline aggregation
│   │   ├── activities/
│   │   └── assessments/           # Includes weighted grade logic
│   └── types/
│       └── jwt.d.ts
│
├── tests/
│   ├── helpers/
│   │   └── test-context.ts
│   ├── grade.test.ts
│   ├── auth.integration.test.ts
│   ├── authorization.integration.test.ts
│   ├── subjects.integration.test.ts
│   ├── activities.integration.test.ts
│   ├── assessments.integration.test.ts
│   ├── grades.integration.test.ts
│   ├── deadlines.integration.test.ts
│   └── tsconfig.json
│
└── web/                           # Frontend
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── main.ts
        ├── router.ts
        ├── style.css
        ├── components/
        ├── core/                  # API client and session management
        ├── pages/
        ├── services/
        ├── types/
        └── utils/
```

Generated backend and frontend builds are written to `dist/` and `web/dist/`, respectively.

## Getting Started

### Prerequisites

- Node.js 24, as specified in `.node-version`.
- npm and Git.
- Docker with the Docker Compose plugin.
- OpenSSL (optional, for generating a JWT secret).

The commands below assume a Bash-compatible terminal and the default local configuration.

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/programmer977/academicHub.git
cd academicHub

npm ci
npm --prefix web ci
```

The backend and frontend maintain separate `package.json` and lock files.

### 2. Configure the environment

From the repository root:

```bash
cp .env.example .env
```

The example provides the following development configuration:

```dotenv
POSTGRES_USER=academichub
POSTGRES_PASSWORD=localDevPass123
POSTGRES_DB=academichub
DATABASE_URL=postgresql://academichub:localDevPass123@127.0.0.1:5433/academichub
JWT_SECRET=replace_this_with_a_secure_random_secret_of_32_characters_or_more
PORT=3000
```

Generate a random secret:

```bash
openssl rand -hex 32
```

Replace the placeholder `JWT_SECRET` in `.env` with the generated value. The backend requires a secret of at least 32 characters.

Keep the PostgreSQL credentials consistent with `DATABASE_URL`. Never commit `.env` or use these example credentials in production. Changing credentials in `.env` does not automatically change credentials in an existing PostgreSQL volume.

### 3. Start PostgreSQL

```bash
docker compose up -d db
docker compose ps
```

Wait until the database is healthy before applying migrations.

| Setting | Value |
| --- | --- |
| Image | `postgres:17` |
| Host | `127.0.0.1` |
| Host port | `5433` |
| Container port | `5432` |
| Persistent volume | `postgres_data` |

### 4. Apply database migrations

```bash
set -a
source .env
set +a

npm run migrate -- up
```

This creates the `users`, `subjects`, `activities`, and `assessments` tables, their constraints, and indexes.

### 5. Start the backend

In a terminal at the repository root:

```bash
npm run dev
```

The backend loads `.env` automatically and checks the database connection before listening for HTTP requests.

### 6. Start the frontend

In a second terminal at the repository root:

```bash
npm --prefix web run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Register a new account, sign in, and create your first subject before adding activities and assessments.

| Service | Local address |
| --- | --- |
| Web application | http://localhost:5173 |
| REST API | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/docs |
| PostgreSQL | `127.0.0.1:5433` |

If you change the backend port, update the proxy target in `web/vite.config.ts` accordingly.

## Available Scripts

Run backend commands from the repository root.

| Command | Description |
| --- | --- |
| `npm run dev` | Start the backend in watch mode |
| `npm run typecheck` | Check backend TypeScript types |
| `npm run build` | Compile the backend to `dist/` |
| `npm start` | Run the compiled backend |
| `npm run migrate -- up` | Apply database migrations |
| `npm run test:unit` | Execute weighted-grade unit tests |
| `npm run test:integration` | Execute PostgreSQL integration tests sequentially |
| `npm --prefix web run dev` | Start the Vite development server |
| `npm --prefix web run build` | Type-check and build the frontend to `web/dist/` |
| `npm --prefix web run preview` | Preview the frontend build locally |

The root `npm test` script is still a placeholder. Use the explicit test scripts above.

To build both application layers:

```bash
npm run typecheck
npm run build
npm --prefix web run build
```

The compiled backend can be started with `npm start`. The frontend build produces static files; the current backend does not register a static frontend hosting route. Vite preview is intended for local build inspection, not as a production server. A deployment must serve the frontend and route `/api` to the backend.

## REST API

**Base URL:** `http://localhost:3000/api/v1`

**Interactive documentation:** [Swagger UI](http://localhost:3000/docs)

Except for registration and login, all endpoints listed below require a valid JWT:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Authentication

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Authenticate and obtain a JWT |
| `GET` | `/auth/me` | Retrieve the authenticated profile |

### Subjects

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/subjects` | List owned subjects |
| `POST` | `/subjects` | Create a subject |
| `GET` | `/subjects/:id` | Retrieve a subject |
| `PATCH` | `/subjects/:id` | Update a subject |
| `DELETE` | `/subjects/:id` | Delete a subject |
| `GET` | `/subjects/:id/average` | Retrieve the weighted average |

### Activities

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/activities` | List activities |
| `POST` | `/activities` | Create an activity |
| `GET` | `/activities/:id` | Retrieve an activity |
| `PATCH` | `/activities/:id` | Update an activity |
| `DELETE` | `/activities/:id` | Delete an activity |

### Assessments

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/assessments` | List assessments |
| `POST` | `/assessments` | Create an assessment |
| `GET` | `/assessments/:id` | Retrieve an assessment |
| `PATCH` | `/assessments/:id` | Update an assessment |
| `DELETE` | `/assessments/:id` | Delete an assessment |

### Deadlines

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/deadlines` | List outstanding deadlines in chronological order |

Resource identifiers are UUIDs. Date-time inputs use ISO 8601 with a timezone offset or UTC (`Z`). For example, `2027-04-10T09:00:00-03:00`.

### Example API Workflow

The examples below use `curl` and assume the backend is running locally.

**1. Register an account:**

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Student","email":"student@example.com","password":"ExamplePassword123!"}'
```

**2. Sign in:**

```bash
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@example.com","password":"ExamplePassword123!"}'
```

The response contains an access token valid for 900 seconds (15 minutes):

```json
{
  "accessToken": "<JWT_TOKEN>",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Copy the returned token into a temporary shell variable:

```bash
TOKEN='<JWT_TOKEN>'
```

**3. Create a subject:**

```bash
curl -i -X POST http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Computer Networks","description":"Networking fundamentals"}'
```

Copy the returned subject ID:

```bash
SUBJECT_ID='<SUBJECT_UUID>'
```

**4. Create an activity:**

```bash
curl -i -X POST http://localhost:3000/api/v1/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"subjectId\":\"$SUBJECT_ID\",\"name\":\"Network topology assignment\",\"status\":\"pending\",\"dueAt\":\"2027-03-15T18:00:00-03:00\"}"
```

**5. Create an assessment:**

```bash
curl -i -X POST http://localhost:3000/api/v1/assessments \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"subjectId\":\"$SUBJECT_ID\",\"title\":\"Midterm exam\",\"grade\":8.5,\"weight\":3,\"dueAt\":\"2027-04-10T09:00:00-03:00\"}"
```

**6. Retrieve the weighted average and deadlines:**

```bash
curl -i "http://localhost:3000/api/v1/subjects/$SUBJECT_ID/average" \
  -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:3000/api/v1/deadlines \
  -H "Authorization: Bearer $TOKEN"
```

An assessment with a recorded grade is excluded from the outstanding deadline list. For an ungraded assessment, use `"grade": null` or omit the grade when creating it.

## Academic Rules and Data Model

### Weighted Grades

Academic Hub calculates weighted subject averages on the backend:

```text
Weighted average = sum(grade × weight) / sum(weight)
```

| Assessment | Grade | Weight |
| --- | ---: | ---: |
| Assignment | 7.00 | 2 |
| Midterm exam | 8.00 | 3 |
| Final exam | 9.00 | 1 |
| Pending exam | Not graded | 4 |

The weighted average is `(7 × 2 + 8 × 3 + 9 × 1) / 6 = 7.83`.

- Grades range from 0 to 10, with up to two decimal places.
- Weights must be integers between 1 and 10.
- Ungraded assessments are excluded from both the numerator and denominator.
- A grade of zero is valid and included in the calculation.
- The service calculates using integer hundredths and rounds the result to two decimal places.
- An existing subject without graded assessments returns JSON `null` with HTTP `200`.
- An unavailable subject returns HTTP `404`.

### Relational Database

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

Key database rules:

- Email uniqueness is case-insensitive.
- Subject names must be unique within a user's account.
- Activities and assessments must reference an existing subject.
- Foreign keys use `ON DELETE CASCADE`: deleting a subject also deletes its activities and assessments.
- PostgreSQL constraints enforce valid activity statuses, assessment grades, and weights.
- Database timestamps use `TIMESTAMPTZ`.

The activities table stores the activity name in its `title` column, while the REST API exposes it as `name`.

## Automated Testing

The repository contains a weighted-grade unit test file and seven backend integration test files. Integration tests exercise the Fastify application with `app.inject()` and a real PostgreSQL database.

| Suite | Scope |
| --- | --- |
| Unit | Weighted averages and grade calculation rules |
| Authentication | Registration, login, duplicate email, and token validation |
| Authorization | Ownership restrictions across academic records |
| Subjects | CRUD, validation, and persistence |
| Activities | Creation, validation, and ownership |
| Assessments | Creation, validation, and deletion |
| Grades | Weighted averages calculated from persisted records |
| Deadlines | Outstanding deadlines and chronological ordering |

### Run unit tests

```bash
npm run test:unit
```

### Configure the integration test database

Integration tests must target a separate database named `academichub_test`. The helper checks the database name before executing test operations.

With the development database container running, create the test database once:

```bash
docker compose exec db psql -U academichub -d postgres \
  -c 'CREATE DATABASE academichub_test;'
```

Use your configured PostgreSQL username if it differs from the example. Skip the creation command if the database already exists.

Create and load the test environment file:

```bash
cp .env.test.example .env.test

set -a
source .env.test
set +a
```

Ensure `TEST_DATABASE_URL` points to the test database, not the development database. Apply migrations specifically to the test database:

```bash
DATABASE_URL="$TEST_DATABASE_URL" npm run migrate -- up
```

Then run the integration suite:

```bash
npm run test:integration
```

Test fixtures are cleaned up by the integration test helper. The test runner executes integration files sequentially to reduce interference between suites.

The previous project documentation reported a successful local integration run. Current pass counts are not asserted here because the suite must be rerun against the current revision to verify its status. Automated browser/end-to-end tests and a CI workflow are not yet included in the repository.

## Security

### Implemented Controls

- Argon2id password hashing; plaintext passwords are not stored.
- JWT bearer authentication with a 15-minute access-token lifetime.
- Server-side resource ownership checks, independent of frontend routing.
- Parameterized SQL queries and relational constraints.
- Zod validation of request payloads and route parameters.
- Registration passwords between 12 and 128 characters.
- Environment-based configuration with a minimum JWT secret length of 32 characters.
- In-memory frontend token storage; no persistent token storage in `localStorage` or `sessionStorage`.
- Session clearing on logout and authenticated `401` responses.

These controls provide an initial security foundation, not a guarantee of production security. Frontend route protection is a navigation mechanism; backend authorization remains the security boundary.

## Known Limitations

- **Session persistence:** Refreshing or closing the web page clears the in-memory token. Users must authenticate again after a reload or token expiration. Refresh tokens and server-side token revocation are not implemented; logout only clears the client session.
- **Deadline aggregation:** The API returns a maximum of 50 outstanding entries, including overdue records. A large overdue backlog can reduce the number of upcoming deadlines available to the dashboard.

## Development Roadmap

### Implemented foundations

- [x] Modular TypeScript backend and PostgreSQL schema.
- [x] Authentication, ownership checks, and API documentation.
- [x] Subject, activity, and assessment CRUD endpoints.
- [x] Weighted grade calculation and deadline aggregation.
- [x] Backend unit and integration test suites.
- [x] TypeScript/Vite frontend, API services, and hash-based router.
- [x] Registration, login, and academic dashboard pages.
- [x] Subject management and subject detail pages.
- [x] Activity management with status filtering and completion actions.
- [x] Assessment management and weighted average display.
- [x] Deadline page with urgency classification.

### Suggested next development priorities

- [ ] Expand backend regression and authorization tests.
- [ ] Add automated frontend and end-to-end tests.
- [ ] Improve session lifecycle management and authentication hardening.
- [ ] Improve dashboard aggregation, deadline pagination, and server-side filtering.
- [ ] Standardize API error responses and improve accessibility.
- [ ] Add CI checks for backend and frontend builds, type checking, and tests.
- [ ] Configure production hosting, HTTPS, secret management, and monitoring.

## Author and License

Developed by **[programmer977](https://github.com/programmer977)**.

Repository: [programmer977/academicHub](https://github.com/programmer977/academicHub).

License declaration: **ISC**, as specified in the root `package.json`. A standalone `LICENSE` file is not currently present in the repository.

---

**Academic Hub — Organize your academic responsibilities. Track your progress. Understand your performance.**
