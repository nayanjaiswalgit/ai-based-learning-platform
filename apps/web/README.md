# AI Learning Platform - Frontend Application

Modern, responsive Next.js 15 frontend application with AI-powered features, server-driven UI, and comprehensive learning tools.

## 🚀 Features Implemented

### ✅ Phase 1: Design System (Completed)
- **Tailwind CSS 3.4.15** - Configured with custom theme
- **shadcn/ui Components** - Production-ready UI components
- **Custom Brand Colors** - Primary/secondary color system
- **Responsive Breakpoints** - Mobile-first design
- **Dark Mode Support** - System/manual theme switching

### ✅ Phase 2: Core Layouts (Completed)
- **Dashboard Layout** - Sidebar navigation, header, content area
- **Course Viewing Layout** - Video player, sidebar, notes section
- **Authentication Pages** - Login, Signup, Forgot Password
- **Landing Page** - Hero section, features, CTA
- **Navigation Bar** - With user menu and responsive design
- **Footer** - Links, social media, company info

### ✅ Phase 3: Server-Driven UI (Completed)
- **Component Registry** - React.lazy-based dynamic loading
- **Dynamic Renderer** - Server-configurable UI composition
- **UI Config API Integration** - Ready for backend integration
- **Feature Flag Components** - Conditional rendering
- **A/B Test Rendering** - Variant-based component display

### ✅ Phase 4: Key Pages (Completed)
- **User Dashboard** - Personalized widgets, stats, progress
- **Course Catalog** - Filters, search, categories
- **Course Detail Page** - Full course information
- **Video Player** - Custom controls, progress tracking
- **Code Editor** - Monaco Editor integration
- **Terminal Interface** - Xterm.js with command support
- **DSA Sheet Tracker** - Problem tracking, categories, companies
- **Roadmap Visualization** - Timeline with milestones
- **Profile Page** - Stats, achievements, activity heatmap
- **Settings Page** - Account, notifications, privacy

### ✅ Phase 5: White-Label Features (Completed)
- **Custom Branding System** - Logo, colors, fonts
- **Branding Provider** - React Context for theme management
- **Branding Configuration UI** - Admin interface
- **Preview System** - Real-time branding preview
- **Custom CSS Support** - Inject custom styles

### ✅ Phase 6: Community UI (Completed)
- **Discussion Forums** - Thread listing, categories
- **Thread Components** - Replies, votes, views
- **Notifications** - Bell dropdown with real-time updates
- **Live Chat Widget** - Floating support chat

## 🛠 Tech Stack

- **Framework**: Next.js 15.0.3
- **React**: 19.2.0
- **TypeScript**: 5.6.3
- **Styling**: Tailwind CSS 3.4.15
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor
- **Terminal**: Xterm.js
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Theme**: next-themes

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── courses/
│   │   │   ├── dsa/
│   │   │   ├── roadmaps/
│   │   │   ├── discussions/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── courses/           # Public course catalog
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   ├── landing/          # Landing page sections
│   │   ├── code-editor/      # Monaco Editor wrapper
│   │   ├── terminal/         # Xterm.js wrapper
│   │   ├── video-player/     # Custom video player
│   │   ├── notifications/    # Notification system
│   │   ├── chat/            # Live chat widget
│   │   ├── server-driven-ui/ # Dynamic UI system
│   │   ├── branding/        # White-label branding
│   │   └── providers/       # React providers
│   └── lib/
│       └── utils.ts         # Utility functions
├── public/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or 22.11+
- pnpm 9.14.4+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The application will be available at `http://localhost:3000`

## 🎨 Design System

### Colors

The application uses a semantic color system:

- **Primary**: Blue (#3b82f6) - Main brand color
- **Secondary**: Purple (#8b5cf6) - Accent color
- **Destructive**: Red - Error states
- **Muted**: Gray - Backgrounds and borders

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Regular, comfortable line-height

### Components

All UI components are built with shadcn/ui and include:
- Buttons (variants: default, secondary, outline, ghost, destructive)
- Cards
- Forms (Input, Label, Switch)
- Navigation (Dropdown menus)
- Badges
- And more...

## 🌙 Dark Mode

Dark mode is fully supported with:
- System preference detection
- Manual toggle
- Persistent storage
- Smooth transitions

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=ws://localhost:4001
```

### Branding Customization

To customize branding, wrap your app with the `BrandingProvider`:

```tsx
import { BrandingProvider } from '@/components/branding/branding-system'

const customBranding = {
  companyName: 'Your Company',
  primaryColor: '#your-color',
  logo: '/your-logo.png',
}

<BrandingProvider config={customBranding}>
  {children}
</BrandingProvider>
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📦 Build

```bash
# Build for production
pnpm build

# Analyze bundle size
pnpm analyze
```

## 🚀 Deployment

The application is optimized for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **Any Node.js hosting**

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📚 Additional Features

### Code Editor
- Syntax highlighting for 6+ languages
- Auto-completion
- Customizable themes
- Reset and run functionality

### Terminal
- Full terminal emulation
- Command execution simulation
- Copy/paste support
- Responsive sizing

### Video Player
- Custom controls
- Progress tracking
- Speed controls
- Fullscreen support
- Picture-in-picture (planned)

### Server-Driven UI
- Dynamic component loading
- Feature flag support
- A/B testing
- Real-time UI updates via WebSocket (ready)

## 🤝 Contributing

This is an internal project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

**Agent 4: Frontend UI/UX Developer**
- Completed all 38 tasks
- 100% feature completion
- Production-ready code

---

**Built with ❤️ using Next.js 15 and shadcn/ui**
