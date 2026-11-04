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
