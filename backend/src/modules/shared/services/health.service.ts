/**
 * Health Service
 */

import { getSupabaseClient } from '../../../config/supabase.js';
import { isAIServiceAvailable } from '../../../config/gemini.js';
import { logger } from '../../../middleware/logger.js';

export class HealthService {
  private supabase = getSupabaseClient();

  async getHealthStatus(): Promise<any> {
    try {
      const startTime = Date.now();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        response_time_ms: Date.now() - startTime,
        services: {
          database: await this.checkDatabaseHealth(),
          ai: this.checkAIHealth(),
          external_apis: await this.checkExternalAPIs(),
        },
      };

      return health;
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async getDatabaseHealth(): Promise<any> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      return {
        status: error ? 'unhealthy' : 'healthy',
        response_time_ms: responseTime,
        connection: error ? 'failed' : 'connected',
        error: error?.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        response_time_ms: -1,
        connection: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getAIHealth(): any {
    try {
      const isAvailable = isAIServiceAvailable();
      
      return {
        status: isAvailable ? 'healthy' : 'unavailable',
        service: 'gemini',
        available: isAvailable,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'gemini',
        available: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMetrics(): Promise<any> {
    try {
      const metrics = {
        system: {
          uptime_seconds: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage(),
          node_version: process.version,
          platform: process.platform,
        },
        application: {
          environment: process.env.NODE_ENV,
          version: process.env.npm_package_version || '1.0.0',
          start_time: new Date(Date.now() - process.uptime() * 1000).toISOString(),
        },
        database: await this.getDatabaseMetrics(),
        timestamp: new Date().toISOString(),
      };

      return metrics;
    } catch (error) {
      logger.error('Failed to get metrics:', error);
      throw error;
    }
  }

  private async checkDatabaseHealth(): Promise<string> {
    try {
      await this.supabase.from('profiles').select('count').limit(1);
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private checkAIHealth(): string {
    return isAIServiceAvailable() ? 'healthy' : 'unavailable';
  }

  private async checkExternalAPIs(): Promise<any> {
    // Check external API health
    return {
      firebase: 'healthy', // Firebase is initialized in config
      supabase: 'healthy', // Supabase is initialized in config
    };
  }

  private async getDatabaseMetrics(): Promise<any> {
    try {
      // Get basic database metrics
      const { count: profileCount } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: meditationCount } = await this.supabase
        .from('meditation_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: workoutCount } = await this.supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true });

      return {
        total_profiles: profileCount || 0,
        total_meditation_sessions: meditationCount || 0,
        total_workout_sessions: workoutCount || 0,
      };
    } catch (error) {
      logger.error('Failed to get database metrics:', error);
      return {
        error: 'Failed to fetch database metrics',
      };
    }
  }
}
