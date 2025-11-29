import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table with role support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }), // 'founder' or 'investor'
  bio: text("bio"),
  company: varchar("company"),
  investmentFocus: text("investment_focus").array(), // For investors
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Startups table
export const startups = pgTable("startups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  founderId: varchar("founder_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  targetMarket: text("target_market").notNull(),
  businessModel: varchar("business_model", { length: 100 }),
  stage: varchar("stage", { length: 50 }), // 'idea', 'mvp', 'growth', 'scale'
  industry: varchar("industry", { length: 100 }),
  geography: varchar("geography", { length: 100 }),
  fundingAsk: varchar("funding_ask", { length: 50 }),
  tags: text("tags").array(),
  aiScore: integer("ai_score"),
  aiScoreBreakdown: jsonb("ai_score_breakdown"),
  marketAnalysis: jsonb("market_analysis"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pitch decks table
export const pitchDecks = pgTable("pitch_decks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startupId: varchar("startup_id").notNull().references(() => startups.id),
  slides: jsonb("slides").notNull(), // Array of slide objects
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  startupId: varchar("startup_id").references(() => startups.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved startups (for investors)
export const savedStartups = pgTable("saved_startups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investorId: varchar("investor_id").notNull().references(() => users.id),
  startupId: varchar("startup_id").notNull().references(() => startups.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Investor matches table
export const investorMatches = pgTable("investor_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startupId: varchar("startup_id").notNull().references(() => startups.id),
  investorId: varchar("investor_id").notNull().references(() => users.id),
  matchScore: integer("match_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  startups: many(startups),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  savedStartups: many(savedStartups),
}));

export const startupsRelations = relations(startups, ({ one, many }) => ({
  founder: one(users, {
    fields: [startups.founderId],
    references: [users.id],
  }),
  pitchDeck: one(pitchDecks),
  messages: many(messages),
  savedBy: many(savedStartups),
  investorMatches: many(investorMatches),
}));

export const pitchDecksRelations = relations(pitchDecks, ({ one }) => ({
  startup: one(startups, {
    fields: [pitchDecks.startupId],
    references: [startups.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
  startup: one(startups, {
    fields: [messages.startupId],
    references: [startups.id],
  }),
}));

export const savedStartupsRelations = relations(savedStartups, ({ one }) => ({
  investor: one(users, {
    fields: [savedStartups.investorId],
    references: [users.id],
  }),
  startup: one(startups, {
    fields: [savedStartups.startupId],
    references: [startups.id],
  }),
}));

export const investorMatchesRelations = relations(investorMatches, ({ one }) => ({
  startup: one(startups, {
    fields: [investorMatches.startupId],
    references: [startups.id],
  }),
  investor: one(users, {
    fields: [investorMatches.investorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStartupSchema = createInsertSchema(startups).omit({
  id: true,
  aiScore: true,
  aiScoreBreakdown: true,
  marketAnalysis: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertSavedStartupSchema = createInsertSchema(savedStartups).omit({
  id: true,
  savedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertStartup = typeof startups.$inferInsert;
export type Startup = typeof startups.$inferSelect;
export type PitchDeck = typeof pitchDecks.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type SavedStartup = typeof savedStartups.$inferSelect;
export type InvestorMatch = typeof investorMatches.$inferSelect;

// AI Score breakdown type
export interface AIScoreBreakdown {
  marketPotential: number;
  feasibility: number;
  innovation: number;
  scalability: number;
}

// Market analysis type
export interface MarketAnalysis {
  marketSize: string;
  competition: string[];
  risks: string[];
  opportunities: string[];
}

// Pitch deck slide type
export interface PitchSlide {
  title: string;
  content: string;
  type: 'problem' | 'solution' | 'market' | 'business_model' | 'ask';
}
