import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudio, AudioTrack } from './useAudio';

export interface CelebrationData {
  type: 'streak' | 'milestone' | 'session_complete' | 'level_up' | 'badge_unlock';
  value?: number;
  title: string;
  message: string;
  audioTrack?: AudioTrack;
  visualEffect: 'confetti' | 'burst' | 'glow' | 'fireworks';
  duration?: number;
}

export interface CelebrationState {
  isActive: boolean;
  data: CelebrationData | null;
  particles: Array<{ id: string; x: number; y: number; color: string }>;
}

export const useCelebration = () => {
  const [celebration, setCelebration] = useState<CelebrationState>({
    isActive: false,
    data: null,
    particles: []
  });
  const { playAudio, playAchievementSound } = useAudio();
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const triggerCelebration = useCallback(async (data: CelebrationData) => {
    // Clear any existing timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];

    try {
      // Play celebration audio with enhanced sound mapping
      if (data.audioTrack) {
        await playAudio(data.audioTrack);
      } else {
        // Map celebration types to specific audio types
        const audioTypeMap: Record<string, string> = {
          'streak': 'achievement',
          'milestone': 'achievement', 
          'session_complete': 'task_complete',
          'level_up': 'levelup',
          'badge_unlock': 'badge_unlock'
        };

        const audioType = audioTypeMap[data.type] || 'achievement';
        
        // Use achievement sound for most celebrations
        if (audioType === 'achievement') {
          playAchievementSound();
        } else {
          const defaultAudio: AudioTrack = {
            id: `celebration-${data.type}`,
            url: `/audio/${audioType}.mp3`,
            name: `${data.type} celebration`,
            type: audioType as any,
            volume: 0.6
          };
          await playAudio(defaultAudio);
        }
      }

      // Generate particles for visual effect
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: `particle-${i}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        color: getParticleColor(data.type)
      }));

      setCelebration({
        isActive: true,
        data,
        particles
      });

      // Auto-dismiss after duration with proper cleanup
      const duration = data.duration || 3000;
      const timeout1 = setTimeout(() => {
        setCelebration(prev => ({ ...prev, isActive: false }));
      }, duration);
      timeoutRefs.current.push(timeout1);

      // Clear celebration data after animation
      const timeout2 = setTimeout(() => {
        setCelebration({
          isActive: false,
          data: null,
          particles: []
        });
      }, duration + 500);
      timeoutRefs.current.push(timeout2);

    } catch (error) {
      console.error('Celebration trigger failed:', error);
    }
  }, [playAudio, playAchievementSound]);

  const getParticleColor = (type: string): string => {
    const colors = {
      streak: '#667eea',
      milestone: '#f6d55c',
      session_complete: '#20bf6b',
      level_up: '#764ba2',
      badge_unlock: '#ffa07a'
    };
    return colors[type as keyof typeof colors] || '#667eea';
  };

  const dismissCelebration = useCallback(() => {
    // Clear any pending timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
    
    setCelebration({
      isActive: false,
      data: null,
      particles: []
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, []);

  // Pre-defined celebration types
  const celebrations = {
    streakMilestone: (days: number) => triggerCelebration({
      type: 'streak',
      value: days,
      title: `${days} Day Streak!`,
      message: `Amazing! You've maintained your practice for ${days} consecutive days.`,
      visualEffect: 'confetti',
      duration: 4000
    }),

    sessionComplete: (sessionType: string) => triggerCelebration({
      type: 'session_complete',
      title: 'Session Complete!',
      message: `Great job completing your ${sessionType} session.`,
      visualEffect: 'burst',
      duration: 2000
    }),

    milestoneReached: (milestone: string) => triggerCelebration({
      type: 'milestone',
      title: 'Milestone Reached!',
      message: `Congratulations! You've achieved: ${milestone}`,
      visualEffect: 'glow',
      duration: 3000
    }),

    levelUp: (level: number) => triggerCelebration({
      type: 'level_up',
      value: level,
      title: `Level ${level} Unlocked!`,
      message: `You've reached a new level in your wellness journey.`,
      visualEffect: 'fireworks',
      duration: 5000
    }),

    badgeUnlock: (badgeName: string) => triggerCelebration({
      type: 'badge_unlock',
      title: 'New Badge Unlocked!',
      message: `You've earned the "${badgeName}" badge!`,
      visualEffect: 'burst',
      duration: 3000
    })
  };

  return {
    celebration,
    triggerCelebration,
    dismissCelebration,
    celebrations
  };
};