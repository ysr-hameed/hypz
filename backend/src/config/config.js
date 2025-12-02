import dotenv from "dotenv";

dotenv.config();

export default {
    // Server
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT) || 5000,
    API_VERSION: process.env.API_VERSION || "v1",

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-in-production",
    JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh-secret",
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "90d",

    // Email
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM || "noreply@hypz.io",

    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

    // File Storage
    UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 104857600, // 100MB
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(",") || [],

    // Security
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT) || 100,
    API_RATE_WINDOW: parseInt(process.env.API_RATE_WINDOW) || 15,
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || "info",

    // OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    // Payment - Skydo
    SKYDO_API_KEY: process.env.SKYDO_API_KEY,
    SKYDO_WEBHOOK_SECRET: process.env.SKYDO_WEBHOOK_SECRET,

    // Backblaze B2
    B2_APPLICATION_KEY_ID: process.env.B2_APPLICATION_KEY_ID,
    B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY,
    B2_PUBLIC_BUCKET_ID: process.env.B2_PUBLIC_BUCKET_ID,
    B2_PUBLIC_BUCKET_NAME: process.env.B2_PUBLIC_BUCKET_NAME,
    B2_PRIVATE_BUCKET_ID: process.env.B2_PRIVATE_BUCKET_ID,
    B2_PRIVATE_BUCKET_NAME: process.env.B2_PRIVATE_BUCKET_NAME,
    B2_ENDPOINT: process.env.B2_ENDPOINT,

    // Admin
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@hypz.io",
};
