# SoundDrop 🎵

A modern, mobile-first soundboard application built with Next.js 15, featuring beautiful iOS-inspired design, multi-sample audio playback, and privacy-first user authentication.

## ✨ Features

- **🎵 Audio System**: Multi-sample playback with real-time waveform visualization
- **🔐 Privacy-First Auth**: Google OAuth with username-based identity protection
- **📚 Content Management**: Browse samples by category, trending algorithm, infinite scroll
- **👤 User Features**: Favorites, library creation, audio uploads, settings management
- **📱 Mobile Experience**: Glassmorphism UI, touch-optimized, responsive design

## 🚀 Quick Start

```bash
# Clone and install
npm install

# Set up environment (copy .env.example to .env.local)
# Configure Supabase credentials

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Auth & Storage**: Supabase (Google OAuth, file storage)
- **UI Components**: shadcn/ui with custom glassmorphism design
- **State Management**: Zustand with persistence

## 📝 Development

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run lint         # Code linting
npm run db:studio    # Database browser
npm run db:generate  # Regenerate Prisma client
```

## 📖 Documentation

- **CLAUDE.md**: Complete developer guide and architecture documentation
- **docs/setup/**: Environment setup and configuration guides
- **docs/plans/**: Implementation plans for all development phases

## 🏗 Architecture

SoundDrop follows a modern full-stack architecture with:
- Server-side rendering and API routes
- Privacy-first user authentication with auto-generated usernames
- Real-time audio visualization and multi-sample playback
- File upload system with validation and rate limiting
- Responsive glassmorphism design system
