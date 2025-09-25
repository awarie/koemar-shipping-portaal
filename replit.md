# Replit.md

## Overview

Koemar Shipping Pakket Portaal is a full-stack logistics dashboard application built with React (TypeScript) on the frontend and Express.js on the backend. The application provides a comprehensive interface for tracking shipments, monitoring logistics activities, and managing fleet operations. It features a modern, responsive design with real-time data visualization and user authentication through Replit's OIDC system.

**Current Status**: Public website is temporarily disabled per user request - only dashboard functionality is active. Non-authenticated users are redirected to login page.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/UI component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation through @hookform/resolvers

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Replit OIDC integration with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with proper error handling and logging middleware

### Database Design
The system uses PostgreSQL with the following core entities:
- **Users**: Stores user authentication data (required for Replit Auth)
- **Sessions**: Manages user sessions (required for Replit Auth)
- **Shipments**: Tracks logistics shipments with status, destinations, and ETAs
- **Activities**: Logs all logistics operations and status changes

### Authentication & Authorization
- **Identity Provider**: Replit OIDC for secure authentication
- **Session Strategy**: Server-side sessions stored in PostgreSQL
- **Route Protection**: Middleware-based authentication checks on API endpoints
- **User Management**: Automatic user creation/update on authentication

### Development Environment
- **Monorepo Structure**: Shared schema and types between client and server
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Error Handling**: Runtime error overlay in development with graceful fallbacks
- **Build Process**: Vite for frontend bundling, esbuild for server compilation

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Replit Platform**: Hosting environment with integrated authentication

### UI & Design System
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework
- **Date-fns**: Date manipulation and formatting

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code quality and formatting (implicit)

### Authentication & Security
- **OpenID Client**: OIDC protocol implementation
- **Passport.js**: Authentication middleware
- **Express Session**: Secure session management

### Data Fetching & State
- **TanStack Query**: Server state synchronization with caching
- **Fetch API**: HTTP client for API communication