import { urls, visits, type Url, type InsertUrl, type Visit, type InsertVisit, type UrlWithStats, type AnalyticsData, type DeviceStats, type ReferrerStats, type TimeSeriesData } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, isNull, or } from "drizzle-orm";

export interface IStorage {
  // URL operations
  createUrl(url: InsertUrl): Promise<Url>;
  getUrlByShortCode(shortCode: string): Promise<Url | undefined>;
  getAllUrls(): Promise<UrlWithStats[]>;
  getUrlsByTag(tag: string): Promise<UrlWithStats[]>;
  updateUrl(id: number, updates: Partial<Url>): Promise<Url | undefined>;
  deleteUrl(id: number): Promise<boolean>;
  
  // Visit operations
  recordVisit(visit: InsertVisit): Promise<Visit>;
  getAnalytics(urlId: number): Promise<AnalyticsData>;
  getOverallStats(): Promise<{
    totalLinks: number;
    totalClicks: number;
    uniqueVisitors: number;
    avgClickRate: number;
  }>;
  
  // Utility
  isShortCodeAvailable(shortCode: string): Promise<boolean>;
  getRecentActivity(): Promise<Array<{
    type: 'click' | 'create' | 'expire';
    shortCode: string;
    referrer?: string;
    timestamp: Date;
  }>>;
}

export class DatabaseStorage implements IStorage {
  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    const [url] = await db
      .insert(urls)
      .values(insertUrl)
      .returning();
    return url;
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | undefined> {
    const [url] = await db
      .select()
      .from(urls)
      .where(and(
        eq(urls.shortCode, shortCode),
        eq(urls.isActive, true),
        or(isNull(urls.expiresAt), gte(urls.expiresAt, new Date()))
      ));
    return url || undefined;
  }

  async getAllUrls(): Promise<UrlWithStats[]> {
    const urlsWithVisits = await db
      .select({
        id: urls.id,
        originalUrl: urls.originalUrl,
        shortCode: urls.shortCode,
        customCode: urls.customCode,
        tags: urls.tags,
        createdAt: urls.createdAt,
        expiresAt: urls.expiresAt,
        isActive: urls.isActive,
        totalVisits: sql<number>`count(${visits.id})`.as('totalVisits'),
        uniqueVisitors: sql<number>`count(distinct ${visits.ipHash})`.as('uniqueVisitors'),
      })
      .from(urls)
      .leftJoin(visits, eq(urls.id, visits.urlId))
      .where(eq(urls.isActive, true))
      .groupBy(urls.id)
      .orderBy(desc(urls.createdAt));

    // Get recent visits for each URL
    const result: UrlWithStats[] = [];
    for (const url of urlsWithVisits) {
      const recentVisits = await db
        .select()
        .from(visits)
        .where(eq(visits.urlId, url.id))
        .orderBy(desc(visits.timestamp))
        .limit(10);

      result.push({
        ...url,
        totalVisits: Number(url.totalVisits) || 0,
        uniqueVisitors: Number(url.uniqueVisitors) || 0,
        recentVisits,
      });
    }

    return result;
  }

  async getUrlsByTag(tag: string): Promise<UrlWithStats[]> {
    const urlsWithTag = await db
      .select()
      .from(urls)
      .where(and(
        sql`${tag} = ANY(${urls.tags})`,
        eq(urls.isActive, true)
      ));

    const result: UrlWithStats[] = [];
    for (const url of urlsWithTag) {
      const visitsData = await db
        .select({
          totalVisits: sql<number>`count(*)`.as('totalVisits'),
          uniqueVisitors: sql<number>`count(distinct ${visits.ipHash})`.as('uniqueVisitors'),
        })
        .from(visits)
        .where(eq(visits.urlId, url.id));

      const recentVisits = await db
        .select()
        .from(visits)
        .where(eq(visits.urlId, url.id))
        .orderBy(desc(visits.timestamp))
        .limit(10);

      result.push({
        ...url,
        totalVisits: Number(visitsData[0]?.totalVisits) || 0,
        uniqueVisitors: Number(visitsData[0]?.uniqueVisitors) || 0,
        recentVisits,
      });
    }

    return result;
  }

  async updateUrl(id: number, updates: Partial<Url>): Promise<Url | undefined> {
    const [url] = await db
      .update(urls)
      .set(updates)
      .where(eq(urls.id, id))
      .returning();
    return url || undefined;
  }

  async deleteUrl(id: number): Promise<boolean> {
    const result = await db
      .update(urls)
      .set({ isActive: false })
      .where(eq(urls.id, id));
    return result.rowCount > 0;
  }

  async recordVisit(visit: InsertVisit): Promise<Visit> {
    const [newVisit] = await db
      .insert(visits)
      .values(visit)
      .returning();
    return newVisit;
  }

  async getAnalytics(urlId: number): Promise<AnalyticsData> {
    // Get total visits and unique visitors
    const [visitStats] = await db
      .select({
        totalVisits: sql<number>`count(*)`.as('totalVisits'),
        uniqueVisitors: sql<number>`count(distinct ${visits.ipHash})`.as('uniqueVisitors'),
      })
      .from(visits)
      .where(eq(visits.urlId, urlId));

    // Get device stats
    const deviceStatsRaw = await db
      .select({
        deviceType: visits.deviceType,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(visits)
      .where(eq(visits.urlId, urlId))
      .groupBy(visits.deviceType);

    const deviceStats: DeviceStats = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };

    deviceStatsRaw.forEach(stat => {
      if (stat.deviceType === 'desktop') deviceStats.desktop = Number(stat.count);
      else if (stat.deviceType === 'mobile') deviceStats.mobile = Number(stat.count);
      else if (stat.deviceType === 'tablet') deviceStats.tablet = Number(stat.count);
    });

    // Get top referrers
    const referrerStatsRaw = await db
      .select({
        referrer: visits.referrer,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(visits)
      .where(eq(visits.urlId, urlId))
      .groupBy(visits.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const totalVisits = Number(visitStats?.totalVisits) || 0;
    const topReferrers: ReferrerStats[] = referrerStatsRaw.map(ref => ({
      referrer: ref.referrer || 'Direct',
      count: Number(ref.count),
      percentage: totalVisits > 0 ? Math.round((Number(ref.count) / totalVisits) * 100 * 10) / 10 : 0,
    }));

    // Get time series data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeSeriesRaw = await db
      .select({
        date: sql<string>`date(${visits.timestamp})`.as('date'),
        count: sql<number>`count(*)`.as('count'),
      })
      .from(visits)
      .where(and(
        eq(visits.urlId, urlId),
        gte(visits.timestamp, thirtyDaysAgo)
      ))
      .groupBy(sql`date(${visits.timestamp})`)
      .orderBy(sql`date(${visits.timestamp})`);

    const timeSeriesData: TimeSeriesData[] = timeSeriesRaw.map(ts => ({
      date: ts.date,
      visits: Number(ts.count),
    }));

    return {
      totalVisits,
      uniqueVisitors: Number(visitStats?.uniqueVisitors) || 0,
      deviceStats,
      topReferrers,
      timeSeriesData,
    };
  }

  async getOverallStats(): Promise<{
    totalLinks: number;
    totalClicks: number;
    uniqueVisitors: number;
    avgClickRate: number;
  }> {
    const [linkStats] = await db
      .select({
        totalLinks: sql<number>`count(*)`.as('totalLinks'),
      })
      .from(urls)
      .where(eq(urls.isActive, true));

    const [visitStats] = await db
      .select({
        totalClicks: sql<number>`count(*)`.as('totalClicks'),
        uniqueVisitors: sql<number>`count(distinct ${visits.ipHash})`.as('uniqueVisitors'),
      })
      .from(visits);

    const totalLinks = Number(linkStats?.totalLinks) || 0;
    const totalClicks = Number(visitStats?.totalClicks) || 0;
    const uniqueVisitors = Number(visitStats?.uniqueVisitors) || 0;

    return {
      totalLinks,
      totalClicks,
      uniqueVisitors,
      avgClickRate: totalLinks > 0 ? Math.round((totalClicks / totalLinks) * 10) / 10 : 0,
    };
  }

  async isShortCodeAvailable(shortCode: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(urls)
      .where(eq(urls.shortCode, shortCode))
      .limit(1);
    return !existing;
  }

  async getRecentActivity(): Promise<Array<{
    type: 'click' | 'create' | 'expire';
    shortCode: string;
    referrer?: string;
    timestamp: Date;
  }>> {
    // Get recent clicks
    const recentClicks = await db
      .select({
        type: sql<'click'>`'click'`.as('type'),
        shortCode: urls.shortCode,
        referrer: visits.referrer,
        timestamp: visits.timestamp,
      })
      .from(visits)
      .innerJoin(urls, eq(visits.urlId, urls.id))
      .orderBy(desc(visits.timestamp))
      .limit(10);

    // Get recent creations
    const recentCreations = await db
      .select({
        type: sql<'create'>`'create'`.as('type'),
        shortCode: urls.shortCode,
        referrer: sql<string>`null`.as('referrer'),
        timestamp: urls.createdAt,
      })
      .from(urls)
      .where(eq(urls.isActive, true))
      .orderBy(desc(urls.createdAt))
      .limit(5);

    // Combine and sort
    const combined = [...recentClicks, ...recentCreations]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return combined.map(item => ({
      type: item.type,
      shortCode: item.shortCode,
      referrer: item.referrer || undefined,
      timestamp: new Date(item.timestamp),
    }));
  }
}

export const storage = new DatabaseStorage();
