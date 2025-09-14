# 🤖 AI-Powered Communication Assistant

A comprehensive AI-driven email management system that intelligently processes, analyzes, and generates responses for customer support emails using advanced machine learning and natural language processing.

## ✨ Key Features

### 🧠 AI-Powered Intelligence
- **Advanced Sentiment Analysis** - Automatically detects emotional tone with confidence scoring
- **Smart Priority Classification** - Intelligently categorizes emails as urgent or normal  
- **Automated Response Generation** - Creates professional, contextual responses using OpenAI GPT models
- **Information Extraction** - Automatically identifies phone numbers, emails, and key requirements

### 📧 Email Management
- **Multi-Provider Support** - Gmail integration and optional Outlook support (requires configuration)
- **Email Processing** - Comprehensive email analysis and categorization
- **Response Management** - Track and manage AI-generated responses
- **Sample Data Mode** - Works with mock data when database is unavailable

### 📊 Analytics & Insights
- **Comprehensive Dashboard** - Dynamic statistics and performance metrics
- **Sentiment Trends** - Track customer satisfaction patterns
- **Response Analytics** - Monitor processing and response patterns
- **Category Distribution** - Understand email types and patterns

### 🎨 Modern Interface
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Interactive Charts** - Beautiful data visualization with Recharts
- **Modern UI Components** - Built with Shadcn/ui component library
- **Smooth Navigation** - Intuitive sidebar navigation with Wouter routing

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **JavaScript/JSX** - Dynamic frontend implementation
- **Tailwind CSS** - Utility-first styling framework
- **Shadcn/ui** - High-quality accessible component library
- **TanStack Query** - Powerful data synchronization and caching
- **Wouter** - Lightweight client-side routing
- **Framer Motion** - Smooth animations and transitions

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **Mixed TypeScript/JavaScript** - TypeScript entry point with JavaScript routes
- **Drizzle ORM** - TypeScript SQL toolkit for database operations

### Database & AI
- **PostgreSQL** - Robust relational database with Neon serverless support
- **OpenAI API** - Advanced language models for AI processing
- **In-Memory Fallback** - Sample data when database unavailable

### Development & Deployment
- **Vite** - Next-generation frontend build tool
- **ESBuild** - Fast JavaScript bundler for production
- **Replit** - Cloud-based development and deployment platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (optional - app works with sample data)
- OpenAI API account (optional for AI features)
- Gmail/Outlook account (optional for email integration)

### Installation

1. **Clone Repository**
```bash
git clone <your-repository-url>
cd ai-communication-assistant
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env` file with optional variables:
```env
# Database Configuration (Optional - app works without)
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI Configuration (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Email Provider Settings (Optional - for email sync)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret  
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token

# Server Configuration
PORT=5000
NODE_ENV=development
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:5000` to access the application.

## 📁 Project Architecture

```
ai-communication-assistant/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # Shadcn/ui components
│   │   ├── pages/             # Application pages/routes
│   │   │   ├── dashboard.jsx  # Main dashboard
│   │   │   ├── emails.jsx     # Email management
│   │   │   ├── ai-responses.jsx # AI response management
│   │   │   ├── analytics.jsx  # Analytics dashboard
│   │   │   └── settings.jsx   # Configuration settings
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-emails.js  # Email data management
│   │   │   └── use-analytics.js # Analytics data
│   │   ├── lib/               # Utility functions
│   │   └── App.jsx            # Main application component
│   └── public/                # Static assets
├── server/                    # Express.js backend
│   ├── services/              # Business logic services
│   │   ├── email.js           # Email processing logic
│   │   ├── gmail.js           # Gmail API integration
│   │   ├── outlook.js         # Outlook integration  
│   │   └── openai.js          # OpenAI API integration
│   ├── db.ts                  # Database connection setup
│   ├── storage.ts             # Data storage interface
│   ├── routes.js              # API route definitions
│   └── index.ts               # Server entry point (TypeScript)
├── shared/                    # Shared type definitions
│   └── schema.ts              # Database schema & types
└── dist/                      # Production build output
```

## 🔌 API Endpoints

The application includes several API endpoints for email and analytics management:

- `GET /api/emails` - Retrieve emails (with filtering support)
- `GET /api/analytics/stats` - Overall email statistics  
- `GET /api/analytics/sentiment` - Sentiment distribution data
- `GET /api/analytics/categories` - Email category breakdown
- `POST /api/emails/:id/generate-response` - Generate AI response (if OpenAI configured)

*Note: API returns sample data when database/services are unavailable*

## 🎯 Core Features

### 1. Email Dashboard
- Modern interface showing email cards with sender information
- Priority and sentiment indicators
- Email preview and categorization
- Search and filtering capabilities

### 2. AI Response System
- Generate contextual responses using OpenAI API
- Edit and customize AI-generated content
- Response confidence tracking
- Send responses through email providers

### 3. Analytics Dashboard
- Email processing statistics
- Sentiment analysis distribution
- Category breakdown charts
- Performance metrics and trends

### 4. Settings Management
- AI feature configuration toggles
- Email provider connection settings
- User preferences and customization
- System configuration options

## 🛠️ Configuration

### Replit Deployment
The application is designed for Replit deployment:

1. Import project to Replit
2. Set environment variables in Replit Secrets:
   - `DATABASE_URL` (optional)
   - `OPENAI_API_KEY` (optional)
   - Email provider credentials (optional)
3. Application automatically builds and deploys
4. Access via your Replit URL

### Local Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run check  # TypeScript type checking
```

## 🔧 Features & Functionality

### Current Implementation
- ✅ Modern React dashboard with responsive design
- ✅ Email management interface with sample data
- ✅ AI response generation (when API keys provided)
- ✅ Analytics dashboard with charts
- ✅ Settings configuration panel
- ✅ Multi-page navigation with Wouter
- ✅ Database integration with fallback to sample data

### Planned Enhancements
- 🔄 Real-time email sync with WebSocket support
- 🔄 Advanced rate limiting and security features
- 🔄 Enhanced authentication system
- 🔄 Bulk email operations
- 🔄 Export functionality for analytics

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Install dependencies
npm install

# Check for TypeScript errors
npm run check

# Start in development mode
npm run dev
```

### No Data Showing
The application works with sample data by default. To use real data:
- Set up `DATABASE_URL` for database connection
- Configure email provider credentials for sync
- Add `OPENAI_API_KEY` for AI features

### Build Issues
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style (JavaScript/JSX for frontend)
- Test with and without environment variables
- Ensure responsive design
- Update documentation as needed

## 📊 Project Status

### Current Version: v1.0.0
- Complete dashboard interface
- Email management system
- AI integration capabilities  
- Analytics and reporting
- Modern responsive UI

### Architecture
- Frontend: React + JavaScript
- Backend: Express + Mixed TS/JS
- Database: PostgreSQL with Drizzle ORM
- Deployment: Replit-ready configuration

## 📞 Support

For questions or support:
- **Email**: princekumar5252@gmail.com  
- **GitHub**: Create an issue in the repository
- **Documentation**: Check code comments and this README

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built for intelligent email management**

⭐ Star this repo if you find it useful!

</div>