import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { Pool } from 'pg';
import { authRoutes } from './modules/auth/auth.rotes.js';
import { subjectRoutes } from './modules/subjects/subjects.routes.js';

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
        openapi:{
            info:{
                title:"academicHub API",
                description: "Academic management REST API",
                version: "1.0.0"
            }
        },
        transform : jsonSchemaTransform
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