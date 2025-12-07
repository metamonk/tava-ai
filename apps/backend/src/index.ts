import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { sql } from 'drizzle-orm';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
