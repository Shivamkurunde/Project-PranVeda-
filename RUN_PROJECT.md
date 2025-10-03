# 🚀 PranVeda - Mind & Body Wellness Project

## Quick Start Guide

This guide will help you run the PranVeda wellness application on your local machine.

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pranaveda-zen-flow-master
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
```

#### Backend Dependencies
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

## 🚀 Running the Project

### Development Mode (Recommended)

#### Start Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
- **URL**: http://localhost:5000
- **Features**: Hot reload, TypeScript compilation, error handling

#### Start Frontend Server (Terminal 2)
```bash
cd frontend
npm run dev
```
- **URL**: http://localhost:8082
- **Features**: Hot reload, development tools, error overlay
- **Auto-reload**: Changes are reflected immediately

### Production Build
```bash
# Build the frontend
cd frontend
npm run build

# Preview the production build
npm run preview

# Build the backend
cd backend
npm run build
```

### Other Available Scripts

#### Frontend Scripts
```bash
cd frontend
npm run lint          # Lint the code
npm run type-check    # TypeScript type checking
npm run test          # Run unit tests
npm run test:e2e      # Run Playwright E2E tests
npm run build         # Build for production
```

#### Backend Scripts
```bash
cd backend
npm run lint          # Lint the code
npm run type-check    # TypeScript type checking
npm run test          # Run backend tests
npm run build         # Build for production
```

## 🌐 Accessing the Application

Once both servers are running:

1. **Open your browser** and navigate to: `http://localhost:8082`
2. **Available Routes**:
   - `/` - Landing page
   - `/auth/signin` - Sign in page
   - `/auth/signup` - Sign up page
   - `/dashboard` - User dashboard (requires authentication)
   - `/meditate` - Meditation sessions
   - `/workout` - Workout sessions
   - `/ai-coach` - AI Coach interface
   - `/reports` - Analytics and reports

## 🎯 Key Features

### ✅ Authentication System
- **Sign Up**: Password strength indicator, form validation
- **Sign In**: Remember me, forgot password
- **Google OAuth**: Social authentication
- **Error Handling**: Server connection errors, validation messages

### ✅ Audio Management
- **Centralized AudioManager**: Prevents WebMediaPlayer limit errors
- **Multiple Sound Types**: UI clicks, navigation, notifications, achievements
- **Graceful Fallback**: Works with or without audio files

### ✅ UI/UX Components
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Shadcn/UI components with Tailwind CSS
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔧 Backend Integration

### Backend Server
The Node.js backend provides:
- **Authentication**: Firebase Admin SDK integration
- **API Endpoints**: RESTful API for frontend
- **Database**: Supabase PostgreSQL integration
- **Security**: JWT validation, rate limiting, CORS

### API Endpoints
- `GET /api/health/health` - Server health check
- `GET /api/health/health/db` - Database health check
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

## 📁 Project Structure

```
pranaveda-zen-flow-master/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services and utilities
│   │   ├── lib/             # Utility functions
│   │   └── integrations/    # Firebase & Supabase clients
│   ├── public/audio/        # Audio files for UI feedback
│   ├── tests/               # Playwright test suite
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # Firebase & Supabase config
│   │   ├── middleware/      # Auth, rate limiting, error handling
│   │   ├── routes/         # API route handlers
│   │   └── services/       # Business logic services
│   ├── dist/               # Compiled JavaScript
│   └── package.json
├── supabase/               # Database migrations and config
└── README.md              # Main documentation
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process using port 8082 (frontend)
npx kill-port 8082

# Kill process using port 5000 (backend)
npx kill-port 5000

# OR use different ports
cd frontend && npm run dev -- --port 3000
cd backend && PORT=3001 npm run dev
```

#### 2. Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Environment Variables
- Ensure all required environment variables are set
- Check that `.env.local` (frontend) and `.env` (backend) exist
- Verify Supabase and Firebase credentials are correct
- Restart servers after changing environment variables

#### 4. Audio Issues
- Audio files are optional - the app works without them
- Place audio files in `frontend/public/audio/` directory
- See `frontend/src/audio/AUDIO_FILES_NEEDED.md` for required files

#### 5. Backend Connection Errors
- Ensure backend server is running on port 5000
- Check network connectivity
- Verify API endpoints in `frontend/src/services/`
- Check backend console for errors

### Browser Compatibility
- **Chrome**: Recommended
- **Firefox**: Supported
- **Safari**: Supported
- **Edge**: Supported

## 🔒 Security Notes

- Never commit `.env` files with sensitive data
- Use environment variables for API keys
- Enable HTTPS in production
- Implement proper CORS policies

## 📊 Performance Tips

- Use production build for better performance
- Enable gzip compression
- Optimize images and assets
- Use CDN for static assets

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests with Playwright
```

### Backend Testing
```bash
cd backend
npm test           # Backend tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check this documentation
2. Review the console for errors
3. Check the network tab for failed requests
4. Ensure all dependencies are installed
5. Verify environment variables are set correctly

## 🎉 Success!

If everything is working correctly, you should see:

- ✅ Backend server running on `http://localhost:5000`
- ✅ Frontend server running on `http://localhost:8082`
- ✅ No console errors
- ✅ Sign-in/Sign-up pages loading correctly
- ✅ All navigation working
- ✅ Audio system functioning (if audio files present)
- ✅ Authentication working with Firebase
- ✅ Database connection established

---

**Happy coding! 🧘‍♀️💪🧠**
