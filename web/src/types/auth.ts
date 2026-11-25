export type RegisterInput = {
    name: string;
    email: string;
    password: string;
};

export type LoginInput = {
    email: string;
    password: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
};

export type LoginResponse = {
    accessToken: string;
    tokenType: "Bearer";
    expiresIn: number;
};