import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { sql } from 'drizzle-orm';
import { db } from './db/index.js';
import { auth } from './auth/config.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import sessionsRouter from './routes/sessions.js';
import plansRouter from './routes/plans.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration with credentials support for auth cookies
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Mount BetterAuth handler BEFORE express.json() middleware
app.all('/api/auth/*', toNodeHandler(auth));

// Body parsing middleware (after BetterAuth handler)
app.use(express.json());
app.use(cookieParser());

// Health check endpoint for App Runner
app.get('/health', async (_req: Request, res: Response) => {
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    database: string;
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected',
  };

  try {
    await db.execute(sql`SELECT 1`);
    health.database = 'connected';
  } catch {
    health.status = 'unhealthy';
    health.database = 'disconnected';
    return res.status(500).json(health);
  }

  res.json(health);
});

// API routes placeholder
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'Tava AI API' });
});

// Get current user session - used for session persistence on page refresh
app.get('/api/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    user: req.user,
    session: req.session,
  });
});

// Session management routes
app.use('/api/sessions', sessionsRouter);

// Plan management routes
app.use('/api/plans', plansRouter);

// Dashboard routes
app.use('/api/dashboard', dashboardRouter);

// Example protected routes (for reference)
// app.get('/api/therapist/dashboard', requireAuth, requireRole('therapist'), (req, res) => { ... });
// app.get('/api/client/plan', requireAuth, requireRole('client'), (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
