import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from 'drizzle-orm/pg-core';

// Users table - extended for BetterAuth compatibility
export const users = pgTable('users', {
  id: text('id').primaryKey(), // BetterAuth uses text IDs
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  image: text('image'),
  role: varchar('role', { length: 20 }).notNull(), // 'therapist' | 'client'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// BetterAuth session table (named authSessions to avoid conflict with therapy sessions)
export const authSessions = pgTable(
  'auth_sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('auth_sessions_user_id_idx').on(table.userId)]
);

// BetterAuth account table for credential/OAuth providers
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'), // Hashed password for credential provider
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('account_user_id_idx').on(table.userId)]
);

// BetterAuth verification table for email verification tokens
export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);

// Therapy sessions table
export const therapySessions = pgTable(
  'therapy_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    therapistId: text('therapist_id')
      .references(() => users.id)
      .notNull(),
    clientId: text('client_id')
      .references(() => users.id)
      .notNull(),
    date: timestamp('date').defaultNow().notNull(),
    transcript: text('transcript'),
    audioFilePath: text('audio_file_path'),
    riskLevel: varchar('risk_level', { length: 20 }).notNull().default('none'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('therapy_sessions_therapist_id_idx').on(table.therapistId),
    index('therapy_sessions_client_id_idx').on(table.clientId),
    index('therapy_sessions_date_idx').on(table.date),
    index('therapy_sessions_therapist_client_idx').on(table.therapistId, table.clientId),
  ]
);

// Treatment plans table
export const plans = pgTable(
  'plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .references(() => therapySessions.id)
      .notNull(),
    clientId: text('client_id')
      .references(() => users.id)
      .notNull(),
    therapistId: text('therapist_id')
      .references(() => users.id)
      .notNull(),
    versionNumber: integer('version_number').notNull(),
    therapistPlanText: text('therapist_plan_text').notNull(),
    clientPlanText: text('client_plan_text').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('plans_session_id_idx').on(table.sessionId),
    index('plans_is_active_idx').on(table.isActive),
    index('plans_session_active_idx').on(table.sessionId, table.isActive),
  ]
);
