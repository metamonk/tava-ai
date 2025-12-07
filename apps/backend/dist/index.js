"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_1 = require("better-auth/node");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("./db");
const config_1 = require("./auth/config");
const auth_1 = require("./middleware/auth");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// CORS configuration with credentials support for auth cookies
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
// Mount BetterAuth handler BEFORE express.json() middleware
app.all('/api/auth/*', (0, node_1.toNodeHandler)(config_1.auth));
// Body parsing middleware (after BetterAuth handler)
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
// Get current user session - used for session persistence on page refresh
app.get('/api/me', auth_1.requireAuth, (req, res) => {
    res.json({
        user: req.user,
        session: req.session,
    });
});
// Example protected routes (for reference)
// app.get('/api/therapist/dashboard', requireAuth, requireRole('therapist'), (req, res) => { ... });
// app.get('/api/client/plan', requireAuth, requireRole('client'), (req, res) => { ... });
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
