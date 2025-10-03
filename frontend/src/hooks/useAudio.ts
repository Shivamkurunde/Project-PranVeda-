import { useState, useRef, useCallback, useEffect } from 'react';
import AudioManager from '@/services/AudioManager';

export interface AudioTrack {
  id: string;
  url: string;
  name: string;
  type: 'click' | 'celebration' | 'ambient' | 'guided' | 'notification' | 'pause' | 'resume' | 'navigation' | 'achievement' | 'levelup' | 'badge_unlock' | 'task_complete' | 'meditation_complete';
  volume?: number;
}

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [volume, setVolume] = useState(0.7);
  const audioManager = useRef(AudioManager.getInstance());

  const playAudio = useCallback(async (track: AudioTrack) => {
    try {
      setCurrentTrack(track);
      setIsPlaying(true);
      
      await audioManager.current.playAudio(track);
      
      // Audio will be handled by AudioManager's event listeners
      // Set a timeout to reset state after typical audio duration
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentTrack(null);
      }, 2000); // Most UI sounds are short
      
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  }, []);

  const stopAudio = useCallback(() => {
    audioManager.current.stopAllAudio();
    setIsPlaying(false);
    setCurrentTrack(null);
  }, []);

  const pauseAudio = useCallback(() => {
    audioManager.current.stopAudioByType(currentTrack?.type || '');
    setIsPlaying(false);
  }, [currentTrack?.type]);

  const resumeAudio = useCallback(async () => {
    if (currentTrack) {
      await playAudio(currentTrack);
    }
  }, [currentTrack, playAudio]);

  const adjustVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    audioManager.current.adjustVolume(clampedVolume);
  }, []);

  // Enhanced audio feedback for different interactions
  const playClickSound = useCallback(() => {
    const clickAudio: AudioTrack = {
      id: 'btn-click',
      url: '/audio/ui-click.mp3',
      name: 'Button Click',
      type: 'click',
      volume: 0.3
    };
    audioManager.current.playAudioDebounced(clickAudio, 50);
  }, []);

  const playNavigationSound = useCallback(() => {
    const navAudio: AudioTrack = {
      id: 'nav-sound',
      url: '/audio/navigation.mp3',
      name: 'Navigation',
      type: 'navigation',
      volume: 0.4
    };
    audioManager.current.playAudioDebounced(navAudio, 100);
  }, []);

  const playPauseSound = useCallback(() => {
    const pauseAudio: AudioTrack = {
      id: 'pause-sound',
      url: '/audio/pause.mp3',
      name: 'Pause',
      type: 'pause',
      volume: 0.5
    };
    audioManager.current.playAudioDebounced(pauseAudio, 100);
  }, []);

  const playResumeSound = useCallback(() => {
    const resumeAudio: AudioTrack = {
      id: 'resume-sound',
      url: '/audio/resume.mp3',
      name: 'Resume',
      type: 'resume',
      volume: 0.5
    };
    audioManager.current.playAudioDebounced(resumeAudio, 100);
  }, []);

  const playNotificationSound = useCallback(() => {
    const notificationAudio: AudioTrack = {
      id: 'notification',
      url: '/audio/notification.mp3',
      name: 'Notification',
      type: 'notification',
      volume: 0.6
    };
    audioManager.current.playAudioDebounced(notificationAudio, 100);
  }, []);

  const playAchievementSound = useCallback(() => {
    const achievementAudio: AudioTrack = {
      id: 'achievement',
      url: '/audio/achievement.mp3',
      name: 'Achievement',
      type: 'achievement',
      volume: 0.7
    };
    audioManager.current.playAudioDebounced(achievementAudio, 100);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioManager.current.cleanup();
    };
  }, []);

  return {
    isPlaying,
    currentTrack,
    volume,
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    adjustVolume,
    playClickSound,
    playNavigationSound,
    playPauseSound,
    playResumeSound,
    playNotificationSound,
    playAchievementSound
  };
};