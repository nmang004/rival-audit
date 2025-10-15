import { Audit, User, Report, AuditStatus, Role } from '@prisma/client';

// Extended types with relations
export type AuditWithRelations = Audit & {
  createdBy: User;
  reportAudits?: {
    report: Report;
  }[];
};

export type ReportWithAudits = Report & {
  createdBy: User;
  reportAudits: {
    audit: Audit;
    order: number;
  }[];
};

// Audit with scores for PDF generation
export interface AuditWithScores {
  id: string;
  url: string;
  clientName: string | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  designScore: number | null;
  claudeAnalysis: string | null;
  screenshotDesktop: string | null;
  screenshotMobile: string | null;
  isHomepage: boolean;
  totalKeywords: number | null;
  createdAt: Date;
  keywordTrendData?: KeywordTrendData[] | null;
  topPages?: TopPage[] | null;
}

// PDF generation result
export interface PDFGenerationResult {
  pdfUrl: string;
  generatedAt: Date;
  fileSize: number;
}

// Shareable link information
export interface ShareableLinkInfo {
  shareableLink: string;
  publicUrl: string;
  createdAt: Date;
}

// PDF generation options
export interface PDFGenerationOptions {
  reportId: string;
  reportName: string;
  reportDescription?: string;
  audits: AuditWithScores[];
  generatedBy: string;
  generatedDate: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Audit execution result
export interface AuditExecutionResult {
  seoScore: number;
  accessibilityScore: number;
  designScore: number;
  claudeAnalysis: string;
  screenshotDesktop: string;
  screenshotMobile: string;
  metaTitle?: string;
  metaDescription?: string;
  h1Tags?: string[];
  coreWebVitals?: {
    lcp: number;
    fid: number;
    cls: number;
  };
  isHomepage: boolean;
  totalKeywords?: number;
  keywordTrendData?: KeywordTrendData[];
  topPages?: TopPage[];
}

// SEMRush types
export interface KeywordTrendData {
  month: string;
  keywords: number;
  traffic?: number;
}

export interface TopPage {
  url: string;
  traffic: number;
  keywords: number;
  position: number;
}

export interface SEMRushData {
  totalKeywords: number;
  organicTraffic: number;
  paidTraffic: number;
  backlinks: number;
  keywords: Keyword[];
  topPages: TopPage[];
}

export interface Keyword {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  url: string;
}

// Puppeteer capture result
export interface CaptureResult {
  desktopScreenshot: Buffer;
  mobileScreenshot: Buffer;
  url: string;
  timestamp: Date;
}

// Accessibility test result
export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  score: number;
  totalTests: number;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
}

// Claude analysis result
export interface ClaudeAnalysisResult {
  designScore: number;
  analysis: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

// Sitemap audit types
export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface ParsedSitemap {
  urls: SitemapUrl[];
  totalUrls: number;
  errors: string[];
}

export interface ContentGap {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedPages: string[];
  reasoning: string;
}

export interface ContentGapAnalysis {
  gaps: ContentGap[];
  summary: string;
  totalGaps: number;
}

export interface UrlStructureIssue {
  type: 'inconsistent_pattern' | 'too_deep' | 'poor_naming' | 'missing_canonical' | 'duplicate_pattern';
  description: string;
  affectedUrls: string[];
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface UrlStructureAnalysis {
  issues: UrlStructureIssue[];
  totalIssues: number;
  patterns: {
    pattern: string;
    count: number;
    example: string;
  }[];
  depthAnalysis: {
    averageDepth: number;
    maxDepth: number;
    urlsByDepth: Record<number, number>;
  };
}

export interface SitemapAuditResult {
  totalUrls: number;
  crawledUrls: number;
  contentGaps: ContentGap[];
  urlStructureIssues: UrlStructureIssue[];
  summary: string;
}

// Export Prisma enums
export { AuditStatus, Role };
