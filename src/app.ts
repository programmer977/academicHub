import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { validatorCompiler, serializerCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { Pool } from 'pg';
import { authRoutes } from './modules/auth/auth.rotes.js';
import { appendFile } from 'node:fs';

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
    })
    app.register(fastifySwagger, {
        openapi:{
            info:{
                title:"academicHub API",
                description: "Academic management REST API",
                version: "1.0.0"
            }
        },
        transform : jsonSchemaTransform
    })
}