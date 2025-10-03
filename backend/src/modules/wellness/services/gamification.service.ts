/**
 * Gamification Service
 */

import { getSupabaseClient, TABLES, handleSupabaseError, getCurrentTimestamp } from '../../../config/supabase.js';
import { logger } from '../../../middleware/logger.js';

export class GamificationService {
  private supabase = getSupabaseClient();

  async getUserBadges(userId: string): Promise<any[]> {
    try {
      const { data: badges, error } = await this.supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'getUserBadges');
      }

      return badges || [];
    } catch (error) {
      logger.error('Failed to get user badges:', error);
      throw error;
    }
  }

  async getUserLevel(userId: string): Promise<any> {
    try {
      // Calculate level based on total experience points
      const { data: achievements } = await this.supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .select('points_awarded')
        .eq('user_id', userId);

      const totalPoints = achievements?.reduce((sum, a) => sum + (a.points_awarded || 0), 0) || 0;
      const level = Math.floor(totalPoints / 100) + 1;
      const currentLevelPoints = totalPoints % 100;
      const nextLevelPoints = 100 - currentLevelPoints;

      return {
        current_level: level,
        experience_points: totalPoints,
        current_level_points: currentLevelPoints,
        next_level_points: nextLevelPoints,
        progress_percentage: (currentLevelPoints / 100) * 100,
      };
    } catch (error) {
      logger.error('Failed to get user level:', error);
      throw error;
    }
  }

  async triggerMilestone(userId: string, eventType: string, data: any): Promise<any> {
    try {
      const celebrationData = {
        user_id: userId,
        event_type: eventType,
        audio_file: this.getCelebrationAudio(eventType),
        animation_type: this.getCelebrationAnimation(eventType),
        score_increment: this.getScoreIncrement(eventType),
        badge_unlocked: data.badge_unlocked,
        message: this.getCelebrationMessage(eventType, data),
        viewed: false,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { data: celebration, error } = await this.supabase
        .from(TABLES.CELEBRATION_EVENTS)
        .insert(celebrationData)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'triggerMilestone');
      }

      // If badge was unlocked, add to achievements
      if (data.badge_unlocked) {
        await this.unlockBadge(userId, data.badge_unlocked);
      }

      return celebration;
    } catch (error) {
      logger.error('Failed to trigger milestone:', error);
      throw error;
    }
  }

  async getAvailableRewards(userId: string): Promise<any[]> {
    try {
      // Mock rewards - in production, this would come from a rewards system
      const rewards = [
        {
          id: 'reward-1',
          name: 'Meditation Master',
          description: 'Complete 100 meditation sessions',
          points_required: 1000,
          type: 'badge',
          available: true,
        },
        {
          id: 'reward-2',
          name: 'Streak Champion',
          description: 'Maintain a 30-day meditation streak',
          points_required: 500,
          type: 'achievement',
          available: true,
        },
      ];

      return rewards;
    } catch (error) {
      logger.error('Failed to get available rewards:', error);
      throw error;
    }
  }

  async markCelebrationViewed(userId: string, celebrationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(TABLES.CELEBRATION_EVENTS)
        .update({
          viewed: true,
          viewed_at: getCurrentTimestamp(),
          updated_at: getCurrentTimestamp(),
        })
        .eq('id', celebrationId)
        .eq('user_id', userId);

      if (error) {
        handleSupabaseError(error, 'markCelebrationViewed');
      }
    } catch (error) {
      logger.error('Failed to mark celebration as viewed:', error);
      throw error;
    }
  }

  async getLeaderboard(category: string, period: string): Promise<any[]> {
    try {
      // Mock leaderboard data - in production, this would be calculated from user stats
      const leaderboard = [
        {
          rank: 1,
          user_id: 'user-1',
          display_name: 'Meditation Master',
          score: 1250,
          avatar_url: null,
        },
        {
          rank: 2,
          user_id: 'user-2',
          display_name: 'Zen Warrior',
          score: 1100,
          avatar_url: null,
        },
      ];

      return leaderboard;
    } catch (error) {
      logger.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  async getUserRanking(userId: string, category: string): Promise<any> {
    try {
      // Mock ranking data
      const ranking = {
        user_id: userId,
        rank: 15,
        score: 750,
        percentile: 75,
        category,
      };

      return ranking;
    } catch (error) {
      logger.error('Failed to get user ranking:', error);
      throw error;
    }
  }

  private getCelebrationAudio(eventType: string): string {
    const audioMap: Record<string, string> = {
      'meditation_complete': '/audio/meditation-complete.mp3',
      'workout_complete': '/audio/workout-complete.mp3',
      'streak_milestone': '/audio/streak-milestone.mp3',
      'badge_unlock': '/audio/badge-unlock.mp3',
      'level_up': '/audio/level-up.mp3',
    };

    return audioMap[eventType] || '/audio/celebration-default.mp3';
  }

  private getCelebrationAnimation(eventType: string): string {
    const animationMap: Record<string, string> = {
      'meditation_complete': 'floating_hearts',
      'workout_complete': 'confetti',
      'streak_milestone': 'fireworks',
      'badge_unlock': 'badge_sparkle',
      'level_up': 'level_up_effect',
    };

    return animationMap[eventType] || 'celebration_default';
  }

  private getScoreIncrement(eventType: string): number {
    const scoreMap: Record<string, number> = {
      'meditation_complete': 10,
      'workout_complete': 15,
      'streak_milestone': 50,
      'badge_unlock': 100,
      'level_up': 200,
    };

    return scoreMap[eventType] || 10;
  }

  private getCelebrationMessage(eventType: string, data: any): string {
    const messageMap: Record<string, string> = {
      'meditation_complete': 'Great job completing your meditation!',
      'workout_complete': 'Amazing workout! You\'re getting stronger!',
      'streak_milestone': `Incredible ${data.days || 7}-day streak!`,
      'badge_unlock': `Congratulations! You unlocked the ${data.badge_name || 'Achievement'} badge!`,
      'level_up': `Level up! You're now level ${data.level || 2}!`,
    };

    return messageMap[eventType] || 'Congratulations on your achievement!';
  }

  private async unlockBadge(userId: string, badgeType: string): Promise<void> {
    try {
      const badgeData = {
        user_id: userId,
        badge_type: badgeType,
        badge_name: this.getBadgeName(badgeType),
        badge_description: this.getBadgeDescription(badgeType),
        unlocked_at: getCurrentTimestamp(),
        celebration_viewed: false,
        points_awarded: this.getBadgePoints(badgeType),
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      };

      const { error } = await this.supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .insert(badgeData);

      if (error) {
        handleSupabaseError(error, 'unlockBadge');
      }
    } catch (error) {
      logger.error('Failed to unlock badge:', error);
      throw error;
    }
  }

  private getBadgeName(badgeType: string): string {
    const nameMap: Record<string, string> = {
      'first_meditation': 'First Steps',
      'meditation_streak_7': 'Week Warrior',
      'meditation_streak_30': 'Month Master',
      'workout_streak_7': 'Fitness Fighter',
      'workout_streak_30': 'Gym Champion',
    };

    return nameMap[badgeType] || 'Achievement';
  }

  private getBadgeDescription(badgeType: string): string {
    const descMap: Record<string, string> = {
      'first_meditation': 'Complete your first meditation session',
      'meditation_streak_7': 'Maintain a 7-day meditation streak',
      'meditation_streak_30': 'Maintain a 30-day meditation streak',
      'workout_streak_7': 'Maintain a 7-day workout streak',
      'workout_streak_30': 'Maintain a 30-day workout streak',
    };

    return descMap[badgeType] || 'Achievement unlocked!';
  }

  private getBadgePoints(badgeType: string): number {
    const pointsMap: Record<string, number> = {
      'first_meditation': 10,
      'meditation_streak_7': 50,
      'meditation_streak_30': 200,
      'workout_streak_7': 50,
      'workout_streak_30': 200,
    };

    return pointsMap[badgeType] || 10;
  }
}
