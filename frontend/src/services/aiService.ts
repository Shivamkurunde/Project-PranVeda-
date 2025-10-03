// AI Service for PranVeda - Mind & Body Hub
// Gemini API integration for personalized wellness coaching
import { apiUrl } from '@/config/env';

export interface MoodData {
  mood: 'happy' | 'sad' | 'anxious' | 'stressed' | 'calm' | 'energetic' | 'tired';
  intensity: number; // 1-10
  description?: string;
  timestamp: Date;
}

export interface SessionRecommendation {
  id: string;
  type: 'meditation' | 'workout' | 'breathing' | 'mindfulness';
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'english' | 'hindi' | 'marathi';
  audioPreview?: string;
  tags: string[];
  moodMatch: number; // 1-10 how well it matches current mood
}

export interface AIInsight {
  id: string;
  title: string;
  message: string;
  type: 'progress' | 'recommendation' | 'motivation' | 'tip';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionable?: boolean;
  celebrationWorthy?: boolean;
}

export interface UserProgress {
  totalSessions: number;
  streakDays: number;
  favoriteActivities: string[];
  moodTrends: MoodData[];
  weeklyMinutes: number;
  achievements: string[];
  currentLevel: number;
  experiencePoints: number;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async analyzeMood(userInput: string): Promise<MoodData> {
    try {
      const response = await fetch(`${apiUrl}/api/v1/ai/analyze-mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert backend response to frontend format
      return {
        mood: data.sentiment || 'calm',
        intensity: data.intensity || 5,
        description: data.analysis || 'Mood analyzed successfully',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Mood analysis failed:', error);
      // Fallback mood data
      return {
        mood: 'calm',
        intensity: 5,
        description: 'Unable to analyze mood, defaulting to calm',
        timestamp: new Date()
      };
    }
  }

  async getSessionRecommendations(
    mood: MoodData,
    userProgress: UserProgress,
    preferences: { language: string; preferredDuration: number }
  ): Promise<SessionRecommendation[]> {
    const prompt = `
    Based on the user's current mood and progress, recommend 3-5 wellness sessions.
    
    Current mood: ${mood.mood} (intensity: ${mood.intensity}/10)
    User progress: ${userProgress.totalSessions} total sessions, ${userProgress.streakDays} day streak
    Preferred language: ${preferences.language}
    Preferred duration: ${preferences.preferredDuration} minutes
    
    Return JSON array of recommendations with: id, type, title, description, duration, difficulty, language, tags, moodMatch
    
    Focus on sessions that would help improve their current emotional state.
    `;

    try {
      const response = await this.callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return this.getFallbackRecommendations(mood);
    }
  }

  async generateWeeklyInsights(userProgress: UserProgress): Promise<AIInsight[]> {
    const prompt = `
    Generate personalized wellness insights based on user progress:
    
    Total sessions: ${userProgress.totalSessions}
    Current streak: ${userProgress.streakDays} days
    Weekly minutes: ${userProgress.weeklyMinutes}
    Current level: ${userProgress.currentLevel}
    Favorite activities: ${userProgress.favoriteActivities.join(', ')}
    
    Generate 3-5 insights as JSON array with: id, title, message, type, priority, actionable, celebrationWorthy
    
    Include motivational messages, progress celebrations, and actionable tips.
    `;

    try {
      const response = await this.callGemini(prompt);
      const insights = JSON.parse(response);
      return insights.map((insight: any) => ({
        ...insight,
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('Insight generation failed:', error);
      return this.getFallbackInsights();
    }
  }

  async chatWithAI(message: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${apiUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.message || "I'm here to support your wellness journey. How can I help you today?";
    } catch (error) {
      console.error('AI chat failed:', error);
      return "I'm here to support your wellness journey. How can I help you today?";
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private getFallbackRecommendations(mood: MoodData): SessionRecommendation[] {
    const recommendations = [
      {
        id: 'mindful-breathing',
        type: 'breathing' as const,
        title: 'Mindful Breathing',
        description: 'Simple breathing exercise to center yourself',
        duration: 5,
        difficulty: 'beginner' as const,
        language: 'english' as const,
        tags: ['breathing', 'calm', 'quick'],
        moodMatch: mood.mood === 'anxious' ? 9 : 7
      },
      {
        id: 'gentle-yoga',
        type: 'workout' as const,
        title: 'Gentle Yoga Flow',
        description: 'Relaxing yoga sequence for stress relief',
        duration: 15,
        difficulty: 'beginner' as const,
        language: 'english' as const,
        tags: ['yoga', 'flexibility', 'relaxation'],
        moodMatch: mood.mood === 'stressed' ? 9 : 6
      }
    ];

    return recommendations;
  }

  private getFallbackInsights(): AIInsight[] {
    return [
      {
        id: 'daily-practice',
        title: 'Keep up the great work!',
        message: 'Consistency is key to building lasting wellness habits.',
        type: 'motivation',
        priority: 'medium',
        timestamp: new Date(),
        actionable: true,
        celebrationWorthy: false
      }
    ];
  }
}

export default AIService;