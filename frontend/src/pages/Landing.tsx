import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AudioButton } from '@/components/common/AudioButton';
import { useCelebration } from '@/hooks/useCelebration';
import { useAuth } from '@/features/auth';
import { Brain, Dumbbell, Heart, Sparkles, Play, Star, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const Landing: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { celebrations } = useCelebration();
  const { user, loading } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // If user is authenticated, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    setIsVisible(true);
    
    // Welcome celebration after a short delay with proper cleanup
    timeoutRef.current = setTimeout(() => {
      celebrations.milestoneReached('Welcome to PranVeda');
    }, 2000);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [celebrations]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Meditation',
      description: 'Personalized meditation sessions with AI guidance in Hindi, English, and Marathi',
      color: 'from-primary to-primary-glow'
    },
    {
      icon: Dumbbell,
      title: 'Smart Workouts',
      description: 'Adaptive workout routines that celebrate your progress with immersive feedback',
      color: 'from-secondary to-secondary/80'
    },
    {
      icon: Heart,
      title: 'Emotional Wellness',
      description: 'Mood tracking and stress relief with audio-guided celebration effects',
      color: 'from-peach to-accent'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Users', icon: Users },
    { number: '500K+', label: 'Sessions Completed', icon: Play },
    { number: '4.9★', label: 'User Rating', icon: Star },
    { number: '50+', label: 'Achievements', icon: Trophy }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-peach/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className={cn(
          'relative z-10 max-w-4xl mx-auto px-4 text-center transition-all duration-1000',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          {/* Floating Yoga Figure */}
          <div className="mb-8 flex justify-center">
            <div className="relative animate-float">
              <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-6xl shadow-2xl">
                🧘‍♀️
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-accent to-peach rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold font-poppins mb-6">
            <span className="text-gradient-primary">Pran</span>
            <span className="text-gradient-secondary">Veda</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered companion for <span className="text-gradient-primary font-semibold">mindfulness</span>, 
            <span className="text-gradient-secondary font-semibold"> fitness</span>, and 
            <span className="text-gradient-primary font-semibold"> emotional wellness</span> with immersive audio celebrations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth/signup">
              <AudioButton variant="primary" size="lg" celebrationEffect>
                <Play className="w-5 h-5" />
                Start Your Journey
              </AudioButton>
            </Link>
            <Link to="/auth/signin">
              <AudioButton variant="outline" size="lg">
                <Brain className="w-5 h-5" />
                Sign In
              </AudioButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label}
                  className={cn(
                    'bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50 card-hover transition-all duration-500',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gradient-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gradient-primary mb-6">
              Wellness Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of wellness with AI-powered personalization and immersive audio feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="bg-card rounded-2xl p-8 border border-border card-hover group"
                >
                  <div className={cn(
                    'w-16 h-16 rounded-xl bg-gradient-to-r mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300',
                    feature.color
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold font-poppins mb-4 text-gradient-primary">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gradient-primary mb-6">
            Ready to Transform Your Wellness?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users on their journey to better mental and physical health
          </p>
          <Link to="/auth/signup">
            <AudioButton variant="primary" size="lg" celebrationEffect>
              <Sparkles className="w-5 h-5" />
              Begin Your Practice
            </AudioButton>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;