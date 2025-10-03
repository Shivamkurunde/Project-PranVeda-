import React from 'react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'peach' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  audioFeedback?: boolean;
  celebrationEffect?: boolean;
  soundType?: 'click' | 'navigation' | 'pause' | 'resume' | 'notification';
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  audioFeedback = true,
  celebrationEffect = false,
  soundType = 'click',
  className,
  onClick,
  ...props
}) => {
  const { 
    playClickSound, 
    playNavigationSound, 
    playPauseSound, 
    playResumeSound, 
    playNotificationSound 
  } = useAudio();

  const playAppropriateSound = () => {
    switch (soundType) {
      case 'navigation':
        playNavigationSound();
        break;
      case 'pause':
        playPauseSound();
        break;
      case 'resume':
        playResumeSound();
        break;
      case 'notification':
        playNotificationSound();
        break;
      case 'click':
      default:
        playClickSound();
        break;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (audioFeedback) {
      playAppropriateSound();
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const variantClasses = {
    primary: 'btn-primary text-primary-foreground font-semibold btn-hover-scale',
    secondary: 'btn-secondary text-secondary-foreground font-semibold btn-hover-scale',
    peach: 'btn-peach text-peach-foreground font-semibold btn-hover-scale',
    success: 'btn-success text-success-foreground font-semibold btn-hover-scale',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground btn-hover-scale'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <Button
      className={cn(
        'rounded-xl shadow-lg transition-all duration-300',
        variantClasses[variant],
        sizeClasses[size],
        celebrationEffect && 'celebration-burst',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};