import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Look up report by shareableLink token
  const report = await prisma.report.findUnique({
    where: { shareableLink: token },
    include: {
      createdBy: true,
      reportAudits: {
        include: {
          audit: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  // If not found, show 404
  if (!report) {
    notFound();
  }

  // Helper function to get score badge color
  const getScoreBadgeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Rival Digital Branded Header */}
        <div className="sage-bg-gradient py-12 px-8 mb-10 rounded-lg shadow-2xl animate-fadeIn">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-6">
              <h1 className="text-5xl lg:text-6xl font-bold mb-3 leading-tight">
                Rival Digital
              </h1>
              <p className="text-lg opacity-75">SEO Audit Report</p>
            </div>

            <div className="my-8 h-px bg-white/20"></div>

            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {report.name}
            </h2>
            {report.description && (
              <p className="text-xl opacity-90 mb-6 leading-relaxed">
                {report.description}
              </p>
            )}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm opacity-90">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {report.reportAudits.length} {report.reportAudits.length === 1 ? 'Website' : 'Websites'} Analyzed
              </span>
              <span>
                Created {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            {report.pdfUrl && (
              <div className="mt-8">
                <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" className="button-scale button-glow">
                    <Download className="w-5 h-5 mr-2" />
                    Download Full Report
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Audits List */}
        <div className="space-y-8 animate-slideUp">
          {report.reportAudits.map((ra, index) => {
            const audit = ra.audit;
            return (
              <Card key={audit.id} className="overflow-hidden card-hover-effect shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <CardTitle className="text-2xl lg:text-3xl">
                          {audit.url}
                        </CardTitle>
                      </div>
                      {audit.clientName && (
                        <CardDescription className="text-white/90 text-base ml-13">
                          Client: {audit.clientName}
                        </CardDescription>
                      )}
                    </div>
                    {audit.isHomepage && (
                      <Badge variant="secondary" className="bg-secondary text-white animate-badge-pop">
                        Homepage
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {/* Performance Scores */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-primary mb-4">Performance Scores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {audit.seoScore !== null && (
                        <div className="text-center p-6 sage-bg-subtle rounded-lg border-2 sage-border">
                          <div className="text-sm font-medium text-muted-foreground mb-2">SEO</div>
                          <div className="text-4xl font-bold text-primary mb-2">
                            {audit.seoScore}
                          </div>
                          <div className="text-xs text-muted-foreground">out of 100</div>
                        </div>
                      )}
                      {audit.accessibilityScore !== null && (
                        <div className="text-center p-6 sage-bg-subtle rounded-lg border-2 sage-border">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Accessibility</div>
                          <div className="text-4xl font-bold text-primary mb-2">
                            {audit.accessibilityScore}
                          </div>
                          <div className="text-xs text-muted-foreground">out of 100</div>
                        </div>
                      )}
                      {audit.designScore !== null && (
                        <div className="text-center p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg border-2 border-secondary/20">
                          <div className="text-sm font-medium text-muted-foreground mb-2">Design</div>
                          <div className="text-4xl font-bold text-secondary mb-2">
                            {audit.designScore}
                          </div>
                          <div className="text-xs text-muted-foreground">out of 10</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Homepage Metrics */}
                  {audit.isHomepage && audit.totalKeywords && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">Total Keywords</span>
                        <span className="text-3xl font-bold gradient-text">
                          {audit.totalKeywords.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Screenshots */}
                  {(audit.screenshotDesktop || audit.screenshotMobile) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Screenshots</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {audit.screenshotDesktop && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Desktop View</p>
                            <div className="border rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={audit.screenshotDesktop}
                                alt="Desktop Screenshot"
                                width={800}
                                height={600}
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        )}
                        {audit.screenshotMobile && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Mobile View</p>
                            <div className="border rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={audit.screenshotMobile}
                                alt="Mobile Screenshot"
                                width={375}
                                height={812}
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {audit.claudeAnalysis && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-primary mb-4">AI Analysis</h3>
                      <div className="sage-bg-subtle border-l-4 border-l-secondary rounded-lg p-6">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                          {audit.claudeAnalysis}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* View Full URL */}
                  <div className="flex justify-end pt-4 border-t">
                    <a
                      href={audit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-secondary flex items-center gap-2 font-medium transition-colors button-scale"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Branded Footer */}
        <div className="mt-12 text-center">
          <div className="sage-bg-gradient rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Powered by Rival Digital</h3>
            <p className="opacity-75">
              Professional SEO audit and website analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
