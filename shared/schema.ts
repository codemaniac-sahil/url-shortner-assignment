import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const urls = pgTable("urls", {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  customCode: boolean("custom_code").default(false),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  urlId: integer("url_id").references(() => urls.id).notNull(),
  ipHash: text("ip_hash").notNull(),
  userAgent: text("user_agent"),
  deviceType: text("device_type"), // mobile, desktop, tablet
  referrer: text("referrer"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const urlsRelations = relations(urls, ({ many }) => ({
  visits: many(visits),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  url: one(urls, {
    fields: [visits.urlId],
    references: [urls.id],
  }),
}));

export const insertUrlSchema = createInsertSchema(urls).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  timestamp: true,
});

export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type Url = typeof urls.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visits.$inferSelect;

// Analytics types
export type UrlWithStats = Url & {
  totalVisits: number;
  uniqueVisitors: number;
  recentVisits: Visit[];
};

export type DeviceStats = {
  desktop: number;
  mobile: number;
  tablet: number;
};

export type ReferrerStats = {
  referrer: string;
  count: number;
  percentage: number;
};

export type TimeSeriesData = {
  date: string;
  visits: number;
};

export type AnalyticsData = {
  totalVisits: number;
  uniqueVisitors: number;
  deviceStats: DeviceStats;
  topReferrers: ReferrerStats[];
  timeSeriesData: TimeSeriesData[];
};
