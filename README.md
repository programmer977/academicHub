Academic Hub

Status: Work in progress — The authentication API and database foundation are implemented. Academic management features are still under development.

Overview

Imagine taking five university courses at the same time. Each course has different assignments, exams, grades, and deadlines. Keeping track of everything across multiple platforms and personal notes can quickly become difficult.

Academic Hub is a university-focused academic management system designed to centralize that information in one place. Its goal is to help students organize their subjects, monitor upcoming work, track assessments, and eventually calculate grades without constantly switching between tools.

The project currently focuses on its backend API, database design, and authentication infrastructure. There is no completed student-facing interface yet.

Current Features

Implemented

User registration with input validation and unique email addresses (case-insensitive uniqueness at the database level).

User login with email and password, returning a JSON Web Token (JWT).

Authenticated profile endpoint to retrieve the current user's basic account information.

Password hashing and verification with Argon2id.

JWT-protected endpoints, with access tokens configured to expire after 15 minutes.

Request validation using Zod and Fastify's Zod type provider.

PostgreSQL database schema and migrations for users, subjects, activities, and assessments.

API documentation tooling using Swagger/OpenAPI, exposed at /docs.

Docker Compose configuration for a local PostgreSQL 17 instance with persistent storage and a health check.

Database Foundation (Not Yet Exposed Through the API)

The initial migration defines four tables:

Table

Purpose

users

Accounts, hashed passwords, and roles (user or admin).

subjects

University courses owned by individual users.

activities

Tasks and assignments associated with a subject, including status and due date.

assessments

Evaluations associated with a subject, including grade, weight, and due date.

Important: A table existing in the database does not mean the corresponding CRUD endpoints are available. Subject validation schemas have been started, but subject, activity, and assessment routes are not yet implemented in the current repository.

Planned Features

Create, view, update, and delete subjects.

Manage assignments and track their completion status.

Organize assessments, grades, and weights by subject.

Calculate and visualize academic performance.

View upcoming deadlines in a centralized overview.

Build a student-facing interface for everyday use.

These are development goals, not features currently available for use.

Tech Stack

Area

Technology

Runtime

Node.js 24

Language

TypeScript

HTTP framework

Fastify

Database

PostgreSQL 17

Database driver

pg (node-postgres)

Migrations

node-pg-migrate

Authentication

@fastify/jwt

Password security

Argon2id (argon2)

Validation

Zod + fastify-type-provider-zod

API documentation

Swagger / OpenAPI

Local database environment

Docker Compose

Getting Started

Prerequisites

Node.js 24 and npm

Docker with Docker Compose

Git

1. Clone and install

git clone https://github.com/programmer977/academicHub.git
cd academicHub
npm install

2. Configure environment variables

cp .env.example .env

The example file contains the following variables:

DATABASE_URL=postgresql://academichub:devPass@localhost:5433/academichub
JWT_SECRET=replace_with_a_long_random_secret
PORT=3000

Replace JWT_SECRET with a sufficiently long, randomly generated secret. The database connection above matches the development-only credentials in compose.yaml.

Do not use these credentials in production or commit your real .env file.

3. Start PostgreSQL

docker compose up -d db
docker compose ps

Docker publishes PostgreSQL on 127.0.0.1:5433 on the host, forwarding it to port 5432 inside the container. The database is stored in a persistent Docker volume.

4. Apply the database migration

npm run migrate -- up

5. Start the development server

npm run dev

The API should be available at http://localhost:3000, and the Swagger UI at http://localhost:3000/docs.

npm run dev starts only the Node.js application. It does not start PostgreSQL. Make sure the Docker database service is running first.

Available API Endpoints

Base URL: http://localhost:3000

Method

Endpoint

Authentication

Description

POST

/api/v1/auth/register

No

Register a new account.

POST

/api/v1/auth/login

No

Authenticate and receive an access token.

GET

/api/v1/auth/me

Bearer JWT

Retrieve the authenticated user's account details.

Register

curl -i -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'

A successful registration returns 201 Created with the new user's ID, name, email, and role. Passwords must contain 12–128 characters.

Log in

curl -i -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "ExamplePassword123!"
  }'

A successful login returns an accessToken, the token type (Bearer), and an expiration value of 900 seconds (15 minutes).

Get the authenticated user

curl -i http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

Replace YOUR_ACCESS_TOKEN with the token returned by the login endpoint.

Project Structure

academicHub/
├── compose.yaml                  # Local PostgreSQL service
├── migrations/                   # Database schema migrations
├── src/
│   ├── app.ts                    # Fastify plugins, auth routes, error handling
│   ├── server.ts                 # Database check and HTTP server startup
│   ├── config/
│   │   └── env.ts                # Environment validation
│   ├── database/
│   │   └── db.ts                 # PostgreSQL connection pool
│   ├── modules/
│   │   ├── auth/                 # Registration, login, JWT guard, passwords
│   │   └── subjects/             # Subject schemas (routes still pending)
│   └── types/                    # TypeScript declarations
├── .env.example                  # Environment template
├── package.json
└── tsconfig.json

Available Scripts

Command

Description

npm run dev

Run the API in watch mode.

npm run build

Compile TypeScript.

npm start

Run the compiled server.

npm run typecheck

Check TypeScript types without generating files.

npm run migrate -- up

Apply pending database migrations.

The package.json also defines unit and integration test commands, but the referenced test files are not currently present in the repository. Automated testing is therefore not documented as operational yet.

Development Status

Academic Hub is an early-stage project. Authentication, initial data modeling, and local infrastructure are in place, but its main academic workflows are not finished.

Features and API contracts may change as development continues.

Repository

GitHub — Academic Hub
