"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plans = exports.sessions = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).notNull(), // 'therapist' | 'client'
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    therapistId: (0, pg_core_1.uuid)('therapist_id')
        .references(() => exports.users.id)
        .notNull(),
    clientId: (0, pg_core_1.uuid)('client_id')
        .references(() => exports.users.id)
        .notNull(),
    date: (0, pg_core_1.timestamp)('date').defaultNow().notNull(),
    transcript: (0, pg_core_1.text)('transcript').notNull(),
    riskLevel: (0, pg_core_1.varchar)('risk_level', { length: 20 }).notNull().default('none'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.plans = (0, pg_core_1.pgTable)('plans', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)('session_id')
        .references(() => exports.sessions.id)
        .notNull(),
    clientId: (0, pg_core_1.uuid)('client_id')
        .references(() => exports.users.id)
        .notNull(),
    therapistId: (0, pg_core_1.uuid)('therapist_id')
        .references(() => exports.users.id)
        .notNull(),
    versionNumber: (0, pg_core_1.integer)('version_number').notNull(),
    therapistPlanText: (0, pg_core_1.text)('therapist_plan_text').notNull(),
    clientPlanText: (0, pg_core_1.text)('client_plan_text').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
