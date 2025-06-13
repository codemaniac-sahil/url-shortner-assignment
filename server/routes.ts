import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUrlSchema, insertVisitSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Device detection helper
function detectDevice(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') && !ua.includes('tablet')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

// IP hashing helper
function hashIP(ip: string, userAgent: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + userAgent)
    .digest('hex')
    .substring(0, 16);
}

// Short code generation
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create shortened URL
  app.post("/api/shorten", async (req: Request, res: Response) => {
    try {
      const body = insertUrlSchema.extend({
        customCode: z.string().optional(),
        tags: z.string().optional(),
        expiresAt: z.string().optional(),
      }).parse(req.body);

      let shortCode = body.customCode;
      let isCustom = false;

      // Generate or validate short code
      if (shortCode) {
        if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
          return res.status(400).json({ message: "Custom code can only contain letters, numbers, hyphens, and underscores" });
        }
        
        const available = await storage.isShortCodeAvailable(shortCode);
        if (!available) {
          return res.status(409).json({ message: "Custom short code already exists" });
        }
        isCustom = true;
      } else {
        // Generate unique short code
        do {
          shortCode = generateShortCode();
        } while (!(await storage.isShortCodeAvailable(shortCode)));
      }

      // Parse tags
      const tags = body.tags 
        ? body.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      // Parse expiry date
      const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

      const url = await storage.createUrl({
        originalUrl: body.originalUrl,
        shortCode,
        customCode: isCustom,
        tags,
        expiresAt,
      });

      res.json({
        ...url,
        shortUrl: `${req.protocol}://${req.get('host')}/s/${shortCode}`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error('Error creating shortened URL:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Redirect short URL and track visit
  app.get("/s/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const url = await storage.getUrlByShortCode(code);

      if (!url) {
        return res.status(404).json({ message: "Short URL not found" });
      }

      // Check if expired
      if (url.expiresAt && new Date() > url.expiresAt) {
        return res.status(410).json({ message: "Short URL has expired" });
      }

      // Record visit
      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.get('User-Agent') || '';
      const referrer = req.get('Referer') || null;

      await storage.recordVisit({
        urlId: url.id,
        ipHash: hashIP(clientIP, userAgent),
        userAgent,
        deviceType: detectDevice(userAgent),
        referrer,
      });

      // Redirect with 302
      res.redirect(302, url.originalUrl);
    } catch (error) {
      console.error('Error redirecting:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get analytics for specific URL
  app.get("/api/analytics/:code", async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const url = await storage.getUrlByShortCode(code);

      if (!url) {
        return res.status(404).json({ message: "Short URL not found" });
      }

      const analytics = await storage.getAnalytics(url.id);
      
      res.json({
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        tags: url.tags,
        ...analytics,
      });
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all URLs with basic stats
  app.get("/api/urls", async (req: Request, res: Response) => {
    try {
      const urls = await storage.getAllUrls();
      res.json(urls);
    } catch (error) {
      console.error('Error getting URLs:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get URLs by tag
  app.get("/api/tags/:tag", async (req: Request, res: Response) => {
    try {
      const { tag } = req.params;
      const urls = await storage.getUrlsByTag(tag);
      res.json(urls);
    } catch (error) {
      console.error('Error getting URLs by tag:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get overall statistics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getOverallStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recent activity
  app.get("/api/activity", async (req: Request, res: Response) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete URL
  app.delete("/api/urls/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUrl(id);
      
      if (success) {
        res.json({ message: "URL deleted successfully" });
      } else {
        res.status(404).json({ message: "URL not found" });
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
