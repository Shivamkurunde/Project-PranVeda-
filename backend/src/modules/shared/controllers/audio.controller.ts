/**
 * Audio Controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/middleware/auth.middleware.js';
import { AudioService } from '../services/audio.service.js';
import { logger, logBusinessEvent } from '../../../middleware/logger.js';
import { APIError } from '../../../middleware/errorHandler.js';

export class AudioController {
  private audioService: AudioService;

  constructor() {
    this.audioService = new AudioService();
  }

  getCelebrations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { event_type } = req.query;

      const celebrations = await this.audioService.getCelebrationAudio(event_type as string);

      res.json({
        success: true,
        data: { celebrations },
      });
    } catch (error) {
      next(error);
    }
  };

  getMeditation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, duration } = req.query;

      const audio = await this.audioService.getMeditationAudio(category as string, duration as string);

      res.json({
        success: true,
        data: { audio },
      });
    } catch (error) {
      next(error);
    }
  };

  getAmbient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, duration } = req.query;

      const audio = await this.audioService.getAmbientAudio(type as string, duration as string);

      res.json({
        success: true,
        data: { audio },
      });
    } catch (error) {
      next(error);
    }
  };

  logFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new APIError('Authentication required', 401);
      }

      const userId = req.user.uid;
      const { audio_type, file_path, feedback_type, duration_seconds, volume_level } = req.body;

      const feedback = await this.audioService.logAudioFeedback(userId, {
        audio_type,
        file_path,
        feedback_type,
        duration_seconds,
        volume_level,
      });

      logBusinessEvent('audio_feedback_logged', userId, {
        audioType: audio_type,
        feedbackType: feedback_type,
        duration: duration_seconds,
      });

      res.json({
        success: true,
        message: 'Audio feedback logged',
        data: { feedback },
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.audioService.getAudioCategories();

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const audioController = new AudioController();
