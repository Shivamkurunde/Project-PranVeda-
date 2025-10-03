import React, { useState, useEffect } from 'react';
import { AudioButton } from '@/components/common/AudioButton';
import { useCelebration } from '@/hooks/useCelebration';
import { 
  Brain, 
  Dumbbell, 
  Heart, 
  Target, 
  TrendingUp, 
  Calendar,
  PlayCircle,
  Award,
  Flame,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStats {
  currentStreak: number;
  totalSessions: number;
  weeklyMinutes: number;
  currentLevel: number;
  experiencePoints: number;
  nextLevelXP: number;
  badges: string[];
  weeklyGoal: number;
  weeklyProgress: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    currentStreak: 7,
    totalSessions: 42,
    weeklyMinutes: 180,
    currentLevel: 3,
    experiencePoints: 750,
    nextLevelXP: 1000,
    badges: ['Early Bird', 'Consistent', 'Mindful Master'],
    weeklyGoal: 120,
    weeklyProgress: 85
  });

  const { celebrations } = useCelebration();

  useEffect(() => {
    // Trigger streak celebration if it's a milestone
    if (stats.currentStreak % 7 === 0 && stats.currentStreak > 0) {
      setTimeout(() => {
        celebrations.streakMilestone(stats.currentStreak);
      }, 1000);
    }
  }, [stats.currentStreak, celebrations]);

  const progressPercentage = (stats.experiencePoints / stats.nextLevelXP) * 100;
  const weeklyProgressPercentage = (stats.weeklyProgress / 100) * 100;

  const quickActions = [
    {
      title: 'Morning Meditation',
      duration: '10 min',
      icon: Brain,
      color: 'from-primary to-primary-glow',
      path: '/meditate',
      description: 'Start your day with mindfulness'
    },
    {
      title: 'Energy Workout',
      duration: '15 min',
      icon: Dumbbell,
      color: 'from-secondary to-secondary/80',
      path: '/workout',
      description: 'Boost your energy levels'
    },
    {
      title: 'Stress Relief',
      duration: '5 min',
      icon: Heart,
      color: 'from-peach to-accent',
      path: '/breathing',
      description: 'Quick stress relief session'
    }
  ];

  const recentAchievements = [
    { title: '7-Day Streak', icon: '🔥', date: 'Today' },
    { title: 'Mindful Master', icon: '🧘‍♀️', date: '2 days ago' },
    { title: 'Early Bird', icon: '🌅', date: '5 days ago' }
  ];

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins text-gradient-primary mb-2">
            Welcome back! 🌟
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your wellness journey?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Streak Card */}
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-primary">{stats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-primary">{stats.totalSessions}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
            </div>
          </div>

          {/* Weekly Minutes */}
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-secondary">{stats.weeklyMinutes}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </div>

          {/* Current Level */}
          <div className="bg-card rounded-xl p-4 md:p-6 border border-border card-hover">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent to-peach rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-primary">Level {stats.currentLevel}</div>
                <div className="text-sm text-muted-foreground">Wellness</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Level Progress */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Level Progress</h3>
              <span className="text-sm text-muted-foreground">
                {stats.experiencePoints} / {stats.nextLevelXP} XP
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-primary to-primary-glow progress-bar progress-glow transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.nextLevelXP - stats.experiencePoints} XP until Level {stats.currentLevel + 1}
            </p>
          </div>

          {/* Weekly Goal */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Goal</h3>
              <span className="text-sm text-muted-foreground">
                {stats.weeklyProgress}% Complete
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-success to-success/80 progress-bar progress-glow transition-all duration-700"
                style={{ width: `${weeklyProgressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Great progress! Keep it up to reach your goal.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-poppins mb-6 text-gradient-primary">
            Quick Start
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.title}
                  className="bg-card rounded-xl p-6 border border-border card-hover group cursor-pointer"
                  onClick={() => celebrations.sessionComplete(action.title)}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-r mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300',
                    action.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{action.duration}</span>
                    <AudioButton variant="outline" size="sm">
                      Start
                    </AudioButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div>
          <h2 className="text-2xl font-bold font-poppins mb-6 text-gradient-primary">
            Recent Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement, index) => (
              <div 
                key={achievement.title}
                className="bg-card rounded-xl p-4 border border-border card-hover"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;