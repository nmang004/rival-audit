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
export interface SitemapAuditResult {
  totalUrls: number;
  crawledUrls: number;
  errors: string[];
  contentGaps: ContentGap[];
  urlStructureIssues: UrlStructureIssue[];
}

export interface ContentGap {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedPages: string[];
}

export interface UrlStructureIssue {
  type: string;
  description: string;
  affectedUrls: string[];
  recommendation: string;
}

// Export Prisma enums
export { AuditStatus, Role };
