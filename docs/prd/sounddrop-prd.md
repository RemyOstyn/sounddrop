# Product Requirements Document (PRD)
## SoundDrop - The Pocket Soundboard

### Executive Summary
SoundDrop is a mobile-first web application that allows users to instantly access and play audio samples during social moments. Users can browse community-uploaded sounds, create custom libraries with icons, and have their favorite sounds always at their fingertips.

**Vision**: "Pull out phone → Find sound → Click to play → Make friends laugh"

---

## 🎯 Core User Stories

### As a Visitor (Not Logged In)
- I can browse all public samples and libraries
- I can play any sample by clicking on it
- I can search samples by name
- I can view trending samples
- I can see a login prompt when trying to favorite/upload

### As a Registered User
- I can do everything a visitor can
- I can favorite samples for quick access
- I can create custom libraries with uploaded icons
- I can upload samples to my libraries
- I can organize my libraries under main categories

---

## 📱 Core Features (MVP)

### 1. Browse & Play
- **Instant Playback**: One-click play on any sample
- **Visual Feedback**: Show playing state with animation
- **Categories**: Pre-defined main categories (Memes, Movies, TV Shows, Games, Reactions, etc.)
- **Search**: Simple text search by sample name

### 2. Libraries System
- **User Libraries**: Custom collections with uploaded icon/image
- **Library Organization**: Each library belongs to one main category
- **Visual Identity**: Each library shows its icon for easy recognition (e.g., Mickey Mouse icon for Disney sounds)

### 3. Authentication
- **Google OAuth**: Simple one-click login
- **Persistent Sessions**: Stay logged in across devices

### 4. User Actions (Logged In Only)
- **Favorite Samples**: Quick access to loved sounds
- **Upload Samples**: Add sounds to personal libraries
- **Create Libraries**: Make new collections with custom icons

---

## 🏗️ Information Architecture

### Navigation Structure (Left Sidebar)
```
🏠 Home (All Samples)
🔥 Trending
📁 Categories
   └── Memes
   └── Movies
   └── TV Shows
   └── Games
   └── Reactions
   └── [More...]
❤️ My Favorites (auth required)
📤 My Libraries (auth required)
```

### Page Structure
```
/ (Home)
├── /trending
├── /category/[slug]
├── /library/[id]
├── /favorites (protected)
├── /my-libraries (protected)
└── /upload (protected)
```

---

## 💾 Database Schema

### Core Tables

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  favorites     Favorite[]
  libraries     Library[]
  createdAt     DateTime  @default(now())
}

model Category {
  id            String    @id @default(cuid())
  name          String    @unique
  slug          String    @unique
  icon          String    // Lucide icon name
  libraries     Library[]
  order         Int       @default(0)
}

model Library {
  id            String    @id @default(cuid())
  name          String
  iconUrl       String?   // Custom uploaded icon
  userId        String
  categoryId    String
  user          User      @relation(fields: [userId], references: [id])
  category      Category  @relation(fields: [categoryId], references: [id])
  samples       Sample[]
  createdAt     DateTime  @default(now())
}

model Sample {
  id            String    @id @default(cuid())
  name          String
  fileUrl       String
  duration      Float     // in seconds
  libraryId     String
  library       Library   @relation(fields: [libraryId], references: [id])
  playCount     Int       @default(0)
  favorites     Favorite[]
  createdAt     DateTime  @default(now())
}

model Favorite {
  id            String    @id @default(cuid())
  userId        String
  sampleId      String
  user          User      @relation(fields: [userId], references: [id])
  sample        Sample    @relation(fields: [sampleId], references: [id])
  createdAt     DateTime  @default(now())
  
  @@unique([userId, sampleId])
}
```

---

## 🎨 UI/UX Guidelines

### Design Principles
1. **Speed First**: Every interaction should feel instant
2. **Thumb-Friendly**: All buttons easily reachable on mobile
3. **Visual Clarity**: Clear icons and labels for libraries
4. **Modern & Clean**: Similar to Spotify/TikTok aesthetic

### Key UI Elements
- **Sample Card**: Shows name, duration, play button, favorite button
- **Library Card**: Shows custom icon, name, sample count
- **Play Button**: Large, centered, with visual feedback
- **Loading States**: Skeleton screens for smooth experience

### Mobile Considerations
- Bottom tab bar for primary navigation on mobile
- Swipe gestures for browsing
- Large touch targets (minimum 44x44px)

---

## 📊 Success Metrics

### Primary KPIs
- **Daily Active Users (DAU)**
- **Samples Played per Session**
- **Upload Rate** (samples per user per week)

### Secondary KPIs
- **Favorite Rate** (% of plays that result in favorite)
- **Library Creation Rate**
- **Return User Rate** (7-day retention)

---

## 🚫 Out of Scope for v1

- User profiles/social features
- Comments on samples
- Private libraries
- Download functionality
- Sample packs/bulk operations
- Following system
- Notifications
- Analytics dashboard
- Admin panel
- Content moderation tools
- API access
- Monetization features

---

## 🚀 Launch Phases

### Phase 1: Core Browsing (Week 1-2)
- Setup infrastructure
- Implement browse & play functionality
- Basic categories
- Mobile responsive design

### Phase 2: Authentication (Week 3)
- Google OAuth integration
- User sessions
- Favorites functionality

### Phase 3: Content Creation (Week 4-5)
- Library creation
- Sample upload
- Icon upload for libraries

### Phase 4: Discovery (Week 6)
- Search implementation
- Trending algorithm
- Play count tracking

---

## 🔒 Security & Privacy Considerations

- All uploads scanned for malware
- Audio files limited to 10MB
- Icon files limited to 2MB
- Rate limiting on uploads (10 per hour)
- GDPR compliant data handling
- Clear Terms of Service for content uploads

---

## 🌍 Future Considerations (Post-MVP)

- **Social Features**: Follow users, share libraries
- **Advanced Audio**: Trim samples, adjust volume
- **Monetization**: Pro tier with unlimited uploads
- **Platform Integration**: Discord bot, browser extension
- **Analytics**: Creator dashboard with play statistics
- **Moderation**: Community reporting, AI content detection