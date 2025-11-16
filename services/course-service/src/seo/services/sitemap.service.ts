import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);
  private readonly baseUrl = 'https://yourplatform.com'; // Should come from config

  constructor(private prisma: PrismaService) {}

  /**
   * Generate XML sitemap for all published courses
   */
  async generateCourseSitemap(): Promise<string> {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const urls = courses.map((course) => ({
      loc: `${this.baseUrl}/courses/${course.slug}`,
      lastmod: course.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    return this.generateXMLSitemap(urls);
  }

  /**
   * Generate full sitemap including all pages
   */
  async generateFullSitemap(): Promise<string> {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const urls = [
      // Homepage
      {
        loc: this.baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0',
      },
      // Courses index
      {
        loc: `${this.baseUrl}/courses`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.9',
      },
      // Individual courses
      ...courses.map((course) => ({
        loc: `${this.baseUrl}/courses/${course.slug}`,
        lastmod: course.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      })),
    ];

    return this.generateXMLSitemap(urls);
  }

  /**
   * Generate XML sitemap from URLs
   */
  private generateXMLSitemap(urls: any[]): string {
    const urlEntries = urls
      .map(
        (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }

  /**
   * Submit sitemap to search engines
   */
  async submitToSearchEngines(sitemapUrl: string) {
    const searchEngines = [
      {
        name: 'Google',
        url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      },
      {
        name: 'Bing',
        url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      },
    ];

    const results = [];

    for (const engine of searchEngines) {
      try {
        const response = await fetch(engine.url);
        results.push({
          engine: engine.name,
          status: response.status,
          success: response.ok,
        });
        this.logger.log(`Sitemap submitted to ${engine.name}: ${response.status}`);
      } catch (error) {
        this.logger.error(`Failed to submit to ${engine.name}`, error);
        results.push({
          engine: engine.name,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(sitemapUrl?: string): string {
    const sitemap = sitemapUrl || `${this.baseUrl}/sitemap.xml`;

    return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${sitemap}`;
  }
}
