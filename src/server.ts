import { buildApp } from "./app.js";

const app = buildApp();

app.get("/api/v1",async()=>{
    return({"name": "AcademicHub API","version": "1.0.0"});
})

async function start() {
    try {
        await app.listen({port:3000,host:"0.0.0.0"})
    } catch(error){
        app.log.error(error);
        process.exit(1);
    }
}
await start();