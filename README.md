## Academic Hub

    Status: Work in progress — backend API under active development. Not production-ready.

Academic Hub is a university-focused academic management application designed to centralize subjects, assignments, assessments, deadlines, and grades. Its goal is to help students organize academic responsibilities in one place.

The repository currently contains a Node.js + TypeScript REST API, authentication, subject endpoints, and an initial PostgreSQL schema. A student-facing frontend is not yet available.
### Current Features

    User registration and login, with password hashing via Argon2id.
    JWT-based authentication; access tokens expire after 15 minutes.
    Authenticated user profile endpoint.
    Subject routes for listing, creation, updates, and deletion (some update/delete behaviors remain incomplete).
    Zod validation integrated with Fastify.
    Parameterized PostgreSQL queries with pg.
    Database migrations for users, subjects, activities, and assessments.
    Interactive API documentation through Swagger UI at /docs.
    Docker Compose configuration for PostgreSQL 17.

Not yet implemented: Activity and assessment HTTP routes, grade calculations, frontend, and operational automated tests.
Tech Stack
Component	Technology
Runtime	Node.js 24
Language	TypeScript
Web framework	Fastify 5
Database	PostgreSQL 17
Database access	pg (node-postgres)
Migrations	node-pg-migrate
Authentication	@fastify/jwt
Password hashing	Argon2id
Validation	Zod + fastify-type-provider-zod
API documentation	Swagger / OpenAPI
Development database	Docker Compose
Getting Started
Prerequisites

    Node.js 24 and npm
    Docker and Docker Compose
    Git

1. Clone and install dependencies
git clone https://github.com/programmer977/academicHub.git
cd academicHub
npm install
2. Configure environment variables
cp .env.example .env

The development configuration includes:
DATABASE_URL=postgresql://academichub:devPass@localhost:5433/academichub
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000

Generate a secret with a cryptographically secure tool, for example openssl rand -hex 32. Never commit the real .env file or use the example database credentials in production.
3. Start PostgreSQL
docker compose up -d db
docker compose ps

The database is available at 127.0.0.1:5433 on the host; the container uses port 5432. PostgreSQL data is stored in a Docker volume.
4. Apply database migrations

Ensure DATABASE_URL is available to the migration CLI. Using the example development credentials:
DATABASE_URL="postgresql://academichub:devPass@127.0.0.1:5433/academichub" npm run migrate -- up
### 5. Start the API
npm run dev

    API base URL: http://localhost:3000/api/v1
    Swagger UI: http://localhost:3000/docs

npm run dev does not start the database container; start PostgreSQL first.
API Endpoints

The following routes are registered in the source code. Their presence does not imply that all behaviors have been integration-tested.
Method	Endpoint	Requires JWT	Description
POST	/api/v1/auth/register	No	Create an account
POST	/api/v1/auth/login	No	Obtain a JWT access token
GET	/api/v1/auth/me	Yes	Get current user information
GET	/api/v1/subjects	Yes	List the authenticated user's subjects
POST	/api/v1/subjects	Yes	Create a subject
PATCH	/api/v1/subjects/:id	Yes	Update a subject (known missing-resource handling issue)
DELETE	/api/v1/subjects/:id	Yes	Delete a subject (known response schema issue)
Register
curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'

A successful registration returns 201 Created. Passwords must have between 12 and 128 characters. Email uniqueness is enforced case-insensitively at the database level.
Login
curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'

A successful login returns accessToken, tokenType: "Bearer", and expiresIn: 900.
Get current user
curl -i http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
Create a subject
curl -i -X POST http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Networks",
    "description": "Networking fundamentals"
  }'

The subject name must contain 1–120 characters after trimming. The optional description can contain up to 1,200 characters or be null. Successful creation is configured to return 201 Created.
List subjects
curl -i http://localhost:3000/api/v1/subjects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

Returns the current user's subjects ordered by name. An empty array is a valid result.
Update a subject
curl -i -X PATCH http://localhost:3000/api/v1/subjects/SUBJECT_UUID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Advanced Computer Networks"}'
Delete a subject
curl -i -X DELETE http://localhost:3000/api/v1/subjects/SUBJECT_UUID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

Warning: The current PATCH and DELETE implementations have known issues described below; they should not be considered production-ready.
HTTP Status Codes
Status	Description	Current use
200 OK	Request succeeded	Login, profile, listing, update
201 Created	Resource created	Registration, subject creation
400 Bad Request	Invalid payload or URL parameters	Zod validation
401 Unauthorized	Missing/invalid/expired token or invalid login	Auth guard and login
404 Not Found	Route or resource unavailable	Unregistered endpoints; subject-level handling incomplete
409 Conflict	Duplicate value violates a unique constraint	PostgreSQL code 23505
500 Internal Server Error	Unexpected server error	Global Fastify error handler

A dedicated 403 Forbidden authorization policy has not yet been added to the subject routes. Subject ownership is checked in SQL via user_id, so records owned by other users are not returned or modified by those queries.
Database Model

The initial migration defines four tables:
Table	Purpose	API coverage
users	Account information, roles, password hashes	Registration, login, profile
subjects	Courses belonging to a user	Routes registered
activities	Tasks, status, and deadlines per subject	Database schema only
assessments	Grades, weights, and deadlines per subject	Database schema only

The database includes a UNIQUE (user_id, name) constraint for subjects. Activities and assessments have foreign keys to subjects with ON DELETE CASCADE; removing a subject also removes related rows.
### Architecture
academicHub/
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
│   │   │   ├── auth.rotes.ts
│   │   │   ├── auth.schemas.ts
│   │   │   └── password.ts
│   │   └── subjects/
│   │       ├── subjects.repository.ts
│   │       ├── subjects.routes.ts
│   │       ├── subjects.schemas.ts
│   │       └── subjects.service.ts
│   └── types/
│       └── jwt.d.ts
├── .env.example
├── package.json
└── tsconfig.json

The subject module follows a Route → Service → Repository → PostgreSQL structure.
Available Scripts
Command	Description
npm run dev	Run the development server with watch mode
npm run typecheck	Check types without creating compiled files
npm run build	Compile TypeScript to dist/
npm start	Start the compiled server
npm run migrate -- up	Apply pending migrations
npm run migrate -- down	Roll back a migration

test:unit and test:integration are defined in package.json, but their referenced test files are not committed to the repository. Automated testing is not currently operational.
Current Limitations

    Update not-found handling: subjects.repository.ts throws a generic error for an absent subject, causing HTTP 500 instead of an intended 404.
    Delete response mismatch: the DELETE query returns only id, while its route declares a success response schema requiring id, name, and description. The not-found response is also not explicit.
    No complete frontend: only the backend is available.
    Activities and assessments: tables exist, but API routes are not implemented.
    Automated tests: test scripts reference files that are not in the repository.
    Production readiness: error handling, test coverage, and security configuration require further work.

### Roadmap

    Fix subject update/delete behaviors and standardize HTTP errors.
    Add integration tests for authentication and user-level data isolation.
    Implement activity management and deadline tracking.
    Implement assessment management and weighted grade calculations.
    Build the frontend, dashboards, and academic overview.

### Repository

Developed by
programmer977 as an ongoing learning project.


