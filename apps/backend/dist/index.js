"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint for App Runner
app.get('/health', async (_req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected',
    };
    try {
        await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
        health.database = 'connected';
    }
    catch {
        health.status = 'unhealthy';
        health.database = 'disconnected';
        return res.status(500).json(health);
    }
    res.json(health);
});
// API routes placeholder
app.get('/api', (_req, res) => {
    res.json({ message: 'Tava AI API' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
