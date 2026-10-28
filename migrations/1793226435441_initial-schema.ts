import type { MigrationBuilder } from 'node-pg-migrate';

export const up =(pgm: MigrationBuilder)=>{
    pgm.sql(`
        CREATE TABLE users(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password_hash NOT NULL,
            role TEXT NOT NULL DEFAULT 'user' CHECK(role IN('user','admin')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        )
        CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email));

        CREATE TABLE subjects(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE (user_id, name)
        )
        CREATE INDEX subjects_user_id_idx ON subjects(user_id);

        CREATE TABLE activies(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status in('pending','in_progress','completed')),
            due_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `)
} 
