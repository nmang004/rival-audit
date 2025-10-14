import ExcelJS from 'exceljs';
import { SEMRushData } from '@/types';

export interface ExcelGenerationOptions {
  domain: string;
  semrushData: SEMRushData;
  clientName?: string;
  auditDate: Date;
}

/**
 * Get color for keyword position
 */
function getPositionColor(position: number): string {
  if (position <= 3) return 'FF10B981'; // green
  if (position <= 10) return 'FFF59E0B'; // yellow/orange
  return 'FFEF4444'; // red
}

/**
 * Format large numbers with commas
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Generate SEMRush Excel report with formatted keyword and traffic data
 */
export async function generateSEMRushExcel(
  options: ExcelGenerationOptions
): Promise<Buffer> {
  const { domain, semrushData, clientName, auditDate } = options;

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'Sales SEO Audit Tool';
  workbook.created = auditDate;
  workbook.modified = auditDate;

  // ========== SHEET 1: Top Keywords ==========
  const keywordsSheet = workbook.addWorksheet('Top Keywords', {
    properties: {
      defaultRowHeight: 18,
    },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  // Define columns
  keywordsSheet.columns = [
    { header: 'Keyword', key: 'keyword', width: 40 },
    { header: 'Position', key: 'position', width: 12 },
    { header: 'Search Volume', key: 'volume', width: 16 },
    { header: 'Difficulty', key: 'difficulty', width: 12 },
    { header: 'URL', key: 'url', width: 50 },
  ];

  // Style header row
  const keywordsHeaderRow = keywordsSheet.getRow(1);
  keywordsHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  keywordsHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  keywordsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  keywordsHeaderRow.height = 25;

  // Add data rows
  semrushData.keywords
    .sort((a, b) => a.position - b.position) // Sort by position (best first)
    .forEach((keyword, index) => {
      const row = keywordsSheet.addRow({
        keyword: keyword.keyword,
        position: keyword.position,
        volume: keyword.volume,
        difficulty: keyword.difficulty,
        url: keyword.url,
      });

      // Alternating row colors for readability
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }

      // Color-code position cell
      const positionCell = row.getCell('position');
      positionCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: getPositionColor(keyword.position) },
      };
      positionCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      positionCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Format numbers with commas
      const volumeCell = row.getCell('volume');
      volumeCell.numFmt = '#,##0';
      volumeCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const difficultyCell = row.getCell('difficulty');
      difficultyCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Make URL clickable
      const urlCell = row.getCell('url');
      urlCell.value = {
        text: keyword.url,
        hyperlink: keyword.url,
      };
      urlCell.font = { color: { argb: 'FF2563EB' }, underline: true };
      urlCell.alignment = { vertical: 'middle' };

      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

  // Add summary at top
  keywordsSheet.insertRow(1, [
    clientName || domain,
    `Total Keywords: ${semrushData.totalKeywords.toLocaleString()}`,
  ]);
  const summaryRow = keywordsSheet.getRow(1);
  summaryRow.font = { bold: true, size: 14 };
  summaryRow.height = 30;
  summaryRow.alignment = { vertical: 'middle' };

  // ========== SHEET 2: Top Pages ==========
  const pagesSheet = workbook.addWorksheet('Top Pages', {
    properties: {
      defaultRowHeight: 18,
    },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  // Define columns
  pagesSheet.columns = [
    { header: 'URL', key: 'url', width: 50 },
    { header: 'Organic Traffic', key: 'traffic', width: 18 },
    { header: 'Keywords', key: 'keywords', width: 14 },
    { header: 'Avg Position', key: 'position', width: 14 },
  ];

  // Style header row
  const pagesHeaderRow = pagesSheet.getRow(1);
  pagesHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  pagesHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  pagesHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  pagesHeaderRow.height = 25;

  // Add data rows
  semrushData.topPages
    .sort((a, b) => b.traffic - a.traffic) // Sort by traffic (highest first)
    .forEach((page, index) => {
      const row = pagesSheet.addRow({
        url: page.url,
        traffic: page.traffic,
        keywords: page.keywords,
        position: page.position.toFixed(1),
      });

      // Alternating row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }

      // Make URL clickable
      const urlCell = row.getCell('url');
      urlCell.value = {
        text: page.url,
        hyperlink: page.url,
      };
      urlCell.font = { color: { argb: 'FF2563EB' }, underline: true };
      urlCell.alignment = { vertical: 'middle' };

      // Format numbers
      const trafficCell = row.getCell('traffic');
      trafficCell.numFmt = '#,##0';
      trafficCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const keywordsCell = row.getCell('keywords');
      keywordsCell.numFmt = '#,##0';
      keywordsCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const positionCell = row.getCell('position');
      positionCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    });

  // Add summary at top
  pagesSheet.insertRow(1, [
    clientName || domain,
    `Total Organic Traffic: ${semrushData.organicTraffic.toLocaleString()}`,
  ]);
  const pagesSummaryRow = pagesSheet.getRow(1);
  pagesSummaryRow.font = { bold: true, size: 14 };
  pagesSummaryRow.height = 30;
  pagesSummaryRow.alignment = { vertical: 'middle' };

  // ========== SHEET 3: Domain Overview ==========
  const overviewSheet = workbook.addWorksheet('Domain Overview', {
    properties: {
      defaultRowHeight: 22,
    },
  });

  overviewSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 25 },
  ];

  // Style header
  const overviewHeaderRow = overviewSheet.getRow(1);
  overviewHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  overviewHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  overviewHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  overviewHeaderRow.height = 25;

  // Add overview data
  const overviewData = [
    { metric: 'Domain', value: domain },
    { metric: 'Client', value: clientName || 'N/A' },
    { metric: 'Report Date', value: auditDate.toLocaleDateString() },
    { metric: '', value: '' }, // Spacer
    { metric: 'Total Keywords', value: formatNumber(semrushData.totalKeywords) },
    { metric: 'Organic Traffic (Monthly)', value: formatNumber(semrushData.organicTraffic) },
    { metric: 'Paid Traffic (Monthly)', value: formatNumber(semrushData.paidTraffic) },
    { metric: 'Total Backlinks', value: formatNumber(semrushData.backlinks) },
    { metric: '', value: '' }, // Spacer
    { metric: 'Keywords in Top 3', value: semrushData.keywords.filter(k => k.position <= 3).length.toString() },
    { metric: 'Keywords in Top 10', value: semrushData.keywords.filter(k => k.position <= 10).length.toString() },
    { metric: 'Keywords in Top 20', value: semrushData.keywords.filter(k => k.position <= 20).length.toString() },
  ];

  overviewData.forEach((data, index) => {
    if (index === 0) return; // Skip first row (header)

    const row = overviewSheet.addRow(data);

    if (!data.metric) {
      // Spacer row
      row.height = 10;
    } else {
      row.getCell('metric').font = { bold: true };
      row.getCell('value').alignment = { horizontal: 'right' };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    }
  });

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();

  console.log('[Excel] Generated report with', semrushData.keywords.length, 'keywords and', semrushData.topPages.length, 'pages');

  return Buffer.from(buffer);
}
