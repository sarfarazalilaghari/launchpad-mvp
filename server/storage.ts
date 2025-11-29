import {
  users,
  startups,
  pitchDecks,
  messages,
  savedStartups,
  investorMatches,
  type User,
  type UpsertUser,
  type Startup,
  type InsertStartup,
  type PitchDeck,
  type Message,
  type SavedStartup,
  type InvestorMatch,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, gte, lte, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  getInvestors(): Promise<User[]>;

  // Startup operations
  createStartup(startup: InsertStartup): Promise<Startup>;
  getStartup(id: string): Promise<Startup | undefined>;
  getStartupsByFounder(founderId: string): Promise<Startup[]>;
  getAllStartups(filters?: StartupFilters): Promise<Startup[]>;
  updateStartup(id: string, data: Partial<Startup>): Promise<Startup | undefined>;
  deleteStartup(id: string): Promise<void>;
  incrementStartupViewCount(id: string): Promise<void>;

  // Pitch deck operations
  createPitchDeck(startupId: string, slides: any): Promise<PitchDeck>;
  getPitchDeck(startupId: string): Promise<PitchDeck | undefined>;

  // Message operations
  createMessage(message: { senderId: string; recipientId: string; startupId?: string; content: string }): Promise<Message>;
  getMessages(userId: string): Promise<Message[]>;
  getConversation(userId1: string, userId2: string, startupId?: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Saved startups operations
  saveStartup(investorId: string, startupId: string): Promise<SavedStartup>;
  unsaveStartup(investorId: string, startupId: string): Promise<void>;
  getSavedStartups(investorId: string): Promise<SavedStartup[]>;
  isStartupSaved(investorId: string, startupId: string): Promise<boolean>;

  // Investor match operations
  createInvestorMatches(startupId: string, matches: { investorId: string; matchScore: number }[]): Promise<void>;
  getInvestorMatches(startupId: string): Promise<InvestorMatch[]>;

  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllStartups(): Promise<Startup[]>;
  getMessageCount(): Promise<number>;
}

export interface StartupFilters {
  industry?: string;
  minScore?: number;
  maxScore?: number;
  businessModel?: string;
  stage?: string;
  geography?: string;
  search?: string;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getInvestors(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "investor"));
  }

  // Startup operations
  async createStartup(startup: InsertStartup): Promise<Startup> {
    const [newStartup] = await db.insert(startups).values(startup).returning();
    return newStartup;
  }

  async getStartup(id: string): Promise<Startup | undefined> {
    const [startup] = await db.select().from(startups).where(eq(startups.id, id));
    return startup;
  }

  async getStartupsByFounder(founderId: string): Promise<Startup[]> {
    return db
      .select()
      .from(startups)
      .where(eq(startups.founderId, founderId))
      .orderBy(desc(startups.createdAt));
  }

  async getAllStartups(filters?: StartupFilters): Promise<Startup[]> {
    let query = db.select().from(startups);

    const conditions = [];

    if (filters?.industry) {
      conditions.push(eq(startups.industry, filters.industry));
    }
    if (filters?.minScore !== undefined) {
      conditions.push(gte(startups.aiScore, filters.minScore));
    }
    if (filters?.maxScore !== undefined) {
      conditions.push(lte(startups.aiScore, filters.maxScore));
    }
    if (filters?.businessModel) {
      conditions.push(eq(startups.businessModel, filters.businessModel));
    }
    if (filters?.stage) {
      conditions.push(eq(startups.stage, filters.stage));
    }
    if (filters?.geography) {
      conditions.push(eq(startups.geography, filters.geography));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(startups.title, `%${filters.search}%`),
          ilike(startups.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(startups)
        .where(and(...conditions))
        .orderBy(desc(startups.aiScore), desc(startups.createdAt));
    }

    return db.select().from(startups).orderBy(desc(startups.aiScore), desc(startups.createdAt));
  }

  async updateStartup(id: string, data: Partial<Startup>): Promise<Startup | undefined> {
    const [startup] = await db
      .update(startups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(startups.id, id))
      .returning();
    return startup;
  }

  async deleteStartup(id: string): Promise<void> {
    await db.delete(startups).where(eq(startups.id, id));
  }

  async incrementStartupViewCount(id: string): Promise<void> {
    const startup = await this.getStartup(id);
    if (startup) {
      await db
        .update(startups)
        .set({ viewCount: (startup.viewCount || 0) + 1 })
        .where(eq(startups.id, id));
    }
  }

  // Pitch deck operations
  async createPitchDeck(startupId: string, slides: any): Promise<PitchDeck> {
    // Delete existing pitch deck if any
    await db.delete(pitchDecks).where(eq(pitchDecks.startupId, startupId));
    
    const [deck] = await db
      .insert(pitchDecks)
      .values({ startupId, slides })
      .returning();
    return deck;
  }

  async getPitchDeck(startupId: string): Promise<PitchDeck | undefined> {
    const [deck] = await db
      .select()
      .from(pitchDecks)
      .where(eq(pitchDecks.startupId, startupId));
    return deck;
  }

  // Message operations
  async createMessage(message: {
    senderId: string;
    recipientId: string;
    startupId?: string;
    content: string;
  }): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(userId1: string, userId2: string, startupId?: string): Promise<Message[]> {
    const conditions = [
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      ),
    ];

    if (startupId) {
      conditions.push(eq(messages.startupId, startupId));
    }

    return db
      .select()
      .from(messages)
      .where(and(...conditions))
      .orderBy(asc(messages.createdAt));
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ read: true }).where(eq(messages.id, id));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const unreadMessages = await db
      .select()
      .from(messages)
      .where(and(eq(messages.recipientId, userId), eq(messages.read, false)));
    return unreadMessages.length;
  }

  // Saved startups operations
  async saveStartup(investorId: string, startupId: string): Promise<SavedStartup> {
    const [saved] = await db
      .insert(savedStartups)
      .values({ investorId, startupId })
      .returning();
    return saved;
  }

  async unsaveStartup(investorId: string, startupId: string): Promise<void> {
    await db
      .delete(savedStartups)
      .where(
        and(
          eq(savedStartups.investorId, investorId),
          eq(savedStartups.startupId, startupId)
        )
      );
  }

  async getSavedStartups(investorId: string): Promise<SavedStartup[]> {
    return db
      .select()
      .from(savedStartups)
      .where(eq(savedStartups.investorId, investorId))
      .orderBy(desc(savedStartups.savedAt));
  }

  async isStartupSaved(investorId: string, startupId: string): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedStartups)
      .where(
        and(
          eq(savedStartups.investorId, investorId),
          eq(savedStartups.startupId, startupId)
        )
      );
    return !!saved;
  }

  // Investor match operations
  async createInvestorMatches(
    startupId: string,
    matches: { investorId: string; matchScore: number }[]
  ): Promise<void> {
    // Delete existing matches
    await db.delete(investorMatches).where(eq(investorMatches.startupId, startupId));
    
    if (matches.length > 0) {
      await db.insert(investorMatches).values(
        matches.map((m) => ({
          startupId,
          investorId: m.investorId,
          matchScore: m.matchScore,
        }))
      );
    }
  }

  async getInvestorMatches(startupId: string): Promise<InvestorMatch[]> {
    return db
      .select()
      .from(investorMatches)
      .where(eq(investorMatches.startupId, startupId))
      .orderBy(desc(investorMatches.matchScore));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getAllStartups(): Promise<Startup[]> {
    return db.select().from(startups);
  }

  async getMessageCount(): Promise<number> {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(messages);
    return result[0]?.count ? parseInt(result[0].count.toString()) : 0;
  }
}

export const storage = new DatabaseStorage();
