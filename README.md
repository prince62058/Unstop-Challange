# AI-Powered Communication Assistant

🤖 An intelligent email management system that automatically processes, analyzes, and generates responses for customer support emails using AI.

## 🔗 Live Demo

**[View Live Application](https://unstop-challange.onrender.com/)**

Experience the full-featured AI email management system in action!

## 🌟 Features

- **Automatic Email Sync**: Connect your Gmail account for real-time email synchronization
- **AI-Powered Analysis**: Sentiment analysis, priority classification, and intelligent categorization
- **Smart Response Generation**: Auto-generate professional email responses using OpenAI GPT-4
- **Analytics Dashboard**: Comprehensive insights with charts and metrics
- **Real-time Processing**: Live email monitoring and instant AI analysis
- **User-Friendly Interface**: Modern, responsive dashboard built with React and Tailwind CSS

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4 API
- **Email Integration**: Gmail API, IMAP, Nodemailer
- **Deployment**: Replit

## 📋 Prerequisites

Before setting up the project, make sure you have:

- Node.js (v18 or higher)
- Gmail Account
- Google Cloud Console access
- OpenAI Account
- PostgreSQL database (provided by Replit)

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-communication-assistant
cd ai-communication-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Auto-configured in Replit)
DATABASE_URL=your_postgresql_connection_string

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Gmail API Configuration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🔧 Detailed Setup Instructions

### OpenAI API Setup

1. **Create OpenAI Account**
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Sign up or log in to your account

2. **Generate API Key**
   - Go to [API Keys section](https://platform.openai.com/account/api-keys)
   - Click "Create new secret key"
   - Copy the generated key (starts with `sk-`)
   - Add to `.env` file as `OPENAI_API_KEY`

3. **Add Billing Information**
   - Go to [Billing](https://platform.openai.com/account/billing)
   - Add payment method
   - Set usage limits if needed

### Gmail API Setup

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Gmail API:
     - Go to "APIs & Services" > "Library"
     - Search for "Gmail API"
     - Click "Enable"

2. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure consent screen if prompted
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:5000/auth/callback
     https://your-replit-domain.replit.app/auth/callback
     ```

3. **Get Client ID and Secret**
   - Download the JSON file or copy:
     - `GMAIL_CLIENT_ID`: Your client ID
     - `GMAIL_CLIENT_SECRET`: Your client secret

4. **Generate Refresh Token**
   - Use OAuth 2.0 Playground: https://developers.google.com/oauthplayground
   - In settings (gear icon), check "Use your own OAuth credentials"
   - Enter your Client ID and Secret
   - Select Gmail API scopes:
     ```
     https://www.googleapis.com/auth/gmail.readonly
     https://www.googleapis.com/auth/gmail.send
     https://www.googleapis.com/auth/gmail.modify
     ```
   - Authorize and get refresh token
   - Copy the refresh token to `.env` as `GMAIL_REFRESH_TOKEN`

### Database Setup (PostgreSQL)

The project uses PostgreSQL with Drizzle ORM. If you're running on Replit, the database is automatically configured.

**For local development:**

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Create Database**
   ```sql
   createdb ai_email_assistant
   ```

3. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server
- Hot reloading for both frontend and backend

### Production Mode

```bash
npm run build
npm start
```

## 📁 Project Structure

```
ai-communication-assistant/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── server/                 # Backend Express server
│   ├── services/           # Business logic services
│   │   ├── email.ts        # Email processing
│   │   └── openai.ts       # AI integration
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── README.md              # This file
```

## 🔌 API Endpoints

### Email Management
- `GET /api/emails` - Get all emails
- `GET /api/emails/:id` - Get specific email
- `POST /api/emails/sync` - Sync emails from Gmail
- `POST /api/emails/:id/generate-response` - Generate AI response

### Analytics
- `GET /api/analytics/stats` - Get email statistics
- `GET /api/analytics/sentiment` - Get sentiment analysis data
- `GET /api/analytics/categories` - Get category distribution

## 🎯 Usage

### 1. Email Synchronization
- Navigate to the Dashboard
- Click "Sync Emails" button
- The system will fetch emails from your Gmail account
- AI analysis will automatically process each email

### 2. AI Response Generation
- Go to "Emails" section
- Click on any email to view details
- Click "Generate Response" to create AI-powered reply
- Edit the response if needed
- Send directly from the interface

### 3. Analytics
- Visit the "Analytics" section
- View email statistics, sentiment trends
- Monitor response rates and processing metrics

## 🛡️ Security Features

- **Environment Variables**: All sensitive data stored securely
- **OAuth 2.0**: Secure Gmail API authentication
- **API Rate Limiting**: Prevents excessive OpenAI API usage
- **Input Validation**: All user inputs validated and sanitized
- **HTTPS**: Secure data transmission in production

## 📊 Database Schema

### Tables
- **emails**: Email content and metadata
- **email_responses**: Generated AI responses
- **users**: User authentication (future feature)

### Key Fields
```typescript
interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
  priority: "urgent" | "normal";
  sentiment: "positive" | "negative" | "neutral";
  category: string;
  receivedAt: Date;
}
```

## 🔧 Configuration Options

### AI Settings
- Model selection (GPT-4, GPT-3.5-turbo)
- Response tone customization
- Analysis confidence thresholds

### Email Settings
- Sync frequency
- Priority keywords
- Auto-response triggers

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   ```
   Error: Incorrect API key provided
   ```
   **Solution**: Verify your OPENAI_API_KEY in environment variables

2. **Gmail Authentication Failed**
   ```
   Error: invalid_grant
   ```
   **Solution**: Regenerate refresh token using OAuth 2.0 Playground

3. **Database Connection Error**
   ```
   Error: Connection refused
   ```
   **Solution**: Check DATABASE_URL and ensure PostgreSQL is running

### Debug Mode
Enable detailed logging:
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Need help? Here are your options:

- **Email**: princekumar5252@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/ai-communication-assistant/issues)
- **Documentation**: Check this README and code comments

## 🚀 Deployment

### Replit Deployment (Recommended)

1. Fork this Repl or import from GitHub
2. Set environment variables in Replit Secrets
3. The application will automatically deploy

### Manual Deployment

1. Build the project: `npm run build`
2. Set environment variables on your hosting platform
3. Deploy the built application

## 🔄 Version History

- **v1.0.0** - Initial release with basic email sync and AI analysis
- **v1.1.0** - Added analytics dashboard and response generation
- **v1.2.0** - Enhanced UI/UX with back navigation and improved filters

---

Made with ❤️ for intelligent email management