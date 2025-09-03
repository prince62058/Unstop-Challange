# Overview

This project is an AI-Powered Communication Assistant designed to intelligently manage incoming support emails end-to-end. The system automatically retrieves, analyzes, prioritizes, and generates responses for customer support emails. It provides a comprehensive dashboard for email management with AI-driven sentiment analysis, priority classification, and automated response generation.

The application is built for modern organizations that receive high volumes of support-related emails and need to improve efficiency, response quality, and customer satisfaction while reducing manual effort.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Full-Stack Architecture
The application follows a monorepo structure with a clear separation between client, server, and shared components. The frontend is built with React and TypeScript, while the backend uses Express.js with Node.js. The project is configured for Replit deployment with Vite as the build tool.

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular dashboard components with clear separation of concerns

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handling
- **Database Integration**: Drizzle ORM for type-safe database operations
- **Email Processing**: Service-based architecture for email analysis and response generation

## Database Schema
The system uses PostgreSQL with three main entities:
- **Users**: Authentication and user management
- **Emails**: Core email data with AI analysis results (priority, sentiment, category, extracted information)
- **Email Responses**: Generated and edited responses with confidence scoring

## AI Integration
- **OpenAI Integration**: Uses GPT-5 for sentiment analysis, priority classification, information extraction, and response generation
- **Service Layer**: Dedicated OpenAI service for all AI operations with structured prompts and response parsing
- **Analysis Features**: 
  - Sentiment analysis with confidence scoring
  - Priority classification (urgent/normal)
  - Information extraction (phone numbers, emails, requirements)
  - Automated response generation with customizable tone

## Data Flow
1. Emails are processed through the email service which orchestrates AI analysis
2. Multiple AI analyses run in parallel (sentiment, priority, information extraction)
3. Results are stored in the database with structured metadata
4. Dashboard displays processed emails with filtering and search capabilities
5. Users can generate, edit, and send AI-powered responses

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database operations with schema migrations

## AI Services
- **OpenAI API**: GPT-5 model for all AI processing tasks including sentiment analysis, priority classification, and response generation

## UI Components
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Shadcn/ui**: Pre-built components based on Radix UI with Tailwind CSS styling
- **Lucide Icons**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management and caching
- **Date-fns**: Date manipulation and formatting

## Email Integration
The system is designed to integrate with email providers through:
- **IMAP Support**: For fetching emails from various providers
- **Nodemailer**: For sending generated responses
- Support for Gmail, Outlook, and other standard email providers

## Deployment
- **Replit**: Primary deployment platform with specific configuration
- **Environment Variables**: Secure handling of API keys and database connections
- **Production Build**: Optimized builds with proper asset handling