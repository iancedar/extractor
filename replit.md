# Replit Configuration

## Overview

This is a full-stack web application for extracting keywords from press releases using AI-powered analysis. The application features a React frontend with shadcn/ui components and an Express.js backend that integrates with Google's Gemini AI API for intelligent keyword extraction. The system includes fallback extraction methods, content validation, API health monitoring, and comprehensive error handling to ensure reliable operation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query for server state management and caching, with custom hooks for business logic
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API development
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **AI Integration**: Google Gemini AI API for intelligent keyword extraction with fallback mechanisms
- **Content Processing**: Cheerio for HTML parsing and content extraction from web pages
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **Security**: Rate limiting, input validation, and CORS configuration for API protection

### Data Storage
- **Primary Database**: PostgreSQL with Neon serverless hosting for production scalability
- **Development Storage**: In-memory storage implementation for development and testing
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Data Models**: Extractions table for storing keyword results, API stats for performance monitoring

### API Design
- **Keyword Extraction Endpoint**: POST `/api/extract-keywords` - Main extraction with AI processing
- **Content Fetching**: POST `/api/fetch-content` - URL validation and content retrieval
- **Health Monitoring**: GET `/api/health` - API status and Gemini service availability
- **Performance Metrics**: GET `/api/stats` - Request statistics and response time tracking

### Error Handling & Resilience
- **Fallback System**: Frequency-based keyword extraction when AI service is unavailable
- **Content Validation**: URL format verification, content length checks, and HTML sanitization
- **Rate Limiting**: Request throttling to prevent abuse and manage API quotas
- **Health Checks**: Continuous monitoring of external service availability

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary keyword extraction using the `@google/genai` SDK with structured JSON responses
- **Fallback Processing**: Local text analysis using frequency algorithms and pattern matching

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting for production deployments
- **Replit Integration**: Development environment with live reload and error handling plugins

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Lucide Icons**: SVG icon library for consistent visual elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

### Development Tools
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **ESBuild**: Fast bundling for production builds
- **Vite**: Development server with hot module replacement
- **Zod**: Runtime type validation for API requests and responses