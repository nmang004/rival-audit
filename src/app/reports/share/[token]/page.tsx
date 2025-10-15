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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {report.name}
              </h1>
              {report.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {report.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {report.reportAudits.length} {report.reportAudits.length === 1 ? 'Website' : 'Websites'} Analyzed
                </span>
                <span>
                  Created {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {report.pdfUrl && (
              <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Audits List */}
        <div className="space-y-6">
          {report.reportAudits.map((ra, index) => {
            const audit = ra.audit;
            return (
              <Card key={audit.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {index + 1}. {audit.url}
                      </CardTitle>
                      {audit.clientName && (
                        <CardDescription className="text-blue-100">
                          Client: {audit.clientName}
                        </CardDescription>
                      )}
                    </div>
                    {audit.isHomepage && (
                      <Badge variant="secondary" className="bg-white text-blue-600">
                        Homepage
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Performance Scores */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Performance Scores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {audit.seoScore !== null && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">SEO</span>
                          <Badge className={`${getScoreBadgeColor(audit.seoScore)} text-white text-lg px-3 py-1`}>
                            {audit.seoScore}/100
                          </Badge>
                        </div>
                      )}
                      {audit.accessibilityScore !== null && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Accessibility</span>
                          <Badge className={`${getScoreBadgeColor(audit.accessibilityScore)} text-white text-lg px-3 py-1`}>
                            {audit.accessibilityScore}/100
                          </Badge>
                        </div>
                      )}
                      {audit.designScore !== null && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Design</span>
                          <Badge className={`${getScoreBadgeColor(audit.designScore * 10)} text-white text-lg px-3 py-1`}>
                            {audit.designScore}/10
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Homepage Metrics */}
                  {audit.isHomepage && audit.totalKeywords && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">Total Keywords</span>
                        <span className="text-2xl font-bold text-blue-600">
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
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">AI Analysis</h3>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {audit.claudeAnalysis}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* View Full URL */}
                  <div className="flex justify-end">
                    <a
                      href={audit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
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

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Generated with Sales SEO Audit Tool
          </p>
        </div>
      </div>
    </div>
  );
}
