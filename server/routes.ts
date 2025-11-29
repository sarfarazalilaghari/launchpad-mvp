import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generatePitchDeck, scoreStartupIdea, generateMarketAnalysis, matchInvestors } from "./openai";
import { insertStartupSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role
  app.post("/api/auth/role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!["founder", "investor"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio, company, investmentFocus } = req.body;
      
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...currentUser,
        bio,
        company,
        investmentFocus,
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Startup routes
  app.post("/api/startups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "founder") {
        return res.status(403).json({ message: "Only founders can create startups" });
      }

      const validatedData = insertStartupSchema.parse({
        ...req.body,
        founderId: userId,
      });

      const startup = await storage.createStartup(validatedData);

      // Check if OpenAI is configured
      if (process.env.OPENAI_API_KEY) {
        // Generate AI score and analysis in background
        try {
          const [scoreResult, marketAnalysis] = await Promise.all([
            scoreStartupIdea(
              startup.title,
              startup.description,
              startup.problem,
              startup.solution,
              startup.targetMarket,
              startup.industry || undefined
            ),
            generateMarketAnalysis(
              startup.title,
              startup.description,
              startup.targetMarket,
              startup.industry || undefined
            ),
          ]);

          await storage.updateStartup(startup.id, {
            aiScore: scoreResult.score,
            aiScoreBreakdown: scoreResult.breakdown,
            marketAnalysis,
          });

          // Match with investors
          const investors = await storage.getInvestors();
          if (investors.length > 0) {
            const matches = await matchInvestors(
              startup.industry || "General",
              startup.stage || "idea",
              investors.map((inv) => ({ id: inv.id, investmentFocus: inv.investmentFocus }))
            );
            
            if (matches.length > 0) {
              await storage.createInvestorMatches(startup.id, matches);
            }
          }

          const updatedStartup = await storage.getStartup(startup.id);
          res.json(updatedStartup);
        } catch (aiError) {
          console.error("AI processing error:", aiError);
          res.json(startup);
        }
      } else {
        // No OpenAI key - return startup without AI features
        console.log("OpenAI API key not configured - skipping AI analysis");
        res.json(startup);
      }
    } catch (error) {
      console.error("Error creating startup:", error);
      res.status(500).json({ message: "Failed to create startup" });
    }
  });

  app.get("/api/startups", async (req, res) => {
    try {
      const { industry, minScore, maxScore, businessModel, stage, geography, search } = req.query;
      
      const startups = await storage.getAllStartups({
        industry: industry as string,
        minScore: minScore ? parseInt(minScore as string) : undefined,
        maxScore: maxScore ? parseInt(maxScore as string) : undefined,
        businessModel: businessModel as string,
        stage: stage as string,
        geography: geography as string,
        search: search as string,
      });

      res.json(startups);
    } catch (error) {
      console.error("Error fetching startups:", error);
      res.status(500).json({ message: "Failed to fetch startups" });
    }
  });

  app.get("/api/startups/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startups = await storage.getStartupsByFounder(userId);
      res.json(startups);
    } catch (error) {
      console.error("Error fetching my startups:", error);
      res.status(500).json({ message: "Failed to fetch startups" });
    }
  });

  app.get("/api/startups/:id", async (req, res) => {
    try {
      const startup = await storage.getStartup(req.params.id);
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      // Increment view count
      await storage.incrementStartupViewCount(req.params.id);

      // Get founder info
      const founder = await storage.getUser(startup.founderId);

      res.json({ ...startup, founder });
    } catch (error) {
      console.error("Error fetching startup:", error);
      res.status(500).json({ message: "Failed to fetch startup" });
    }
  });

  app.patch("/api/startups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startup = await storage.getStartup(req.params.id);
      
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      if (startup.founderId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedStartup = await storage.updateStartup(req.params.id, req.body);
      res.json(updatedStartup);
    } catch (error) {
      console.error("Error updating startup:", error);
      res.status(500).json({ message: "Failed to update startup" });
    }
  });

  app.delete("/api/startups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startup = await storage.getStartup(req.params.id);
      
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      if (startup.founderId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteStartup(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting startup:", error);
      res.status(500).json({ message: "Failed to delete startup" });
    }
  });

  // Pitch deck routes
  app.post("/api/startups/:id/pitch-deck", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startup = await storage.getStartup(req.params.id);
      
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      if (startup.founderId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const slides = await generatePitchDeck(
        startup.title,
        startup.description,
        startup.problem,
        startup.solution,
        startup.targetMarket,
        startup.businessModel || undefined
      );

      const pitchDeck = await storage.createPitchDeck(startup.id, slides);
      res.json(pitchDeck);
    } catch (error) {
      console.error("Error generating pitch deck:", error);
      res.status(500).json({ message: "Failed to generate pitch deck" });
    }
  });

  app.get("/api/startups/:id/pitch-deck", async (req, res) => {
    try {
      const pitchDeck = await storage.getPitchDeck(req.params.id);
      if (!pitchDeck) {
        return res.status(404).json({ message: "Pitch deck not found" });
      }
      res.json(pitchDeck);
    } catch (error) {
      console.error("Error fetching pitch deck:", error);
      res.status(500).json({ message: "Failed to fetch pitch deck" });
    }
  });

  // Investor matches
  app.get("/api/startups/:id/matches", isAuthenticated, async (req: any, res) => {
    try {
      const matches = await storage.getInvestorMatches(req.params.id);
      
      // Get investor details for each match
      const matchesWithInvestors = await Promise.all(
        matches.map(async (match) => {
          const investor = await storage.getUser(match.investorId);
          return { ...match, investor };
        })
      );

      res.json(matchesWithInvestors);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Message routes
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipientId, startupId, content } = req.body;

      const message = await storage.createMessage({
        senderId: userId,
        recipientId,
        startupId,
        content,
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getMessages(userId);

      // Get user details for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (msg) => {
          const sender = await storage.getUser(msg.senderId);
          const recipient = await storage.getUser(msg.recipientId);
          return { ...msg, sender, recipient };
        })
      );

      res.json(messagesWithUsers);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/conversation/:recipientId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipientId } = req.params;
      const { startupId } = req.query;

      const messages = await storage.getConversation(
        userId,
        recipientId,
        startupId as string | undefined
      );

      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      await storage.markMessageAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Saved startups routes
  app.post("/api/saved-startups/:startupId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startupId } = req.params;

      const saved = await storage.saveStartup(userId, startupId);
      res.json(saved);
    } catch (error) {
      console.error("Error saving startup:", error);
      res.status(500).json({ message: "Failed to save startup" });
    }
  });

  app.delete("/api/saved-startups/:startupId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startupId } = req.params;

      await storage.unsaveStartup(userId, startupId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving startup:", error);
      res.status(500).json({ message: "Failed to unsave startup" });
    }
  });

  app.get("/api/saved-startups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedStartups = await storage.getSavedStartups(userId);

      // Get startup details for each saved item
      const startupsWithDetails = await Promise.all(
        savedStartups.map(async (saved) => {
          const startup = await storage.getStartup(saved.startupId);
          return { ...saved, startup };
        })
      );

      res.json(startupsWithDetails);
    } catch (error) {
      console.error("Error fetching saved startups:", error);
      res.status(500).json({ message: "Failed to fetch saved startups" });
    }
  });

  app.get("/api/saved-startups/:startupId/check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startupId } = req.params;

      const isSaved = await storage.isStartupSaved(userId, startupId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Error checking saved status:", error);
      res.status(500).json({ message: "Failed to check saved status" });
    }
  });

  // Get user by ID (for messaging)
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is admin
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const allUsers = await storage.getAllUsers();
      const allStartups = await storage.getAllStartups();
      const messageCount = await storage.getMessageCount();

      const stats = {
        totalUsers: allUsers.length,
        totalFounders: allUsers.filter(u => u.role === "founder").length,
        totalInvestors: allUsers.filter(u => u.role === "investor").length,
        totalStartups: allStartups.length,
        totalMessages: messageCount,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/startups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const allStartups = await storage.getAllStartups();
      res.json(allStartups);
    } catch (error) {
      console.error("Error fetching admin startups:", error);
      res.status(500).json({ message: "Failed to fetch startups" });
    }
  });

  app.delete("/api/admin/users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const targetUser = await storage.getUser(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete user's startups first
      const userStartups = await storage.getStartupsByFounder(req.params.userId);
      for (const startup of userStartups) {
        await storage.deleteStartup(startup.id);
      }

      // Delete user via upsert with null role (soft delete approach)
      await storage.upsertUser({
        ...targetUser,
        email: `deleted-${targetUser.id}@deleted.local`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete("/api/admin/startups/:startupId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const startup = await storage.getStartup(req.params.startupId);
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      await storage.deleteStartup(req.params.startupId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting admin startup:", error);
      res.status(500).json({ message: "Failed to delete startup" });
    }
  });
}
