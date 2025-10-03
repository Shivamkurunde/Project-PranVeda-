# PranVeda Backend API

A comprehensive backend API for the PranVeda Zen Flow wellness platform, featuring meditation, workout tracking, AI-powered coaching, and gamification.

## 🚀 Features

- **Authentication & User Management** - Firebase Auth integration with Supabase profiles
- **Meditation Sessions** - Track and manage meditation practices
- **Workout Routines** - Exercise tracking and progress monitoring
- **AI Coaching** - Gemini-powered mood analysis and wellness recommendations
- **Progress Analytics** - Detailed insights and streak tracking
- **Gamification** - Badges, achievements, and celebrations
- **Audio Management** - Meditation and celebration audio handling
- **PDF Reports** - Weekly wellness reports generation

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Admin SDK
- **AI Service**: Google Gemini API
- **PDF Generation**: PDFKit
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment validation
│   │   ├── firebase.ts   # Firebase Admin SDK
│   │   ├── supabase.ts   # Supabase client
│   │   ├── gemini.ts     # AI service configuration
│   │   └── cors.ts       # CORS settings
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── logger.ts     # Winston logging
│   │   ├── rateLimiter.ts # Rate limiting
│   │   └── validator.ts  # Request validation
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── meditation.routes.ts
│   │   ├── workout.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── progress.routes.ts
│   │   ├── gamification.routes.ts
│   │   ├── audio.routes.ts
│   │   └── health.routes.ts
│   ├── controllers/      # Route controllers
│   ├── services/         # Business logic
│   ├── utils/           # Utility functions
│   │   ├── streak-calculator.ts
│   │   └── pdf-generator.ts
│   ├── types/           # TypeScript definitions
│   └── index.ts         # Main server file
├── supabase/
│   └── migrations/      # Database migrations
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp backend.env.example backend.env
```

Edit `backend.env` with your actual values:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8082
```

### 3. Database Setup

Run the Supabase migrations to create the required tables:

```bash
# Apply migrations to your Supabase project
# The migration file is located at: supabase/migrations/20250125000001_create_wellness_tables.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Create user profile
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-token` - Verify token

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard data
- `POST /api/users/avatar` - Upload avatar

### Meditation

- `GET /api/meditation/sessions` - List available sessions
- `POST /api/meditation/sessions/:id/start` - Start session
- `POST /api/meditation/sessions/:id/complete` - Complete session
- `GET /api/meditation/history` - Get meditation history

### Workouts

- `GET /api/workout/routines` - List workout routines
- `POST /api/workout/routines/:id/start` - Start workout
- `POST /api/workout/routines/:id/complete` - Complete workout
- `GET /api/workout/history` - Get workout history

### AI Coaching

- `POST /api/ai/mood-analysis` - Analyze mood from text
- `POST /api/ai/recommendation` - Get wellness recommendations
- `POST /api/ai/chat` - Chat with AI coach
- `GET /api/ai/weekly-insights` - Get weekly insights

### Progress & Analytics

- `GET /api/progress/stats` - Get overall statistics
- `GET /api/progress/streaks` - Get current streaks
- `GET /api/progress/analytics` - Get detailed analytics
- `POST /api/progress/mood-checkin` - Daily mood check-in

### Gamification

- `GET /api/gamification/badges` - Get user badges
- `GET /api/gamification/levels` - Get user level
- `POST /api/gamification/milestone` - Trigger milestone
- `GET /api/gamification/leaderboard` - Get leaderboard

### Health & Monitoring

- `GET /api/health` - Server health status
- `GET /api/health/db` - Database health
- `GET /api/health/ai` - AI service health

## 🔐 Security Features

- **Firebase Authentication** - Secure token-based auth
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Zod schema validation
- **CORS Protection** - Configured for frontend origin
- **Helmet Security** - Security headers
- **Row Level Security** - Supabase RLS policies

## 📊 Database Schema

The database includes tables for:

- `profiles` - User profiles and preferences
- `meditation_sessions` - Meditation session records
- `workout_sessions` - Workout session records
- `user_streaks` - Streak tracking
- `user_achievements` - Badges and achievements
- `ai_interactions` - AI service interactions
- `mood_checkins` - Daily mood tracking
- `celebration_events` - Celebration events
- `audio_feedback` - Audio playback feedback
- `user_goals` - User-defined goals
- `user_notifications` - User notifications
- `user_analytics` - Aggregated analytics

## 🤖 AI Integration

The backend integrates with Google Gemini API for:

- **Mood Analysis** - Analyze user text for emotional patterns
- **Recommendations** - Personalized wellness suggestions
- **Chat Coaching** - Conversational AI wellness coach
- **Weekly Insights** - Generate progress reports

## 🎮 Gamification System

Features include:

- **Streak Tracking** - Meditation and workout streaks
- **Badge System** - Achievement badges and rewards
- **Level Progression** - Experience points and levels
- **Celebrations** - Audio and visual celebrations
- **Leaderboards** - Community rankings

## 📈 Analytics & Reporting

- **Progress Tracking** - Session completion and duration
- **Mood Trends** - Emotional wellness over time
- **Streak Analytics** - Consistency patterns
- **PDF Reports** - Weekly wellness summaries

## 🚀 Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Configure production environment variables
3. Set up proper logging and monitoring
4. Configure SSL/TLS certificates
5. Set up database backups

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test files
npm test -- --grep "authentication"
```

## 📝 Logging

The application uses Winston for structured logging:

- **Request Logging** - HTTP requests and responses
- **Error Logging** - Detailed error information
- **Business Events** - User actions and milestones
- **Performance Logging** - Response times and metrics

## 🔍 Monitoring

Health check endpoints provide monitoring:

- `/api/health` - Overall system health
- `/api/health/db` - Database connectivity
- `/api/health/ai` - AI service availability
- `/api/health/metrics` - System metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the health check endpoints
- Check server logs for errors

---

**PranVeda Zen Flow** - Building a healthier, more mindful world through technology 🧘‍♀️💪
