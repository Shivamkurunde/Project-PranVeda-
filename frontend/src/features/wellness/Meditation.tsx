import React, { useState, useEffect } from 'react';
import { AudioButton } from '@/components/common/AudioButton';
import { useCelebration } from '@/hooks/useCelebration';
import { useAudio } from '@/hooks/useAudio';
import { 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Users, 
  Star,
  Globe,
  Heart,
  Brain,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeditationSession {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  language: 'English' | 'Hindi' | 'Marathi';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Stress Relief' | 'Sleep' | 'Focus' | 'Anxiety' | 'Mindfulness';
  description: string;
  videoId: string;
  audioPreview: string;
  rating: number;
  participants: number;
  tags: string[];
}

const Meditation: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [filter, setFilter] = useState<string>('All');
  
  const { celebrations } = useCelebration();
  const { playAudio, stopAudio, playPauseSound, playResumeSound, playNotificationSound } = useAudio();

  const sessions: MeditationSession[] = [
    {
      id: '1',
      title: 'Morning Mindfulness',
      instructor: 'Dr. Priya Sharma',
      duration: 10,
      language: 'English',
      difficulty: 'Beginner',
      category: 'Mindfulness',
      description: 'Start your day with peaceful awareness and gentle breathing exercises',
      videoId: 'dQw4w9WgXcQ',
      audioPreview: '/audio/morning-preview.mp3',
      rating: 4.8,
      participants: 12500,
      tags: ['Morning', 'Beginner', 'Mindfulness']
    },
    {
      id: '2',
      title: 'तनाव मुक्ति ध्यान',
      instructor: 'Guru Rajesh',
      duration: 15,
      language: 'Hindi',
      difficulty: 'Intermediate',
      category: 'Stress Relief',
      description: 'गहरी श्वास और मन की शांति के लिए विशेष ध्यान तकनीक',
      videoId: 'dQw4w9WgXcQ',
      audioPreview: '/audio/stress-relief-preview.mp3',
      rating: 4.9,
      participants: 8900,
      tags: ['Stress', 'Hindi', 'Breathing']
    },
    {
      id: '3',
      title: 'Deep Sleep Meditation',
      instructor: 'Sarah Johnson',
      duration: 20,
      language: 'English',
      difficulty: 'Beginner',
      category: 'Sleep',
      description: 'Guided meditation to help you fall asleep peacefully and sleep deeply',
      videoId: 'dQw4w9WgXcQ',
      audioPreview: '/audio/sleep-preview.mp3',
      rating: 4.7,
      participants: 15200,
      tags: ['Sleep', 'Relaxation', 'Night']
    },
    {
      id: '4',
      title: 'चिंता मुक्ति साधना',
      instructor: 'आचार्य विनोद',
      duration: 12,
      language: 'Marathi',
      difficulty: 'Intermediate',
      category: 'Anxiety',
      description: 'चिंता आणि अस्वस्थतेपासून मुक्तीसाठी प्राचीन ध्यान पद्धती',
      videoId: 'dQw4w9WgXcQ',
      audioPreview: '/audio/anxiety-relief-preview.mp3',
      rating: 4.8,
      participants: 6700,
      tags: ['Anxiety', 'Marathi', 'Ancient']
    }
  ];

  const categories = ['All', 'Stress Relief', 'Sleep', 'Focus', 'Anxiety', 'Mindfulness'];

  const filteredSessions = filter === 'All' 
    ? sessions 
    : sessions.filter(session => session.category === filter);

  const handleSessionStart = (session: MeditationSession) => {
    setSelectedSession(session);
    setIsPlaying(true);
    playNotificationSound();
    
    // Celebrate session start after duration (simulated)
    // Note: In real app, this would be triggered by actual session completion
    setTimeout(() => {
      celebrations.sessionComplete('Meditation');
    }, session.duration * 1000);
  };

  const handleSessionComplete = () => {
    celebrations.sessionComplete('Meditation');
    setIsPlaying(false);
    setSelectedSession(null);
    setCurrentTime(0);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Stress Relief': Heart,
      'Sleep': Clock,
      'Focus': Brain,
      'Anxiety': Zap,
      'Mindfulness': Star
    };
    return icons[category as keyof typeof icons] || Star;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Stress Relief': 'from-peach to-accent',
      'Sleep': 'from-primary to-primary-glow',
      'Focus': 'from-secondary to-secondary/80',
      'Anxiety': 'from-orange-500 to-red-500',
      'Mindfulness': 'from-purple-500 to-pink-500'
    };
    return colors[category as keyof typeof colors] || 'from-primary to-primary-glow';
  };

  const getLanguageFlag = (language: string) => {
    const flags = {
      'English': '🇺🇸',
      'Hindi': '🇮🇳',
      'Marathi': '🇮🇳'
    };
    return flags[language as keyof typeof flags] || '🌍';
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-gradient-primary mb-4">
            Meditation Sessions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find peace and clarity with AI-guided meditation sessions in multiple languages
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <AudioButton
              key={category}
              variant={filter === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(category)}
            >
              {category}
            </AudioButton>
          ))}
        </div>

        {/* Session Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredSessions.map((session) => {
            const CategoryIcon = getCategoryIcon(session.category);
            
            return (
              <div 
                key={session.id}
                className="bg-card rounded-2xl overflow-hidden border border-border card-hover group"
              >
                {/* Session Thumbnail */}
                <div className={cn(
                  'h-48 bg-gradient-to-r p-6 flex items-center justify-center relative',
                  getCategoryColor(session.category)
                )}>
                  <div className="text-6xl opacity-80">🧘‍♀️</div>
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white">
                    {session.duration} min
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>{getLanguageFlag(session.language)} {session.language}</span>
                  </div>
                </div>

                {/* Session Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold font-poppins line-clamp-2 flex-1">
                      {session.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground ml-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{session.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {session.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{session.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{session.participants.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {session.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {session.instructor}
                    </span>
                    <AudioButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleSessionStart(session)}
                      celebrationEffect
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </AudioButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Session Player */}
        {selectedSession && (
          <div className="fixed bottom-24 md:bottom-8 left-4 right-4 bg-card border border-border rounded-2xl shadow-2xl z-30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-gradient-primary">{selectedSession.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedSession.instructor}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <AudioButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isPlaying) {
                        playPauseSound();
                      } else {
                        playResumeSound();
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    soundType={isPlaying ? 'pause' : 'resume'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </AudioButton>
                  <AudioButton
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Volume control */}}
                  >
                    <Volume2 className="w-4 h-4" />
                  </AudioButton>
                  <AudioButton
                    variant="success"
                    size="sm"
                    onClick={handleSessionComplete}
                  >
                    Complete
                  </AudioButton>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000"
                  style={{ width: `${(currentTime / (selectedSession.duration * 60)) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                <span>{selectedSession.duration}:00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation;