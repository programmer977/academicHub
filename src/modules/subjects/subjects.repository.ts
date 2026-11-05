import {Pool} from "pg";

export type subject = {
    id:string,
    name:string,
    description:string|null,
}