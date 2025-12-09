import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, therapySessions, plans } from '../db/schema';
import { requireAuth, requireRole } from '../middleware/auth';

const router: IRouter = Router();

// GET /api/dashboard/therapist - Get therapist dashboard data with clients and recent sessions
router.get(
  '/therapist',
  requireAuth,
  requireRole('therapist'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const therapistId = req.user!.id;

      // Get unique clients with their info (clients who have sessions with this therapist)
      const clientsWithSessions = await db
        .selectDistinctOn([therapySessions.clientId], {
          clientId: therapySessions.clientId,
          clientName: users.name,
          clientEmail: users.email,
        })
        .from(therapySessions)
        .innerJoin(users, eq(therapySessions.clientId, users.id))
        .where(eq(therapySessions.therapistId, therapistId))
        .orderBy(therapySessions.clientId);

      // Get recent sessions with client info and plan status
      const recentSessions = await db
        .select({
          id: therapySessions.id,
          date: therapySessions.date,
          clientId: therapySessions.clientId,
          clientName: users.name,
          riskLevel: therapySessions.riskLevel,
          hasPlan: plans.id,
        })
        .from(therapySessions)
        .innerJoin(users, eq(therapySessions.clientId, users.id))
        .leftJoin(plans, and(eq(plans.sessionId, therapySessions.id), eq(plans.isActive, true)))
        .where(eq(therapySessions.therapistId, therapistId))
        .orderBy(desc(therapySessions.date))
        .limit(10);

      res.json({
        clients: clientsWithSessions,
        recentSessions,
      });
    } catch (error) {
      console.error('Error fetching therapist dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }
);

// GET /api/dashboard/therapist/clients/:clientId - Get client details with session history
router.get(
  '/therapist/clients/:clientId',
  requireAuth,
  requireRole('therapist'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const therapistId = req.user!.id;

      // Get client info
      const [client] = await db.select().from(users).where(eq(users.id, clientId));

      if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      // Verify therapist has sessions with this client (access control)
      const [hasAccess] = await db
        .select({ count: sql<number>`count(*)` })
        .from(therapySessions)
        .where(
          and(eq(therapySessions.clientId, clientId), eq(therapySessions.therapistId, therapistId))
        );

      if (!hasAccess || hasAccess.count === 0) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get all sessions for this client with the current therapist
      const clientSessions = await db
        .select({
          id: therapySessions.id,
          date: therapySessions.date,
          riskLevel: therapySessions.riskLevel,
          planId: plans.id,
          planVersion: plans.versionNumber,
        })
        .from(therapySessions)
        .leftJoin(plans, and(eq(plans.sessionId, therapySessions.id), eq(plans.isActive, true)))
        .where(
          and(eq(therapySessions.clientId, clientId), eq(therapySessions.therapistId, therapistId))
        )
        .orderBy(desc(therapySessions.date));

      res.json({
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
        },
        sessions: clientSessions,
      });
    } catch (error) {
      console.error('Error fetching client details:', error);
      res.status(500).json({ error: 'Failed to fetch client details' });
    }
  }
);

export default router;
