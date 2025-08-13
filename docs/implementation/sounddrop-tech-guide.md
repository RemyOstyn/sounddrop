# SoundDrop Technical Implementation Guide

## 🏗️ Project Structure

```
sounddrop/
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── components.json          # shadcn/ui config
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts             # Seed script for categories
├── public/
│   ├── favicon.ico
│   └── sounds/             # Local dev samples (gitignored)
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   ├── samples/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── play/route.ts
│   │   ├── libraries/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── upload/
│   │       ├── audio/route.ts
│   │       └── icon/route.ts
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── logout/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── favorites/page.tsx
│   │   ├── my-libraries/page.tsx
│   │   └── upload/page.tsx
│   ├── category/
│   │   └── [slug]/page.tsx
│   ├── library/
│   │   └── [id]/page.tsx
│   └── trending/page.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── header.tsx
│   ├── audio/
│   │   ├── sample-card.tsx
│   │   ├── audio-player.tsx
│   │   └── play-button.tsx
│   ├── library/
│   │   ├── library-card.tsx
│   │   ├── library-grid.tsx
│   │   └── create-library-dialog.tsx
│   └── auth/
│       ├── login-button.tsx
│       └── user-menu.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── use-audio.ts
│   ├── use-auth.ts
│   └── use-favorites.ts
└── types/
    ├── database.ts
    └── supabase.ts
```

---

## 🔐 Environment Variables

### `.env.example`
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sounddrop"
DIRECT_URL="postgresql://postgres:password@localhost:5432/sounddrop"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google OAuth (via Supabase)
# Configure in Supabase Dashboard

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# File Upload Limits
MAX_AUDIO_SIZE_MB="10"
MAX_ICON_SIZE_MB="2"
ALLOWED_AUDIO_TYPES="audio/mpeg,audio/wav,audio/mp3"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"
```

---

## 💾 Database Schema (Prisma)

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  favorites     Favorite[]
  libraries     Library[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
}

model Category {
  id            String    @id @default(cuid())
  name          String    @unique
  slug          String    @unique
  icon          String    // Lucide icon name
  description   String?
  libraries     Library[]
  order         Int       @default(0)
  createdAt     DateTime  @default(now())

  @@index([slug])
}

model Library {
  id            String    @id @default(cuid())
  name          String
  description   String?
  iconUrl       String?   // Supabase storage URL
  userId        String
  categoryId    String
  isPublic      Boolean   @default(true)
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category      Category  @relation(fields: [categoryId], references: [id])
  samples       Sample[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([categoryId])
}

model Sample {
  id            String    @id @default(cuid())
  name          String
  fileUrl       String    // Supabase storage URL
  duration      Float     // in seconds
  fileSize      Int       // in bytes
  mimeType      String
  libraryId     String
  library       Library   @relation(fields: [libraryId], references: [id], onDelete: Cascade)
  playCount     Int       @default(0)
  favorites     Favorite[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([libraryId])
  @@index([playCount])
}

model Favorite {
  id            String    @id @default(cuid())
  userId        String
  sampleId      String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sample        Sample    @relation(fields: [sampleId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  
  @@unique([userId, sampleId])
  @@index([userId])
  @@index([sampleId])
}
```

---

## 🔧 Technical Stack Details

### Core Dependencies
```json
{
  "dependencies": {
    "@prisma/client": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@radix-ui/react-*": "latest",
    "lucide-react": "latest",
    "tailwindcss": "^3.x",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x"
  }
}
```

---

## 📋 Implementation Checklist

### Phase 1: Setup & Infrastructure
- [ ] Initialize Next.js project with TypeScript
- [ ] Setup Prisma with PostgreSQL
- [ ] Configure Supabase project
- [ ] Install and configure shadcn/ui
- [ ] Setup environment variables
- [ ] Create database schema and run migrations
- [ ] Implement seed script for categories
- [ ] Setup Supabase Storage buckets (audio, icons)

### Phase 2: Core Features
- [ ] Implement layout with sidebar navigation
- [ ] Create sample browsing pages
- [ ] Build audio player component
- [ ] Implement play tracking
- [ ] Add search functionality
- [ ] Create trending algorithm (based on recent plays)

### Phase 3: Authentication
- [ ] Setup Supabase Auth with Google OAuth
- [ ] Create auth middleware
- [ ] Build login/logout flow
- [ ] Implement protected routes
- [ ] Add user menu component

### Phase 4: User Features
- [ ] Build favorites system
- [ ] Create library management
- [ ] Implement sample upload
- [ ] Add icon upload for libraries
- [ ] Build "My Libraries" page

### Phase 5: Optimization
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Setup CDN for audio files
- [ ] Add PWA manifest
- [ ] Optimize for mobile performance

---

## 🚀 Deployment Configuration

### Vercel Deployment
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Environment Variables (Production)
- Set all variables from `.env.example` in Vercel dashboard
- Configure Supabase environment for production
- Update `NEXT_PUBLIC_APP_URL` to production domain

---

## 📱 Mobile Optimization

### Key Considerations
1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Viewport**: Configure proper viewport meta tag
3. **Audio Preloading**: Implement lazy loading for audio files
4. **Offline Support**: Cache recently played samples
5. **Performance**: Use Next.js Image for library icons

### PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // Next.js config
})
```

---

## 🔒 Security Implementation

### File Upload Validation
- Client-side file type validation
- Server-side MIME type verification
- File size limits enforcement
- Virus scanning integration (optional)

### Rate Limiting
- Implement rate limiting on upload endpoints
- Use Supabase RLS for database security
- Add CORS configuration for API routes

### Authentication Security
- Session management via Supabase
- Secure cookie configuration
- CSRF protection built into Next.js

---

## 🧪 Testing Strategy

### Unit Tests
- Audio player hooks
- Utility functions
- API route handlers

### Integration Tests
- Authentication flow
- File upload process
- Sample playback

### E2E Tests
- User journey from browse to play
- Upload and library creation
- Mobile responsive behavior

---

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Page load performance
- Audio playback success rate
- Upload success/failure rates
- API response times
- Error rates by page

### Recommended Tools
- Vercel Analytics (built-in)
- Sentry for error tracking
- Supabase Dashboard for database metrics