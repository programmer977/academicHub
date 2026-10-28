import type { MigrationBuilder } from 'node-pg-migrate';

export const up =(pgm: MigrationBuilder)=>{
    pgm.sql(`
        CREATE TABLE USERS(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password_hash NOT NULL,
            role TEXT NOT NULL DEFAULT 'user' CHECK(role IN('user','admin'))
        )
    `)
} 
