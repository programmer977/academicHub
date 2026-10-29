import type { MigrationBuilder } from 'node-pg-migrate';

export const up =(pgm: MigrationBuilder)=>{
    pgm.sql(`
        CREATE TABLE users(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user' CHECK(role IN('user','admin')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email));

        CREATE TABLE subjects(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, name)
        );
        CREATE INDEX subjects_user_id_idx ON subjects(user_id);

        CREATE TABLE activities(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status in('pending','in_progress','completed')),
            due_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX activities_subject_id_idx ON activities(subject_id);
        CREATE INDEX activities_due_at_idx ON activities(due_at);

        CREATE TABLE assessments(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            grade NUMERIC(4,2) CHECK (grade BETWEEN 0 AND 10),
            weight INTEGER NOT NULL DEFAULT 1
            CHECK (weight BETWEEN 1 AND 10),
            due_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX assessments_subject_id_idx ON assessments(subject_id);
        CREATE INDEX assessments_due_at_idx ON assessments(due_at);
    `)
};

export const down = (pgm: MigrationBuilder) => {
  pgm.sql(`
    DROP TABLE IF EXISTS assessments;
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS subjects;
    DROP TABLE IF EXISTS users;
  `);
};
