import { useState, useCallback } from 'react';
import { useAuth } from './useFirebaseAuth';
import { apiUrl } from '@/config/env';

interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
  confidence?: number;
  emotions?: string[];
  intensity?: number;
  recommendations?: string[];
  sentiment?: string;
}

export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getIdToken } = useAuth();

  const analyzeMood = useCallback(async (text: string): Promise<AIResponse | null> => {
    if (!text.trim()) {
      setError('Text is required for mood analysis');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${apiUrl}/api/v1/ai/analyze-mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze mood';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [getIdToken]);

  const chatWithAI = useCallback(async (message: string): Promise<AIResponse | null> => {
    if (!message.trim()) {
      setError('Message is required for AI chat');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const response = await fetch(`${apiUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to chat with AI';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [getIdToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    analyzeMood,
    chatWithAI,
    isLoading,
    error,
    clearError,
  };
};
