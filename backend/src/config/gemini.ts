/**
 * Gemini AI Configuration
 * Handles AI service integration with Google Gemini API
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { env } from './env.js';

/**
 * Gemini AI client instance
 */
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Gemini model instance
 */
let geminiModel: GenerativeModel | null = null;

/**
 * Initialize Gemini AI client
 */
export function initializeGemini(): GoogleGenerativeAI {
  try {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required but not provided');
    }

    if (geminiClient) {
      return geminiClient;
    }

    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    
    // Get the generative model
    geminiModel = geminiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: getGenerationConfig(),
    });

    console.log('🤖 Gemini AI initialized successfully');
    console.log(`  - Model: gemini-1.5-flash`);
    console.log(`  - API Key: ${env.GEMINI_API_KEY.substring(0, 10)}...`);

    return geminiClient;
  } catch (error) {
    console.error('❌ Gemini initialization failed:', error);
    throw new Error('Failed to initialize Gemini AI');
  }
}

/**
 * Get Gemini generation configuration
 */
function getGenerationConfig(): GenerationConfig {
  return {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
    responseMimeType: 'application/json',
  };
}

/**
 * Get Gemini model instance
 */
export function getGeminiModel(): GenerativeModel {
  if (!geminiModel) {
    throw new Error('Gemini model not initialized. Call initializeGemini() first.');
  }
  return geminiModel;
}

/**
 * Get Gemini client instance
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    throw new Error('Gemini client not initialized. Call initializeGemini() first.');
  }
  return geminiClient;
}

/**
 * AI Service Interface
 */
export interface AIService {
  analyzeMood(text: string, language: string): Promise<MoodAnalysis>;
  getRecommendations(userId: string, mood: string, context?: any): Promise<Recommendations>;
  chat(userId: string, message: string, conversationHistory?: ChatMessage[]): Promise<ChatResponse>;
  generateWeeklyInsights(userId: string, userData: any): Promise<WeeklyReport>;
}

/**
 * Mood Analysis Result
 */
export interface MoodAnalysis {
  mood: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  sentiment_score: number; // -1 to 1
  emotions: string[];
  confidence: number; // 0 to 1
  suggestions: string[];
  recommended_activities: string[];
}

/**
 * Recommendations Result
 */
export interface Recommendations {
  meditation_sessions: string[];
  workout_routines: string[];
  wellness_tips: string[];
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

/**
 * Chat Message
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Chat Response
 */
export interface ChatResponse {
  message: string;
  suggestions: string[];
  follow_up_questions: string[];
  mood_detected?: string;
  action_items?: string[];
}

/**
 * Weekly Report
 */
export interface WeeklyReport {
  summary: string;
  achievements: string[];
  insights: string[];
  recommendations: string[];
  mood_trend: 'improving' | 'stable' | 'declining';
  next_week_focus: string[];
}

/**
 * Gemini AI Service Implementation
 */
export class GeminiAIService implements AIService {
  private model: GenerativeModel;

  constructor() {
    this.model = getGeminiModel();
  }

  /**
   * Analyze mood from text input
   */
  async analyzeMood(text: string, language: string = 'en'): Promise<MoodAnalysis> {
    try {
      const prompt = `
        Analyze the mood and emotional state from the following text in ${language}:
        
        "${text}"
        
        Provide a comprehensive mood analysis in JSON format with the following structure:
        {
          "mood": "very_negative|negative|neutral|positive|very_positive",
          "sentiment_score": -1.0 to 1.0,
          "emotions": ["emotion1", "emotion2", "emotion3"],
          "confidence": 0.0 to 1.0,
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
          "recommended_activities": ["activity1", "activity2", "activity3"]
        }
        
        Consider context for wellness and meditation practices. Be empathetic and supportive.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Mood analysis failed:', error);
      throw new Error('Failed to analyze mood');
    }
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string, mood: string, context?: any): Promise<Recommendations> {
    try {
      const prompt = `
        Based on the user's current mood: ${mood}
        User context: ${JSON.stringify(context || {})}
        
        Provide personalized wellness recommendations in JSON format:
        {
          "meditation_sessions": ["session1", "session2", "session3"],
          "workout_routines": ["routine1", "routine2", "routine3"],
          "wellness_tips": ["tip1", "tip2", "tip3"],
          "priority": "high|medium|low",
          "reasoning": "explanation for recommendations"
        }
        
        Focus on evidence-based wellness practices that match the user's emotional state.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  /**
   * Chat with AI wellness coach
   */
  async chat(userId: string, message: string, conversationHistory?: ChatMessage[]): Promise<ChatResponse> {
    try {
      const historyContext = conversationHistory?.slice(-5).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n') || '';

      const prompt = `
        You are a compassionate AI wellness coach for PranVeda. 
        Previous conversation context:
        ${historyContext}
        
        User message: "${message}"
        
        Respond as a supportive wellness coach in JSON format:
        {
          "message": "your response",
          "suggestions": ["suggestion1", "suggestion2"],
          "follow_up_questions": ["question1", "question2"],
          "mood_detected": "detected mood if any",
          "action_items": ["action1", "action2"]
        }
        
        Be empathetic, encouraging, and provide practical wellness advice.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Chat generation failed:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  /**
   * Generate weekly insights report
   */
  async generateWeeklyInsights(userId: string, userData: any): Promise<WeeklyReport> {
    try {
      const prompt = `
        Analyze the user's weekly wellness data and generate insights:
        
        User Data: ${JSON.stringify(userData)}
        
        Create a comprehensive weekly report in JSON format:
        {
          "summary": "overall weekly summary",
          "achievements": ["achievement1", "achievement2"],
          "insights": ["insight1", "insight2"],
          "recommendations": ["recommendation1", "recommendation2"],
          "mood_trend": "improving|stable|declining",
          "next_week_focus": ["focus1", "focus2"]
        }
        
        Be encouraging and highlight positive progress while providing constructive guidance.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Weekly insights generation failed:', error);
      throw new Error('Failed to generate weekly insights');
    }
  }
}

/**
 * Get AI service instance
 */
export function getAIService(): AIService {
  if (!env.GEMINI_API_KEY) {
    throw new Error('AI service not available - no API key configured');
  }
  
  if (!geminiModel) {
    initializeGemini();
  }
  
  return new GeminiAIService();
}

/**
 * Check if AI service is available
 */
export function isAIServiceAvailable(): boolean {
  return !!env.GEMINI_API_KEY;
}

// Initialize Gemini on module load if API key is available
if (env.GEMINI_API_KEY && !geminiClient) {
  try {
    initializeGemini();
  } catch (error) {
    console.warn('⚠️  Gemini AI initialization skipped:', error.message);
  }
}

