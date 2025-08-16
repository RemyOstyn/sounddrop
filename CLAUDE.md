# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoundDrop is a mobile-first web soundboard application built with Next.js 15, React 19, TypeScript, and Tailwind CSS. Users can browse, play, and organize audio samples from community-uploaded libraries. The app supports user authentication, favorites, custom libraries, and audio uploads.

## Development Commands

```bash
# Development server with turbopack
npm run dev

# Build for production (includes Prisma generation)
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:seed        # Seed with default categories
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database (dev only)
npm run db:migrate-usernames  # Migrate existing users to username system
```

## Architecture & Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication & Storage**: Supabase (Auth with Google OAuth, Storage buckets)
- **Deployment**: Vercel

## Infrastructure Architecture

### Database Layer (Prisma + Supabase)
- **Prisma Client**: Singleton instance in `/lib/prisma.ts` for database operations
- **Schema**: Complete relational model with User, Category, Library, Sample, Favorite entities
- **Type Generation**: Auto-generated types with custom extensions in `/types/database.ts`
- **Seeding**: 10 default categories (Memes, Movies, TV Shows, etc.) via `/prisma/seed.ts`

### Authentication Architecture (Supabase Auth)
- **Client-side**: Browser client in `/lib/supabase/client.ts`
- **Server-side**: Server client with cookie handling in `/lib/supabase/server.ts` 
- **Middleware**: Auth session management in `/middleware.ts` using `/lib/supabase/middleware.ts`
- **Protected Routes**: `/favorites`, `/my-libraries`, `/upload`, `/settings` require authentication
- **OAuth**: Google provider configured for one-click login
- **Privacy System**: Username-based identity with `/lib/username-utils.ts` and `/lib/user-display-utils.ts`
- **User Settings**: Complete profile management with real-time validation

### Storage Architecture (Supabase Storage)
- **audio-samples** bucket: Public, 50MB limit, supports mp3/wav/mp4/ogg
- **library-icons** bucket: Public, 2MB limit, supports jpeg/png/webp/gif
- **File Upload Flow**: Client validation → Supabase upload → Database record creation
- **Public Access**: All uploaded files are publicly accessible via Supabase CDN

### Component Architecture (shadcn/ui)
- **Configuration**: New York style with CSS variables in `/components.json`
- **Utilities**: Combined clsx/tailwind-merge in `/lib/utils.ts` cn() function
- **Constants**: App-wide configuration in `/lib/constants.ts`
- **Type Safety**: Comprehensive type definitions for all data models and API responses

### State Management Architecture (Zustand)
- **Audio Store**: Multi-sample playback state with Web Audio API integration
- **Auth Store**: User session management with real-time Supabase listener
- **Persistent State**: LocalStorage integration for user preferences
- **Type Safety**: Strict TypeScript interfaces for all store state

## Key Concepts

### Data Model Hierarchy
```
Category (pre-defined)
  └─ Library (user-created, has custom icon)
      └─ Sample (audio file, tracks play count)
          └─ Favorite (user bookmark)
```

### File Upload Constraints
- Audio files: 50MB max (was 10MB in original spec, updated to 50MB in implementation)
- Icon files: 2MB max
- Rate limiting: 10 uploads per hour
- MIME type validation on both client and server

### Authentication States
- **Unauthenticated**: Can browse and play all public content
- **Authenticated**: Can favorite, upload, create libraries, manage personal content, access settings
- **Session Management**: Automatic refresh via middleware on all routes
- **Privacy Model**: Auto-generated usernames protect real identity, customizable display names

### UI Design System
- **Theme**: Dark mode with glassmorphism effects and backdrop blur
- **Color Palette**: Purple-to-pink primary gradients, blue-to-cyan secondary, deep blacks with subtle blue undertones
- **Animations**: Framer Motion throughout with smooth transitions and micro-interactions
- **Typography**: Responsive scaling with mobile-first approach
- **Components**: iOS-inspired interface with premium visual effects

## Implementation Status

**✅ Phase 1 COMPLETED**: Full infrastructure setup
- Database schema and client configured
- Supabase project integration ready
- Authentication middleware implemented
- File upload utilities and validation
- Type definitions for all entities
- Development tooling and scripts

**✅ Phase 2 COMPLETED**: Core Browsing & Audio Playback
- Stunning iOS-inspired glassmorphism interface with dark theme
- Multi-sample audio playback with Web Audio API integration
- Visual waveforms with real-time canvas-based audio visualization
- Infinite scroll sample grid with optimized performance
- Command palette search with real-time suggestions
- Mobile-first responsive design with iOS-style navigation
- Trending algorithm based on 24-hour play count weighting

**✅ Phase 3 COMPLETED**: Authentication System
- Google OAuth integration via Supabase Auth
- Zustand-powered auth state management with real-time updates
- Beautiful glassmorphic auth components matching app design
- User menu with profile display and session management
- Protected routes with automatic redirect handling
- Complete favorites system with CRUD operations and optimistic updates
- Cross-browser session sync and security best practices

**✅ Phase 4 COMPLETED**: User Features & Upload System
- Library management with custom icon uploads
- Complete audio sample upload system with drag & drop interface
- Rate limiting (10 uploads/hour) and comprehensive file validation
- My Libraries page with create/edit/delete functionality
- Upload page with progress tracking and batch upload support
- Real-time library and sample management
- Full integration with Supabase Storage for audio and icons

**✅ LATEST UPDATE**: Privacy-First Username System (August 2025)
- Complete privacy overhaul with username-based identity system
- Auto-generated usernames (format: prefix_from_email + random_suffix)
- User settings page (/settings) for username/displayName management
- Real-time username validation and availability checking
- Migration system for existing users with automated username assignment
- Privacy protection ensuring real names are never exposed publicly
- Comprehensive username utilities and validation schemas

## Environment Setup

**Required**: Create `.env.local` from `.env.example` with:
- Supabase project URL and keys
- Database connection strings (pooled + direct)
- File upload limits and allowed MIME types

**Supabase Setup**: Follow detailed guide in `/docs/setup/supabase-setup-guide.md`

## Recent Updates & Important Changes

### Username System Implementation (August 2025)
The application has been updated with a comprehensive privacy-first username system:

**Key Changes for Developers:**
- User model now includes `username` and `displayName` fields (both unique)
- Real names from Google OAuth are never stored or displayed publicly
- All public displays use `getUserDisplayName()` utility from `/lib/user-display-utils.ts`
- Username validation and generation handled by `/lib/username-utils.ts`
- Migration script available: `npm run db:migrate-usernames`

**Database Schema Updates:**
```sql
-- New User fields (already applied)
username: String @unique  // Auto-generated, user-customizable
displayName: String? @unique  // Optional friendly name
```

**API Updates:**
- All user-facing APIs now return `username`/`displayName` instead of `name`
- New endpoints: `/api/user/settings`, `/api/user/check-username`, `/api/user/sync`
- User settings page available at `/settings` (protected route)

**Development Practices:**
- Always use `getUserDisplayName(user)` for displaying user names
- Never access `user.name` directly in UI components
- Use username validation utilities when handling user input
- Test with the migration script for existing user data

## Database Operations

```bash
# Initial setup (after Supabase project creation)
npm run db:push     # Create tables in Supabase
npm run db:seed     # Add 10 default categories

# Development workflow
npm run db:generate # After schema changes
npm run db:studio   # Visual database browser
```

## File Structure Patterns

### Application Architecture
```
app/
├── (main)/              # Public pages (home, category, trending)
├── (auth)/              # Authentication pages (login, logout)
├── (protected)/         # Authenticated user pages (favorites, libraries, upload, settings)
└── api/                 # REST API routes with proper auth validation
```

### Component Organization
```
components/
├── audio/               # Audio playback and visualization components
├── auth/                # Authentication UI components
├── layout/              # Navigation and layout components
├── library/             # Library management components
├── shared/              # Reusable UI components
├── ui/                  # shadcn/ui base components
└── upload/              # File upload components
```

### State Management
```
lib/stores/
├── audio-store.ts       # Multi-sample audio playback state
└── auth-store.ts        # User authentication and session state

hooks/
├── use-*.ts             # Custom hooks for data fetching and state management
├── use-auth.ts          # Authentication state and user session management
├── use-user-settings.ts # User settings management with real-time validation
├── use-favorites.ts     # Favorites system with optimistic updates
```

### Supabase Integration
- Client utilities in `/lib/supabase/` (client, server, middleware)
- Type definitions in `/types/supabase.ts`
- Authentication state managed via middleware on all routes

### Database Layer
- Prisma schema in `/prisma/schema.prisma`
- Client singleton in `/lib/prisma.ts` 
- Type definitions in `/types/database.ts`
- Utilities for validation, formatting in `/lib/utils.ts`
- Username system utilities in `/lib/username-utils.ts`
- User display helpers in `/lib/user-display-utils.ts`
- Migration scripts in `/scripts/` for schema updates

## Current Application Features

**🎵 Audio System**:
- Multi-sample simultaneous playback
- Real-time waveform visualization with Canvas API
- Volume control and audio processing with Web Audio API
- Play count tracking for trending algorithm

**🔐 Authentication & Privacy**:
- Google OAuth via Supabase Auth
- Privacy-first username system with auto-generated usernames
- Protected routes with automatic redirects
- User settings page for username/displayName customization
- Real-time username validation and availability checking
- Complete privacy protection (real names never exposed)

**📚 Content Management**:
- Browse samples by category and library
- Infinite scroll with optimized virtual rendering
- Real-time search with debounced queries
- Trending algorithm based on 24-hour play activity

**👤 User Features**:
- Favorites system with optimistic updates
- Create and manage custom libraries with icons
- Upload audio samples with drag & drop interface
- Rate limiting and comprehensive file validation
- User settings management (/settings page)
- Username/display name customization

**📱 Mobile Experience**:
- iOS-inspired interface with glassmorphism
- Touch-optimized navigation and controls
- Responsive design across all device sizes
- Dark theme with premium visual effects