# Phase 1: Infrastructure Setup - Complete Implementation Plan

## Overview
Complete infrastructure setup for SoundDrop including Supabase project creation (PostgreSQL database, authentication, storage), Prisma ORM configuration, shadcn/ui components, and all necessary configurations.

## Prerequisites Check
- ✅ Next.js 15 with React 19 and TypeScript already initialized
- ✅ Tailwind CSS 4 installed (needs configuration)
- ⚠️ Need Supabase project creation
- ⚠️ Need environment configuration

## Implementation Steps

### 1. Supabase Project Setup
**Create New Project:**
- Sign up/login at https://supabase.com
- Create new project with name "sounddrop"
- Select region closest to target users
- Generate secure database password
- Wait for project provisioning (~2 minutes)

**Retrieve Credentials:**
- Navigate to Settings → API
- Copy: Project URL, anon/public key, service role key
- Navigate to Settings → Database
- Copy: Connection string (both pooled and direct)

### 2. Environment Configuration
**Create `.env.example`:**
```env
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# File Upload Limits
MAX_AUDIO_SIZE_MB="50"
MAX_ICON_SIZE_MB="2"
ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp3,audio/mp4,audio/ogg"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp,image/gif"
```

**Create `.env.local`** with actual values from Supabase

### 3. Install Dependencies
```bash
# Database & ORM
npm install @prisma/client
npm install -D prisma

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui utilities
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot

# Additional utilities
npm install zod react-hook-form @hookform/resolvers
```

### 4. Prisma Schema Setup
**Create `prisma/schema.prisma`** with complete data model including all relationships and indexes

### 5. Supabase Configuration

**Storage Buckets Setup:**
- Create "audio-samples" bucket (public, 50MB file limit)
- Create "library-icons" bucket (public, 2MB file limit)
- Configure CORS and file type restrictions

**Google OAuth Setup:**
- Enable Google provider in Authentication → Providers
- Add OAuth credentials from Google Cloud Console
- Configure redirect URLs for local and production
- Set up auth callback endpoint

**Database Setup:**
- Run Prisma migrations to create tables
- Enable Row Level Security (RLS) on all tables
- Create RLS policies for public read access

### 6. shadcn/ui Installation
**Initialize shadcn/ui:**
```bash
npx shadcn@latest init
```
- Choose: New York style
- Base color: Neutral
- CSS variables: Yes
- Tailwind config: Use existing
- Components path: components
- Utils path: lib/utils
- React Server Components: Yes
- Component aliases: Use defaults

### 7. Project Structure Creation
Create organized directory structure:
- `/lib/supabase/` - Supabase client utilities
- `/lib/prisma.ts` - Prisma client singleton
- `/components/ui/` - shadcn components
- `/hooks/` - Custom React hooks
- `/types/` - TypeScript definitions
- `/prisma/seed.ts` - Database seeding

### 8. Database Initialization
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run seed script
npm run db:seed
```

### 9. Tailwind CSS v4 Configuration
- Update tailwind config for v4 syntax
- Configure content paths
- Add custom theme extensions
- Set up CSS variables for theming

### 10. Middleware Setup
Create `middleware.ts` for:
- Supabase auth session management
- Protected route handling
- CORS configuration

## Files Created

1. **`docs/plans/phase-1-plan.md`** - This implementation plan
2. **`docs/setup/supabase-setup-guide.md`** - Detailed Supabase configuration guide
3. **`.env.example`** - Environment variable template
4. **`.env.local`** - Actual environment values (user fills)
5. **`prisma/schema.prisma`** - Complete database schema
6. **`prisma/seed.ts`** - Category seed data
7. **`lib/supabase/client.ts`** - Browser Supabase client
8. **`lib/supabase/server.ts`** - Server Supabase client
9. **`lib/supabase/middleware.ts`** - Auth middleware utilities
10. **`lib/prisma.ts`** - Prisma client singleton
11. **`lib/utils.ts`** - UI utilities
12. **`lib/constants.ts`** - App constants
13. **`components.json`** - shadcn/ui configuration
14. **`middleware.ts`** - Next.js middleware
15. **`types/database.ts`** - Database type definitions

## Package.json Updates
Add scripts:
- `"db:push": "prisma db push"`
- `"db:seed": "tsx prisma/seed.ts"`
- `"db:studio": "prisma studio"`
- `"db:generate": "prisma generate"`

## Success Criteria
✅ Supabase project created and configured  
✅ Database schema deployed with Prisma  
✅ Authentication with Google OAuth working  
✅ Storage buckets configured with proper limits  
✅ shadcn/ui components ready to use  
✅ Development environment fully functional  
✅ All type definitions in place  
✅ Seed data loaded (categories)  

## Next Actions After Phase 1
Ready to proceed with:
- Phase 2: Core browsing UI and audio playback
- Phase 3: Full authentication flow
- Phase 4: User features implementation

## Configuration Details

### Database Schema
- **User**: Authentication and profile data
- **Category**: Pre-defined main categories (Memes, Movies, etc.)
- **Library**: User-created collections within categories
- **Sample**: Audio files uploaded to libraries
- **Favorite**: User's bookmarked samples

### Storage Configuration
- **Audio Samples**: Public bucket, 50MB limit, supports mp3/wav/mp4/ogg
- **Library Icons**: Public bucket, 2MB limit, supports jpeg/png/webp/gif

### Authentication Flow
- Google OAuth via Supabase Auth
- Session management with cookies
- Protected route middleware
- User profile synchronization

This completes the Phase 1 infrastructure setup plan with detailed implementation steps and configuration requirements.