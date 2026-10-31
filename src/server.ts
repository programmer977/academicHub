import { buildApp } from "./app.js";
import {pool} from "./database/db.js";
import {env} from "./config/env.js";

const app = buildApp({pool,jwtSecret:env.JWT_SECRET});

async function start(){
    try{
        await pool.query('SELECT 1');
        await app.listen({port : env.PORT , host : "0.0.0.0"});
    } catch(error) {
        app.log.error(error);
        process.exitCode = 1;
        await app.close();
        await pool.end();
    }
}
await start();