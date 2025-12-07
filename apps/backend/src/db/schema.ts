import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'therapist' | 'client'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  therapistId: uuid('therapist_id')
    .references(() => users.id)
    .notNull(),
  clientId: uuid('client_id')
    .references(() => users.id)
    .notNull(),
  date: timestamp('date').defaultNow().notNull(),
  transcript: text('transcript').notNull(),
  riskLevel: varchar('risk_level', { length: 20 }).notNull().default('none'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .references(() => sessions.id)
    .notNull(),
  clientId: uuid('client_id')
    .references(() => users.id)
    .notNull(),
  therapistId: uuid('therapist_id')
    .references(() => users.id)
    .notNull(),
  versionNumber: integer('version_number').notNull(),
  therapistPlanText: text('therapist_plan_text').notNull(),
  clientPlanText: text('client_plan_text').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
