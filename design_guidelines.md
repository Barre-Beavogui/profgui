# ProfGui Design Guidelines

## Design Approach
**System-Based Approach** using Material Design principles, optimized for accessibility, simplicity, and low-bandwidth environments. Focus on clarity, trust-building, and mobile-first design for the Guinean market.

## Typography System

**Font Stack**: Roboto (Google Fonts) for clean, legible interface
- **Headings**: Roboto Bold
  - H1: text-4xl (hero sections)
  - H2: text-3xl (page sections)
  - H3: text-2xl (cards, profiles)
- **Body Text**: Roboto Regular, text-base to text-lg for readability on mobile
- **Labels/Meta**: Roboto Medium, text-sm
- **Buttons**: Roboto Medium, text-base

## Layout System

**Spacing Units**: Tailwind units of 4, 6, 8, 12, 16 for consistent rhythm (p-4, m-8, gap-6, etc.)

**Container Strategy**:
- Page containers: max-w-7xl with px-4 md:px-8
- Content sections: py-12 md:py-16
- Cards/Forms: p-6 md:p-8
- Tight spacing: gap-4
- Comfortable spacing: gap-8

**Grid System**:
- Mobile: Single column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3 columns for cards (lg:grid-cols-3)

## Component Library

### Navigation
- Sticky header with clear logo placement
- Mobile: Hamburger menu with large touch targets (min 44px)
- Desktop: Horizontal navigation with prominent CTA buttons
- Quick access: WhatsApp/Phone icons always visible

### Hero Section
- Full-width, 70vh on desktop, auto-height on mobile
- Centered content with max-w-4xl
- Large headline (text-4xl md:text-5xl)
- Clear 3-step process explanation with icons
- Dual CTAs: "Trouver un professeur" (primary) + "Devenir professeur" (secondary)
- **Hero Image**: Warm, authentic photo of Guinean students/teachers in learning environment (right side on desktop, background on mobile with overlay)

### Cards
- Elevated shadow (shadow-md) with rounded corners (rounded-lg)
- Consistent padding (p-6)
- Clear hierarchy: Icon → Title → Description → Action
- Professor cards: Photo, name, subjects, experience, contact button

### Forms
- Generous spacing between fields (space-y-6)
- Large input fields with clear labels above
- Visible focus states with thick borders
- Helper text below inputs when needed
- Role selection: Large radio cards with icons (grid-cols-1 md:grid-cols-3)
- Dropdowns for: Ville, Matières, Niveaux (pre-populated)
- Clear submit buttons (w-full on mobile)

### Admin Dashboard
- Clean table layout with alternating row backgrounds
- Large, icon-labeled action buttons (Valider/Refuser/Supprimer)
- Status badges with clear visual states
- Summary cards at top: Total Students, Active Teachers, Pending Requests
- Minimal navigation sidebar with icons + text

### Trust Elements
- Testimonial cards: 2-column grid, rounded with soft shadows
- Teacher verification badges
- Parent-friendly language throughout
- WhatsApp/Phone click-to-contact buttons with country code (+224)

## Images

**Required Images**:
1. **Hero**: Authentic Guinean classroom/tutoring scene (1200x800px min)
2. **How It Works**: Three icon illustrations for process steps
3. **Teacher Profiles**: Placeholder avatars initially (circular, 120x120px)
4. **Testimonials**: Parent/student photos (optional, can use initials in circles)

**Placement**: Hero section uses large background image with text overlay and blurred button backgrounds

## Accessibility & Performance

- Minimum touch targets: 44px height for mobile
- High contrast text (WCAG AA minimum)
- Loading states for slow connections
- Progressive image loading
- Clear error messages in French
- Keyboard navigation support
- Semantic HTML structure

## Key Screens Layout

**Homepage**: Hero → How It Works (3 columns) → Find Teacher CTA → Testimonials (2 columns) → Contact Footer

**Registration**: Role selection cards → Multi-step form with progress indicator → Confirmation

**Teacher Listing**: Search filters (sidebar on desktop, collapsible on mobile) → Grid of teacher cards → Pagination

**Admin Dashboard**: Sidebar navigation → Stats cards → Tables with inline actions → No modals, use simple page transitions

## Interaction Patterns
- Minimal animations (fade-ins only)
- Instant feedback on form submissions
- Clear loading indicators
- Toast notifications for success/error states
- No complex hover states (mobile-first)