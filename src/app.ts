import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { Pool } from 'pg';
import { authRoutes } from './modules/auth/auth.routes.js';
import { subjectRoutes } from './modules/subjects/subjects.routes.js';
import { activitiesRoutes } from "./modules/activities/activities.route.js";
import { assessmentsRoutes } from "./modules/assessments/assessments.routes.js";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

type appOption = {pool:Pool,jwtSecret:string};

export function buildApp(option:appOption){
    const app = Fastify({logger:true});

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.register(fastifyJwt, {
        secret : option.jwtSecret,
        sign:{
            expiresIn : "15m"
        }
    });
    app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "Academic Hub API",
                version: "1.0.0",
                description:"REST API for managing academic subjects, activities, assessments and deadlines."},
            tags: [{name: "Authentication",description: "User registration and authentication"},
                {name: "Subjects",description: "Academic subject management"},
                {name: "Activities",description: "Academic activity management"},
                {name: "Assessments",description: "Assessments and grade calculations"},
                {name: "Deadlines",description: "Academic deadline tracking"}],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                        }
                    }
                }
            },
        transform: jsonSchemaTransform
    });
    app.register(fastifySwaggerUi, {
        routePrefix: "/docs"
    });
    app.register(authRoutes(option.pool), {
    prefix: "/api/v1/auth"
    });
    app.register(subjectRoutes(option.pool),{
        prefix:"/api/v1"
    });
    app.register(activitiesRoutes(option.pool), {
    prefix: "/api/v1"
    });
    app.register(assessmentsRoutes(option.pool), {
    prefix: "/api/v1"
    });
    app.get("/health", async () => {
    return {
        status: "ok"
    };
    });
    app.get("/ready", async (request, reply) => {
    try {
        await option.pool.query("SELECT 1");
        return reply.code(200).send({
            status: "ready"
        });
    } catch (error) {
        request.log.error(error);

        return reply.code(503).send({
            status: "unavailable"
        });
    }
    });
    const frontendPath = fileURLToPath(
    new URL("../web/dist/", import.meta.url)
    );
    if (existsSync(frontendPath)) {
    app.register(fastifyStatic, {
        root: frontendPath,
        prefix: "/"
    });
    }


    app.setErrorHandler((error,request,reply)=>{
        const err = error as any;
        const databaseCode = typeof error === "object" && error !== null && "code" in error ? error.code:undefined;
        if(databaseCode==="23505"){
            return reply.code(409).send({message:"Recourse already exists"});
        }
        if(err.statusCode===400){
            return reply.code(400).send({message:"invalid request data"});
        }
        if(err.statusCode && err.statusCode >= 400 && err.statusCode < 500){
            return reply.code(err.statusCode).send({message:"request could not be processed"});
        }
        request.log.error(err);
        return reply.code(500).send({message:"internal server error"});
    })



    return app;
}