# ProfGui - Tutoring Platform for Guinea

## Overview

ProfGui is a web-based tutoring platform designed specifically for Guinea Conakry's educational system. The platform connects students and parents with qualified teachers for in-person or online tutoring sessions. It features role-based registration (student, parent, teacher), teacher approval workflows, and admin management capabilities. The platform is built with a mobile-first, responsive design optimized for low-bandwidth environments, with direct contact integration via WhatsApp and phone.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens, dark/light theme support
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Session Management**: Express-session with server-side storage
- **API Design**: RESTful JSON API under `/api` prefix
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command
- **Validation**: Zod schemas generated from Drizzle schema via drizzle-zod

### Authentication & Authorization
- **Session-based auth**: Cookie-based sessions with `express-session`
- **Role system**: Four roles - student, parent, teacher, admin
- **Teacher approval**: Pending/approved/rejected workflow managed by admin
- **Middleware**: `requireAuth` and `requireAdmin` middleware for route protection

### Key Design Patterns
- **Shared Types**: Schema definitions shared between frontend and backend via `@shared` alias
- **Storage Interface**: Abstract `IStorage` interface in `server/storage.ts` for data operations
- **Query Pattern**: TanStack Query with custom `apiRequest` helper for mutations
- **Component Composition**: Layout wrapper pattern with Header/Footer components

### Project Structure
```
client/src/          # React frontend
  components/        # Reusable UI components
  components/ui/     # shadcn/ui primitives
  pages/            # Route page components
  hooks/            # Custom React hooks
  lib/              # Utilities (queryClient, utils)
server/             # Express backend
  routes.ts         # API route definitions
  storage.ts        # Database operations
  db.ts             # Database connection
shared/             # Shared code (schema, types)
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management

### Frontend Libraries
- **Radix UI**: Accessible component primitives (dialog, select, tabs, etc.)
- **Lucide React**: Icon library
- **react-icons**: Additional icons (WhatsApp via `SiWhatsapp`)
- **date-fns**: Date formatting utilities
- **embla-carousel-react**: Carousel component
- **vaul**: Drawer component
- **cmdk**: Command palette component
- **recharts**: Charting library

### Backend Libraries
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store (available but may not be active)
- **zod**: Runtime validation

### External Services
- **WhatsApp Integration**: Direct links to WhatsApp for teacher-student contact
- **Phone Integration**: Direct tel: links for calling

### Fonts
- **Google Fonts**: Roboto and Open Sans loaded via CDN

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner (dev only)