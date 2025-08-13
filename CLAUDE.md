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
- **Protected Routes**: `/favorites`, `/my-libraries`, `/upload` require authentication
- **OAuth**: Google provider configured for one-click login

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
- **Authenticated**: Can favorite, upload, create libraries
- **Session Management**: Automatic refresh via middleware on all routes

## Implementation Status

**✅ Phase 1 COMPLETED**: Full infrastructure setup
- Database schema and client configured
- Supabase project integration ready
- Authentication middleware implemented
- File upload utilities and validation
- Type definitions for all entities
- Development tooling and scripts

**🚧 Phase 2 NEXT**: Core browsing and audio playback
- Layout with sidebar navigation
- Sample browsing pages by category/library
- Audio player component with play tracking
- Search functionality

## Environment Setup

**Required**: Create `.env.local` from `.env.example` with:
- Supabase project URL and keys
- Database connection strings (pooled + direct)
- File upload limits and allowed MIME types

**Supabase Setup**: Follow detailed guide in `/docs/setup/supabase-setup-guide.md`

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

### Supabase Integration
- Client utilities in `/lib/supabase/` (client, server, middleware)
- Type definitions in `/types/supabase.ts`
- Authentication state managed via middleware on all routes

### Database Layer
- Prisma schema in `/prisma/schema.prisma`
- Client singleton in `/lib/prisma.ts` 
- Type definitions in `/types/database.ts`
- Utilities for validation, formatting in `/lib/utils.ts`

Refer to `/docs/prd/sounddrop-prd.md` for complete product requirements and `/docs/plans/phase-1-plan.md` for infrastructure implementation details.