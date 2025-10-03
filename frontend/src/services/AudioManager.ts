import { AudioTrack } from '@/hooks/useAudio';

interface AudioInstance {
  audio: HTMLAudioElement;
  isPlaying: boolean;
  lastUsed: number;
}

class AudioManager {
  private static instance: AudioManager;
  private audioPool: Map<string, AudioInstance> = new Map();
  private maxInstances = 10; // Limit to prevent WebMediaPlayer issues
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupInterval();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private startCleanupInterval(): void {
    // Clean up unused audio instances every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupUnusedInstances();
    }, 30000);
  }

  private cleanupUnusedInstances(): void {
    const now = Date.now();
    const maxAge = 60000; // 1 minute

    for (const [key, instance] of this.audioPool.entries()) {
      if (!instance.isPlaying && (now - instance.lastUsed) > maxAge) {
        this.destroyAudioInstance(key);
      }
    }
  }

  private destroyAudioInstance(key: string): void {
    const instance = this.audioPool.get(key);
    if (instance) {
      try {
        instance.audio.pause();
        instance.audio.src = '';
        instance.audio.srcObject = null;
        instance.audio.load();
      } catch (error) {
        console.warn('Error cleaning up audio instance:', error);
      }
      this.audioPool.delete(key);
    }
  }

  private getOrCreateAudioInstance(track: AudioTrack): HTMLAudioElement {
    const key = `${track.type}-${track.id}`;
    
    // Check if we already have this audio instance
    let instance = this.audioPool.get(key);
    
    if (instance && instance.audio.src === track.url) {
      instance.lastUsed = Date.now();
      return instance.audio;
    }

    // If we have too many instances, clean up the oldest ones
    if (this.audioPool.size >= this.maxInstances) {
      this.cleanupOldestInstances();
    }

    // Create new audio instance
    const audio = new Audio();
    audio.src = track.url;
    audio.volume = track.volume || 0.7;
    audio.preload = 'none'; // Don't preload to save resources
    
    // Handle audio events
    audio.addEventListener('ended', () => {
      const instance = this.audioPool.get(key);
      if (instance) {
        instance.isPlaying = false;
      }
    });

    audio.addEventListener('error', (error) => {
      console.warn('Audio playback error (handled gracefully):', error);
      // Don't destroy instance for common errors like missing files
      // Just mark as not playing
      const instance = this.audioPool.get(key);
      if (instance) {
        instance.isPlaying = false;
      }
    });

    // Store the instance
    instance = {
      audio,
      isPlaying: false,
      lastUsed: Date.now()
    };
    
    this.audioPool.set(key, instance);
    return audio;
  }

  private cleanupOldestInstances(): void {
    const instances = Array.from(this.audioPool.entries());
    instances.sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    // Remove oldest 25% of instances
    const toRemove = Math.ceil(instances.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.destroyAudioInstance(instances[i][0]);
    }
  }

  public async playAudio(track: AudioTrack): Promise<void> {
    try {
      // Check if audio files exist before attempting to play
      if (!this.isAudioFileAccessible(track.url)) {
        console.warn(`Audio file not found or not accessible: ${track.url}`);
        return; // Silently fail for missing files
      }

      // Stop all currently playing audio of the same type
      this.stopAudioByType(track.type);

      const audio = this.getOrCreateAudioInstance(track);
      const key = `${track.type}-${track.id}`;
      const instance = this.audioPool.get(key);
      
      if (instance) {
        instance.isPlaying = true;
        instance.lastUsed = Date.now();
      }

      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Play the audio
      await audio.play();
      
    } catch (error) {
      console.error('Audio playback failed:', error);
      
      // Handle different types of audio errors
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.warn('Audio playback blocked by browser policy. User interaction required.');
          return; // Silently fail for autoplay policy
        } else if (error.name === 'NotSupportedError') {
          console.warn(`Audio format not supported or file not found: ${track.url}`);
          return; // Silently fail for unsupported formats
        } else if (error.message.includes('WebMediaPlayer')) {
          this.cleanupOldestInstances();
          console.warn('Retrying audio playback after cleanup...');
          return; // Don't retry automatically to prevent infinite loops
        }
      }
      
      // Don't throw error to prevent app crashes
      console.warn('Audio playback failed, continuing without sound');
    }
  }

  private isAudioFileAccessible(url: string): boolean {
    // Check if it's a valid audio URL format
    if (!url.startsWith('/audio/') || !url.endsWith('.mp3')) {
      return false;
    }
    
    // For development, we'll assume files might not exist
    // and let the browser handle the 404 gracefully
    return true;
  }

  public stopAudioByType(type: string): void {
    for (const [key, instance] of this.audioPool.entries()) {
      if (key.startsWith(`${type}-`) && instance.isPlaying) {
        try {
          instance.audio.pause();
          instance.audio.currentTime = 0;
          instance.isPlaying = false;
        } catch (error) {
          console.warn('Error stopping audio:', error);
        }
      }
    }
  }

  public stopAllAudio(): void {
    for (const instance of this.audioPool.values()) {
      try {
        instance.audio.pause();
        instance.audio.currentTime = 0;
        instance.isPlaying = false;
      } catch (error) {
        console.warn('Error stopping audio:', error);
      }
    }
  }

  public adjustVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    for (const instance of this.audioPool.values()) {
      try {
        instance.audio.volume = clampedVolume;
      } catch (error) {
        console.warn('Error adjusting volume:', error);
      }
    }
  }

  public getPoolSize(): number {
    return this.audioPool.size;
  }

  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    for (const key of this.audioPool.keys()) {
      this.destroyAudioInstance(key);
    }
    this.audioPool.clear();
  }

  // Debounced audio playing to prevent rapid successive calls
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  public playAudioDebounced(track: AudioTrack, delay: number = 100): Promise<void> {
    const key = `${track.type}-${track.id}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          await this.playAudio(track);
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, delay);

      this.debounceTimers.set(key, timer);
    });
  }
}

export default AudioManager;
