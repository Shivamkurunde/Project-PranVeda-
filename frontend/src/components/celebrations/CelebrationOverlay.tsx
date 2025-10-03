import React from 'react';
import { useCelebration } from '@/hooks/useCelebration';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CelebrationOverlay: React.FC = () => {
  const { celebration, dismissCelebration } = useCelebration();

  if (!celebration.isActive || !celebration.data) {
    return null;
  }

  const { data, particles } = celebration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={cn(
            'absolute w-3 h-3 rounded-full animate-confetti',
            data.visualEffect === 'confetti' && 'animate-confetti',
            data.visualEffect === 'burst' && 'animate-burst'
          )}
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}

      {/* Main celebration card */}
      <div className={cn(
        'relative bg-card border border-border rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl',
        data.visualEffect === 'glow' && 'milestone-glow',
        'animate-burst'
      )}>
        <button
          onClick={dismissCelebration}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          {data.type === 'streak' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-2xl">
              🔥
            </div>
          )}
          {data.type === 'session_complete' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center text-2xl">
              ✅
            </div>
          )}
          {data.type === 'milestone' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-accent to-peach rounded-full flex items-center justify-center text-2xl">
              🏆
            </div>
          )}
          {data.type === 'level_up' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary-glow to-accent rounded-full flex items-center justify-center text-2xl">
              ⭐
            </div>
          )}
          {data.type === 'badge_unlock' && (
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-peach to-accent rounded-full flex items-center justify-center text-2xl">
              🎖️
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold font-poppins text-gradient-primary mb-3">
          {data.title}
        </h2>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {data.message}
        </p>

        {data.value && (
          <div className="text-4xl font-bold text-gradient-secondary mb-4">
            {data.value}
          </div>
        )}

        <div className="pt-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-peach rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};