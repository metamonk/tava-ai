import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/config';

// User type with role field
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'therapist' | 'client';
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Session type
interface AuthSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: AuthUser;
}

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      session?: AuthSession;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = session.user as AuthUser;
    req.session = session as unknown as AuthSession;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid session' });
  }
}

export function requireRole(role: 'therapist' | 'client') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}
