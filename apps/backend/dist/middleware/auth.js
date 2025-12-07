"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const node_1 = require("better-auth/node");
const config_1 = require("../auth/config");
async function requireAuth(req, res, next) {
    try {
        const session = await config_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
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
function requireRole(role) {
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
