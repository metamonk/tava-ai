"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plans = exports.therapySessions = exports.verification = exports.account = exports.authSessions = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// Users table - extended for BetterAuth compatibility
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey(), // BetterAuth uses text IDs
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    image: (0, pg_core_1.text)('image'),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull(), // 'therapist' | 'client'
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// BetterAuth session table (named authSessions to avoid conflict with therapy sessions)
exports.authSessions = (0, pg_core_1.pgTable)('auth_sessions', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    token: (0, pg_core_1.text)('token').notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    userAgent: (0, pg_core_1.text)('user_agent'),
    userId: (0, pg_core_1.text)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
}, (table) => [(0, pg_core_1.index)('auth_sessions_user_id_idx').on(table.userId)]);
// BetterAuth account table for credential/OAuth providers
exports.account = (0, pg_core_1.pgTable)('account', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    accountId: (0, pg_core_1.text)('account_id').notNull(),
    providerId: (0, pg_core_1.text)('provider_id').notNull(),
    userId: (0, pg_core_1.text)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    accessToken: (0, pg_core_1.text)('access_token'),
    refreshToken: (0, pg_core_1.text)('refresh_token'),
    idToken: (0, pg_core_1.text)('id_token'),
    accessTokenExpiresAt: (0, pg_core_1.timestamp)('access_token_expires_at'),
    refreshTokenExpiresAt: (0, pg_core_1.timestamp)('refresh_token_expires_at'),
    scope: (0, pg_core_1.text)('scope'),
    password: (0, pg_core_1.text)('password'), // Hashed password for credential provider
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [(0, pg_core_1.index)('account_user_id_idx').on(table.userId)]);
// BetterAuth verification table for email verification tokens
exports.verification = (0, pg_core_1.pgTable)('verification', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    identifier: (0, pg_core_1.text)('identifier').notNull(),
    value: (0, pg_core_1.text)('value').notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => [(0, pg_core_1.index)('verification_identifier_idx').on(table.identifier)]);
// Therapy sessions table
exports.therapySessions = (0, pg_core_1.pgTable)('therapy_sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    therapistId: (0, pg_core_1.text)('therapist_id')
        .references(() => exports.users.id)
        .notNull(),
    clientId: (0, pg_core_1.text)('client_id')
        .references(() => exports.users.id)
        .notNull(),
    date: (0, pg_core_1.timestamp)('date').defaultNow().notNull(),
    transcript: (0, pg_core_1.text)('transcript'),
    audioFilePath: (0, pg_core_1.text)('audio_file_path'),
    riskLevel: (0, pg_core_1.varchar)('risk_level', { length: 20 }).notNull().default('none'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// Treatment plans table
exports.plans = (0, pg_core_1.pgTable)('plans', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)('session_id')
        .references(() => exports.therapySessions.id)
        .notNull(),
    clientId: (0, pg_core_1.text)('client_id')
        .references(() => exports.users.id)
        .notNull(),
    therapistId: (0, pg_core_1.text)('therapist_id')
        .references(() => exports.users.id)
        .notNull(),
    versionNumber: (0, pg_core_1.integer)('version_number').notNull(),
    therapistPlanText: (0, pg_core_1.text)('therapist_plan_text').notNull(),
    clientPlanText: (0, pg_core_1.text)('client_plan_text').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
