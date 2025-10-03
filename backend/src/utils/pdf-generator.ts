/**
 * PDF Generator Utility
 * Generates PDF reports for user progress and insights
 */

import PDFDocument from 'pdfkit';
import { logger } from '../middleware/logger.js';

export interface ReportData {
  user: {
    display_name: string;
    email: string;
    join_date: string;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  stats: {
    total_sessions: number;
    meditation_sessions: number;
    workout_sessions: number;
    total_minutes: number;
    current_streaks: {
      meditation: number;
      workout: number;
    };
    achievements_count: number;
  };
  insights: {
    summary: string;
    achievements: string[];
    recommendations: string[];
    mood_trend: string;
  };
  charts?: {
    mood_trend: any[];
    activity_distribution: any[];
  };
}

export class PDFGenerator {
  /**
   * Generate weekly wellness report PDF
   */
  async generateWeeklyReport(data: ReportData): Promise<Buffer> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {});

      // Header
      this.addHeader(doc, data);

      // User info section
      this.addUserInfo(doc, data.user);

      // Period info
      this.addPeriodInfo(doc, data.period);

      // Statistics section
      this.addStatistics(doc, data.stats);

      // Insights section
      this.addInsights(doc, data.insights);

      // Footer
      this.addFooter(doc);

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      logger.error('Failed to generate PDF report:', error);
      throw error;
    }
  }

  /**
   * Generate meditation session report
   */
  async generateSessionReport(sessionData: any): Promise<Buffer> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));

      // Header
      doc.fontSize(20)
         .text('Meditation Session Report', 50, 50, { align: 'center' });

      // Session details
      doc.fontSize(12)
         .text(`Session Type: ${sessionData.type}`, 50, 100)
         .text(`Duration: ${sessionData.duration} minutes`, 50, 120)
         .text(`Date: ${sessionData.date}`, 50, 140)
         .text(`Mood Before: ${sessionData.mood_before}/5`, 50, 160)
         .text(`Mood After: ${sessionData.mood_after}/5`, 50, 180);

      if (sessionData.notes) {
        doc.text('Notes:', 50, 220)
           .text(sessionData.notes, 50, 240, { width: 500 });
      }

      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });

        doc.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      logger.error('Failed to generate session PDF:', error);
      throw error;
    }
  }

  /**
   * Add header to PDF
   */
  private addHeader(doc: PDFDocument, data: ReportData): void {
    // Title
    doc.fontSize(24)
       .text('PranVeda Wellness Report', 50, 50, { align: 'center' });

    // Subtitle
    doc.fontSize(16)
       .text(`Weekly Progress Report`, 50, 80, { align: 'center' });

    // Date range
    doc.fontSize(12)
       .text(`${data.period.start_date} - ${data.period.end_date}`, 50, 110, { align: 'center' });

    // Line separator
    doc.moveTo(50, 130)
       .lineTo(550, 130)
       .stroke();
  }

  /**
   * Add user information section
   */
  private addUserInfo(doc: PDFDocument, user: ReportData['user']): void {
    let yPosition = 150;

    doc.fontSize(14)
       .text('User Information', 50, yPosition);

    yPosition += 30;

    doc.fontSize(12)
       .text(`Name: ${user.display_name}`, 50, yPosition);

    yPosition += 20;

    doc.text(`Email: ${user.email}`, 50, yPosition);

    yPosition += 20;

    doc.text(`Member Since: ${user.join_date}`, 50, yPosition);

    yPosition += 30;

    // Line separator
    doc.moveTo(50, yPosition)
       .lineTo(550, yPosition)
       .stroke();
  }

  /**
   * Add period information
   */
  private addPeriodInfo(doc: PDFDocument, period: ReportData['period']): void {
    let yPosition = 280;

    doc.fontSize(14)
       .text('Report Period', 50, yPosition);

    yPosition += 30;

    doc.fontSize(12)
       .text(`Start Date: ${period.start_date}`, 50, yPosition);

    yPosition += 20;

    doc.text(`End Date: ${period.end_date}`, 50, yPosition);

    yPosition += 30;

    // Line separator
    doc.moveTo(50, yPosition)
       .lineTo(550, yPosition)
       .stroke();
  }

  /**
   * Add statistics section
   */
  private addStatistics(doc: PDFDocument, stats: ReportData['stats']): void {
    let yPosition = 370;

    doc.fontSize(14)
       .text('Weekly Statistics', 50, yPosition);

    yPosition += 30;

    doc.fontSize(12);

    // Create two columns
    const leftColumn = 50;
    const rightColumn = 300;

    // Left column
    doc.text(`Total Sessions: ${stats.total_sessions}`, leftColumn, yPosition);
    yPosition += 20;
    doc.text(`Meditation Sessions: ${stats.meditation_sessions}`, leftColumn, yPosition);
    yPosition += 20;
    doc.text(`Workout Sessions: ${stats.workout_sessions}`, leftColumn, yPosition);

    // Right column
    yPosition = 400;
    doc.text(`Total Minutes: ${stats.total_minutes}`, rightColumn, yPosition);
    yPosition += 20;
    doc.text(`Meditation Streak: ${stats.current_streaks.meditation} days`, rightColumn, yPosition);
    yPosition += 20;
    doc.text(`Workout Streak: ${stats.current_streaks.workout} days`, rightColumn, yPosition);
    yPosition += 20;
    doc.text(`Achievements: ${stats.achievements_count}`, rightColumn, yPosition);

    yPosition += 30;

    // Line separator
    doc.moveTo(50, yPosition)
       .lineTo(550, yPosition)
       .stroke();
  }

  /**
   * Add insights section
   */
  private addInsights(doc: PDFDocument, insights: ReportData['insights']): void {
    let yPosition = 520;

    doc.fontSize(14)
       .text('Weekly Insights', 50, yPosition);

    yPosition += 30;

    doc.fontSize(12);

    // Summary
    doc.text('Summary:', 50, yPosition);
    yPosition += 20;
    doc.text(insights.summary, 50, yPosition, { width: 500 });
    yPosition += 40;

    // Achievements
    if (insights.achievements.length > 0) {
      doc.text('Achievements This Week:', 50, yPosition);
      yPosition += 20;
      
      insights.achievements.forEach((achievement) => {
        doc.text(`• ${achievement}`, 70, yPosition, { width: 480 });
        yPosition += 20;
      });
      yPosition += 10;
    }

    // Recommendations
    if (insights.recommendations.length > 0) {
      doc.text('Recommendations:', 50, yPosition);
      yPosition += 20;
      
      insights.recommendations.forEach((recommendation) => {
        doc.text(`• ${recommendation}`, 70, yPosition, { width: 480 });
        yPosition += 20;
      });
    }
  }

  /**
   * Add footer to PDF
   */
  private addFooter(doc: PDFDocument): void {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 50;

    // Line separator
    doc.moveTo(50, footerY - 20)
       .lineTo(550, footerY - 20)
       .stroke();

    // Footer text
    doc.fontSize(10)
       .text('Generated by PranVeda Zen Flow', 50, footerY, { align: 'center' });

    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, footerY + 15, { align: 'center' });
  }

  /**
   * Generate simple text-based report (fallback)
   */
  async generateTextReport(data: ReportData): Promise<string> {
    try {
      let report = '';
      
      report += 'PRANVEDA WELLNESS REPORT\n';
      report += '========================\n\n';
      
      report += `User: ${data.user.display_name}\n`;
      report += `Email: ${data.user.email}\n`;
      report += `Period: ${data.period.start_date} - ${data.period.end_date}\n\n`;
      
      report += 'STATISTICS\n';
      report += '----------\n';
      report += `Total Sessions: ${data.stats.total_sessions}\n`;
      report += `Meditation Sessions: ${data.stats.meditation_sessions}\n`;
      report += `Workout Sessions: ${data.stats.workout_sessions}\n`;
      report += `Total Minutes: ${data.stats.total_minutes}\n`;
      report += `Meditation Streak: ${data.stats.current_streaks.meditation} days\n`;
      report += `Workout Streak: ${data.stats.current_streaks.workout} days\n`;
      report += `Achievements: ${data.stats.achievements_count}\n\n`;
      
      report += 'INSIGHTS\n';
      report += '--------\n';
      report += `Summary: ${data.insights.summary}\n\n`;
      
      if (data.insights.achievements.length > 0) {
        report += 'Achievements:\n';
        data.insights.achievements.forEach(achievement => {
          report += `- ${achievement}\n`;
        });
        report += '\n';
      }
      
      if (data.insights.recommendations.length > 0) {
        report += 'Recommendations:\n';
        data.insights.recommendations.forEach(recommendation => {
          report += `- ${recommendation}\n`;
        });
      }
      
      return report;
    } catch (error) {
      logger.error('Failed to generate text report:', error);
      throw error;
    }
  }
}
