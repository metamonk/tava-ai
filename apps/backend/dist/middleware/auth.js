import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/config.js';
export async function requireAuth(req, res, next) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        req.user = session.user;
        req.session = session;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid session' });
    }
}
export function requireRole(role) {
    return (req, res, next) => {
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
