import { Request, Response, NextFunction } from 'express';
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
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            session?: AuthSession;
        }
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireRole(role: 'therapist' | 'client'): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.d.ts.map