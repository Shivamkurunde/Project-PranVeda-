# PranVeda Zen Flow

A modern full-stack wellness application with AI-powered coaching, meditation, and workout features. Built with React, TypeScript, and Firebase authentication.

## 🌟 Features

- **🧘‍♀️ Meditation Sessions**: Guided meditation with audio support
- **💪 Workout Tracking**: Exercise routines and progress monitoring
- **🤖 AI Coach**: Personalized wellness coaching powered by AI
- **📊 Analytics**: Comprehensive reports and insights
- **🔐 Secure Authentication**: Firebase Auth with Google OAuth
- **🎵 Audio System**: Enhanced audio feedback and notifications
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Project Structure

```
pranaveda-zen-flow-master/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services and utilities
│   │   └── integrations/  # Firebase & Supabase clients
│   ├── public/audio/      # Audio files for UI feedback
│   └── tests/            # Playwright test suite
├── backend/           # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/       # Firebase & Supabase configuration
│   │   ├── middleware/   # Authentication & security middleware
│   │   ├── routes/       # API route handlers
│   │   └── services/     # Business logic services
│   └── dist/            # Compiled JavaScript output
├── supabase/          # Database migrations and configuration
└── *.md               # Comprehensive documentation files
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pranaveda-zen-flow-master
```

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

### 3. Environment Setup

#### Frontend Environment
Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:5000
```

#### Backend Environment
Create `backend/.env`:
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:8082
PORT=5000
```

### 4. Run the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:8082
- **Backend API**: http://localhost:5000

## 🔧 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** for component library
- **Firebase Auth** for authentication
- **Supabase** for database client
- **Playwright** for end-to-end testing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Firebase Admin SDK** for server-side auth
- **Supabase** for database operations
- **JWT** token validation
- **Rate limiting** and security middleware

### Database & Services
- **Supabase PostgreSQL** for data storage
- **Firebase Authentication** for user management
- **Google OAuth** for social login
- **OpenAI API** for AI coaching features

## 🛡️ Security Features

- ✅ **JWT Token Validation** on all protected routes
- ✅ **HttpOnly Cookies** for secure token storage
- ✅ **Rate Limiting** to prevent abuse
- ✅ **Input Validation** and sanitization
- ✅ **CORS Protection** with proper origins
- ✅ **Security Headers** via Helmet
- ✅ **Row Level Security** in Supabase
- ✅ **Password Reset** with secure tokens
- ✅ **Email Verification** system

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test        # Run unit tests
npm run test:e2e    # Run Playwright tests
```

### Backend Tests
```bash
cd backend
npm test           # Run backend tests
```

## 📚 Documentation

Comprehensive documentation is available in the root directory:

- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Detailed setup guide
- **[Run Project](RUN_PROJECT.md)** - Quick start guide
- **[Security Implementation](SECURITY_IMPLEMENTATION_COMPLETE.md)** - Security features
- **[Migration Complete](MIGRATION_COMPLETE.md)** - Architecture migration notes
- **[Supabase MCP Setup](SUPABASE_MCP_SETUP_COMPLETE.md)** - Database configuration
- **[Working Correctly](WORKING_CORRECTLY.md)** - Verification checklist
- **[Continuous Issues](CONTINUOUS_ISSUES_ERRORS_and_LOOPHOLES.md)** - Issue tracking
- **[Audio Files Needed](AUDIO_FILES_NEEDED.md)** - Audio system requirements

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Vercel/Railway)
```bash
cd backend
npm run build
# Deploy with environment variables
```

### Environment Variables for Production
Set these in your deployment platform:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL` (production URL)
- `NODE_ENV=production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the documentation files in the root directory
2. Review the console for errors
3. Ensure all environment variables are set
4. Verify all dependencies are installed
5. Check that both frontend and backend servers are running

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI coaching features
- [ ] Social features and community
- [ ] Integration with fitness trackers
- [ ] Offline mode support
- [ ] Multi-language support

---

**Built with ❤️ for wellness and mindfulness**
