import {defineConfig} from "vite";

export default defineConfig({
    server:{
        proxy:{
            "/api":{
                target:"localhost:3000",
                changeOrigin:true
            }
        }
    }
})