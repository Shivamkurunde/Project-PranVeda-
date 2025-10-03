import React, { useState, useEffect } from 'react';
import { AudioButton } from '@/components/common/AudioButton';
import { useCelebration } from '@/hooks/useCelebration';
import { useAudio } from '@/hooks/useAudio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Zap, 
  Dumbbell,
  Heart,
  Target,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutSession {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Strength' | 'Cardio' | 'Yoga' | 'HIIT' | 'Flexibility';
  description: string;
  exercises: number;
  calories: number;
  equipment: string[];
  videoId: string;
  rating: number;
  participants: number;
  tags: string[];
}

const Workout: React.FC = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [filter, setFilter] = useState<string>('All');
  
  const { celebrations } = useCelebration();
  const { playPauseSound, playResumeSound } = useAudio();

  const workouts: WorkoutSession[] = [
    {
      id: '1',
      title: 'High Energy Morning Workout',
      instructor: 'Coach Alex',
      duration: 20,
      difficulty: 'Intermediate',
      category: 'HIIT',
      description: 'Kickstart your day with this energizing full-body HIIT workout',
      exercises: 8,
      calories: 180,
      equipment: ['None'],
      videoId: 'dQw4w9WgXcQ',
      rating: 4.8,
      participants: 25400,
      tags: ['Morning', 'Energy', 'Full Body']
    },
    {
      id: '2',
      title: 'Strength Building Circuit',
      instructor: 'Maya Fitness',
      duration: 30,
      difficulty: 'Advanced',
      category: 'Strength',
      description: 'Build lean muscle with this challenging strength training circuit',
      exercises: 10,
      calories: 250,
      equipment: ['Dumbbells', 'Resistance Band'],
      videoId: 'dQw4w9WgXcQ',
      rating: 4.9,
      participants: 18900,
      tags: ['Strength', 'Muscle', 'Equipment']
    },
    {
      id: '3',
      title: 'Gentle Yoga Flow',
      instructor: 'Zen Master Lisa',
      duration: 25,
      difficulty: 'Beginner',
      category: 'Yoga',
      description: 'Improve flexibility and find balance with this peaceful yoga sequence',
      exercises: 12,
      calories: 120,
      equipment: ['Yoga Mat'],
      videoId: 'dQw4w9WgXcQ',
      rating: 4.7,
      participants: 32100,
      tags: ['Yoga', 'Flexibility', 'Calm']
    },
    {
      id: '4',
      title: 'Cardio Blast',
      instructor: 'Trainer Mike',
      duration: 15,
      difficulty: 'Intermediate',
      category: 'Cardio',
      description: 'Get your heart pumping with this intense cardio session',
      exercises: 6,
      calories: 160,
      equipment: ['None'],
      videoId: 'dQw4w9WgXcQ',
      rating: 4.6,
      participants: 21500,
      tags: ['Cardio', 'Heart Rate', 'Intense']
    }
  ];

  const categories = ['All', 'Strength', 'Cardio', 'Yoga', 'HIIT', 'Flexibility'];

  const filteredWorkouts = filter === 'All' 
    ? workouts 
    : workouts.filter(workout => workout.category === filter);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && selectedWorkout) {
      interval = setInterval(() => {
        setCurrentTime(time => {
          if (time >= selectedWorkout.duration * 60) {
            setIsActive(false);
            handleWorkoutComplete();
            return 0;
          }
          return time + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, selectedWorkout]);

  const handleWorkoutStart = (workout: WorkoutSession) => {
    setSelectedWorkout(workout);
    setCurrentTime(0);
    setCurrentExercise(0);
    setIsActive(true);
  };

  const handleWorkoutComplete = () => {
    celebrations.sessionComplete('Workout');
    setIsActive(false);
    setSelectedWorkout(null);
    setCurrentTime(0);
    setCurrentExercise(0);
  };

  const handlePauseResume = () => {
    if (isActive) {
      playPauseSound();
    } else {
      playResumeSound();
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setCurrentExercise(0);
    setIsActive(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Strength': Dumbbell,
      'Cardio': Heart,
      'Yoga': Target,
      'HIIT': Zap,
      'Flexibility': TrendingUp
    };
    return icons[category as keyof typeof icons] || Dumbbell;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Strength': 'from-red-500 to-red-600',
      'Cardio': 'from-pink-500 to-red-500',
      'Yoga': 'from-purple-500 to-pink-500',
      'HIIT': 'from-orange-500 to-red-500',
      'Flexibility': 'from-green-500 to-blue-500'
    };
    return colors[category as keyof typeof colors] || 'from-primary to-primary-glow';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Beginner': 'text-green-500',
      'Intermediate': 'text-yellow-500',
      'Advanced': 'text-red-500'
    };
    return colors[difficulty as keyof typeof colors] || 'text-muted-foreground';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins text-gradient-primary mb-4">
            Workout Sessions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your body with AI-guided workouts that celebrate your progress
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

        {/* Workout Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredWorkouts.map((workout) => {
            const CategoryIcon = getCategoryIcon(workout.category);
            
            return (
              <div 
                key={workout.id}
                className="bg-card rounded-2xl overflow-hidden border border-border card-hover group"
              >
                {/* Workout Thumbnail */}
                <div className={cn(
                  'h-48 bg-gradient-to-r p-6 flex items-center justify-center relative',
                  getCategoryColor(workout.category)
                )}>
                  <div className="text-6xl opacity-80">💪</div>
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white">
                    {workout.duration} min
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white">
                    {workout.calories} cal
                  </div>
                  <div className={cn(
                    'absolute top-4 left-4 px-2 py-1 rounded-lg text-xs font-semibold',
                    getDifficultyColor(workout.difficulty),
                    'bg-black/20 backdrop-blur-sm text-white'
                  )}>
                    {workout.difficulty}
                  </div>
                </div>

                {/* Workout Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold font-poppins line-clamp-2 flex-1">
                      {workout.title}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground ml-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{workout.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {workout.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{workout.exercises} exercises</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{workout.participants.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {workout.equipment.slice(0, 2).map((equipment) => (
                      <span 
                        key={equipment}
                        className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                      >
                        {equipment}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {workout.instructor}
                    </span>
                    <AudioButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleWorkoutStart(workout)}
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

        {/* Workout Timer */}
        {selectedWorkout && (
          <div className="fixed bottom-24 md:bottom-8 left-4 right-4 bg-card border border-border rounded-2xl shadow-2xl z-30">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-gradient-primary">{selectedWorkout.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Exercise {currentExercise + 1} of {selectedWorkout.exercises}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient-primary">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    / {selectedWorkout.duration}:00
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3 mb-4">
                <div 
                  className="h-3 rounded-full bg-gradient-to-r from-secondary to-secondary/80 transition-all duration-1000"
                  style={{ width: `${(currentTime / (selectedWorkout.duration * 60)) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <AudioButton
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4" />
                </AudioButton>
                <AudioButton
                  variant={isActive ? 'peach' : 'primary'}
                  size="md"
                  onClick={handlePauseResume}
                  soundType={isActive ? 'pause' : 'resume'}
                >
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isActive ? 'Pause' : 'Resume'}
                </AudioButton>
                <AudioButton
                  variant="success"
                  size="sm"
                  onClick={handleWorkoutComplete}
                >
                  Complete
                </AudioButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workout;