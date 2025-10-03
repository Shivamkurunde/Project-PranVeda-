/**
 * AI Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware.js';
import { AIService } from '../services/ai.service.js';
import { logger, logBusinessEvent } from '../../../middleware/logger.js';
import { APIError, ValidationError } from '../../../middleware/errorHandler.js';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  analyzeMood = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { text, language = 'en' } = req.body;

      if (!text || text.trim().length === 0) {
        throw new ValidationError('Text input is required for mood analysis');
      }

      const analysis = await this.aiService.analyzeMood(text, language);

      logBusinessEvent('mood_analysis_completed', userId, {
        textLength: text.length,
        language,
        sentimentScore: analysis.sentiment_score,
        mood: analysis.mood
      });

      res.json({
        success: true,
        data: { analysis },
      });
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { mood, context } = req.body;

      const recommendations = await this.aiService.getRecommendations(userId, mood, context);

      res.json({
        success: true,
        data: { recommendations },
      });
    } catch (error) {
      next(error);
    }
  };

  chat = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { message, conversation_id } = req.body;

      if (!message || message.trim().length === 0) {
        throw new ValidationError('Message is required for chat');
      }

      const response = await this.aiService.chat(userId, message, conversation_id);

      logBusinessEvent('ai_chat_completed', userId, {
        messageLength: message.length,
        hasConversationId: !!conversation_id,
        responseLength: response.message.length
      });

      res.json({
        success: true,
        data: { response },
      });
    } catch (error) {
      next(error);
    }
  };

  getWeeklyInsights = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { week_start } = req.query;

      const insights = await this.aiService.generateWeeklyInsights(userId, week_start as string);

      res.json({
        success: true,
        data: { insights },
      });
    } catch (error) {
      next(error);
    }
  };

  generateReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { format = 'json' } = req.query;

      const report = await this.aiService.generateReport(userId, format as string);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${userId}.pdf"`);
        res.send(report);
      } else {
        res.json({
          success: true,
          data: { report },
        });
      }
    } catch (error) {
      next(error);
    }
  };

  getAICapabilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const capabilities = await this.aiService.getCapabilities();

      res.json({
        success: true,
        data: { capabilities },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AIController();
