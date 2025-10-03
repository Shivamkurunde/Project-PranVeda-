/**
 * Audio Service
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { logger } from '../../../middleware/logger.js';

export interface AudioFile {
  id: string;
  title: string;
  description: string;
  file_path: string;
  duration_seconds: number;
  category: string;
  tags: string[];
  thumbnail_url?: string;
}

export class AudioService {
  private supabase = getSupabaseClient();

  async getCelebrationAudio(eventType?: string): Promise<AudioFile[]> {
    try {
      // Mock celebration audio data
      const celebrations: AudioFile[] = [
        {
          id: 'celebration-1',
          title: 'Achievement Unlocked',
          description: 'Celebration sound for achievements',
          file_path: '/audio/achievement-unlocked.mp3',
          duration_seconds: 3,
          category: 'celebration',
          tags: ['achievement', 'success'],
        },
        {
          id: 'celebration-2',
          title: 'Level Up',
          description: 'Sound effect for level progression',
          file_path: '/audio/level-up.mp3',
          duration_seconds: 4,
          category: 'celebration',
          tags: ['level', 'progression'],
        },
      ];

      return celebrations.filter(celebration => 
        !eventType || celebration.tags.includes(eventType)
      );
    } catch (error) {
      logger.error('Failed to get celebration audio:', error);
      throw error;
    }
  }

  async getMeditationAudio(category?: string, duration?: string): Promise<AudioFile[]> {
    try {
      // Mock meditation audio data
      const meditations: AudioFile[] = [
        {
          id: 'meditation-1',
          title: 'Guided Breathing',
          description: '5-minute guided breathing meditation',
          file_path: '/audio/guided-breathing-5min.mp3',
          duration_seconds: 300,
          category: 'meditation',
          tags: ['breathing', 'guided', '5min'],
        },
        {
          id: 'meditation-2',
          title: 'Mindfulness Body Scan',
          description: '15-minute body scan meditation',
          file_path: '/audio/body-scan-15min.mp3',
          duration_seconds: 900,
          category: 'meditation',
          tags: ['body-scan', 'mindfulness', '15min'],
        },
      ];

      return meditations.filter(meditation => {
        if (category && meditation.category !== category) return false;
        if (duration && !meditation.tags.includes(duration)) return false;
        return true;
      });
    } catch (error) {
      logger.error('Failed to get meditation audio:', error);
      throw error;
    }
  }

  async getAmbientAudio(type?: string, duration?: string): Promise<AudioFile[]> {
    try {
      // Mock ambient audio data
      const ambient: AudioFile[] = [
        {
          id: 'ambient-1',
          title: 'Rain Sounds',
          description: 'Gentle rain for relaxation',
          file_path: '/audio/rain-ambient.mp3',
          duration_seconds: 1800,
          category: 'ambient',
          tags: ['rain', 'nature', 'relaxing'],
        },
        {
          id: 'ambient-2',
          title: 'Ocean Waves',
          description: 'Calming ocean wave sounds',
          file_path: '/audio/ocean-waves.mp3',
          duration_seconds: 1800,
          category: 'ambient',
          tags: ['ocean', 'waves', 'calming'],
        },
      ];

      return ambient.filter(audio => {
        if (type && !audio.tags.includes(type)) return false;
        return true;
      });
    } catch (error) {
      logger.error('Failed to get ambient audio:', error);
      throw error;
    }
  }

  async logAudioFeedback(userId: string, data: any): Promise<any> {
    try {
      const feedbackData = {
        user_id: userId,
        audio_type: data.audio_type,
        file_path: data.file_path,
        feedback_type: data.feedback_type,
        duration_seconds: data.duration_seconds,
        volume_level: data.volume_level,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { data: feedback, error } = await this.supabase
        .from(TABLES.AUDIO_FEEDBACK)
        .insert(feedbackData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'logAudioFeedback');
      }

      return feedback;
    } catch (error) {
      logger.error('Failed to log audio feedback:', error);
      throw error;
    }
  }

  async getAudioCategories(): Promise<any[]> {
    try {
      return [
        {
          id: 'meditation',
          name: 'Meditation',
          description: 'Guided meditation sessions',
          count: 12,
        },
        {
          id: 'ambient',
          name: 'Ambient Sounds',
          description: 'Background sounds for focus and relaxation',
          count: 8,
        },
        {
          id: 'celebration',
          name: 'Celebrations',
          description: 'Achievement and milestone sounds',
          count: 5,
        },
      ];
    } catch (error) {
      logger.error('Failed to get audio categories:', error);
      throw error;
    }
  }
}
