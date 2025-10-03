/**
 * AI Service
 */

import { getAIService, isAIServiceAvailable } from '../../../config/gemini.js';
import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { logger } from '../../../middleware/logger.js';
import { APIError } from '../../../middleware/errorHandler.js';

export class AIService {
  private aiService: any;
  private supabase = getSupabaseClient();

  constructor() {
    if (isAIServiceAvailable()) {
      this.aiService = getAIService();
    }
  }

  async analyzeMood(text: string, language: string = 'en'): Promise<any> {
    if (!this.aiService) {
      throw new APIError('AI service not available');
    }

    try {
      const analysis = await this.aiService.analyzeMood(text, language);
      
      // Log the interaction
      await this.logAIInteraction('mood_analysis', text, analysis, {
        sentiment_score: analysis.sentiment_score,
        confidence: analysis.confidence
      });

      return analysis;
    } catch (error) {
      logger.error('Mood analysis failed:', error);
      throw new APIError('Failed to analyze mood');
    }
  }

  async getRecommendations(userId: string, mood: string, context?: any): Promise<any> {
    if (!this.aiService) {
      throw new APIError('AI service not available');
    }

    try {
      const recommendations = await this.aiService.getRecommendations(userId, mood, context);
      
      // Log the interaction
      await this.logAIInteraction('recommendation', null, recommendations, {
        mood,
        context: JSON.stringify(context)
      });

      return recommendations;
    } catch (error) {
      logger.error('Recommendation generation failed:', error);
      throw new APIError('Failed to generate recommendations');
    }
  }

  async chat(userId: string, message: string, conversationId?: string): Promise<any> {
    if (!this.aiService) {
      throw new APIError('AI service not available');
    }

    try {
      const response = await this.aiService.chat(userId, message, conversationId);
      
      // Log the interaction
      await this.logAIInteraction('chat', message, response, {
        conversation_id: conversationId
      });

      return response;
    } catch (error) {
      logger.error('Chat generation failed:', error);
      throw new APIError('Failed to generate chat response');
    }
  }

  async generateWeeklyInsights(userId: string, weekStart?: string): Promise<any> {
    if (!this.aiService) {
      throw new APIError('AI service not available');
    }

    try {
      // Get user data for the week
      const userData = await this.getUserWeeklyData(userId, weekStart);
      
      const insights = await this.aiService.generateWeeklyInsights(userId, userData);
      
      // Log the interaction
      await this.logAIInteraction('weekly_insights', null, insights, {
        week_start: weekStart,
        data_points: Object.keys(userData).length
      });

      return insights;
    } catch (error) {
      logger.error('Weekly insights generation failed:', error);
      throw new APIError('Failed to generate weekly insights');
    }
  }

  async generateReport(userId: string, format: string = 'json'): Promise<any> {
    try {
      const insights = await this.generateWeeklyInsights(userId);
      
      if (format === 'pdf') {
        // Generate PDF report
        const pdfBuffer = await this.generatePDFReport(insights);
        return pdfBuffer;
      }
      
      return insights;
    } catch (error) {
      logger.error('Report generation failed:', error);
      throw new APIError('Failed to generate report');
    }
  }

  async getCapabilities(): Promise<any> {
    return {
      mood_analysis: isAIServiceAvailable(),
      recommendations: isAIServiceAvailable(),
      chat: isAIServiceAvailable(),
      weekly_insights: isAIServiceAvailable(),
      pdf_reports: true,
      languages: ['en', 'es', 'fr', 'de', 'hi'],
      max_text_length: 1000,
      rate_limit: {
        per_hour: 50,
        per_day: 1000
      }
    };
  }

  private async logAIInteraction(
    type: string,
    inputText: string | null,
    response: any,
    metadata: any
  ): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.AI_INTERACTIONS)
        .insert({
          user_id: 'system', // This would be the actual user ID in practice
          interaction_type: type,
          input_text: inputText,
          ai_response: typeof response === 'string' ? response : JSON.stringify(response),
          sentiment_score: metadata.sentiment_score,
          created_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
        });

      if (error) {
        handleSupabaseError(error, 'logAIInteraction');
      }
    } catch (error) {
      logger.error('Failed to log AI interaction:', error);
      // Don't throw error for logging failures
    }
  }

  private async getUserWeeklyData(userId: string, weekStart?: string): Promise<any> {
    try {
      // Get meditation sessions
      const { data: meditationSessions } = await this.supabase
        .from(TABLES.MEDITATION_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get workout sessions
      const { data: workoutSessions } = await this.supabase
        .from(TABLES.WORKOUT_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get mood check-ins
      const { data: moodCheckins } = await this.supabase
        .from(TABLES.MOOD_CHECKINS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      return {
        meditation_sessions: meditationSessions || [],
        workout_sessions: workoutSessions || [],
        mood_checkins: moodCheckins || [],
        week_start: weekStart || new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get user weekly data:', error);
      return {};
    }
  }

  private async generatePDFReport(insights: any): Promise<Buffer> {
    // Mock PDF generation - in production, use a proper PDF library
    const pdfContent = `Weekly Wellness Report\n\n${JSON.stringify(insights, null, 2)}`;
    return Buffer.from(pdfContent, 'utf-8');
  }
}
