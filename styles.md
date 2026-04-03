# Styles Guide for HR Management Web App

This document serves as the definitive reference for all visual styles, colors, backgrounds, fonts, and sizes used throughout the application. It is based on the LandingPage.tsx and Index.tsx components, which represent the primary user-facing pages. All future pages and components should adhere to these guidelines to maintain consistency.

## Theme System

The application supports both light and dark modes via a theme provider. Styles are defined using Tailwind CSS classes with custom CSS variables for dynamic theming.

### Color Palette

#### Primary Colors
- **Primary**: Used for main actions, links, and highlights
  - Light mode: Blue gradient (e.g., `gradient-primary`)
  - Dark mode: Adjusted blue gradient for contrast
- **Foreground**: Main text color
  - Light mode: Dark text (e.g., `text-foreground`)
  - Dark mode: Light text
- **Background**: Page background
  - Light mode: White/light gray (e.g., `bg-background`)
  - Dark mode: Dark gray/black
- **Card**: Card/container backgrounds
  - Light mode: White with subtle shadow (e.g., `bg-card`, `card-elevated`)
  - Dark mode: Dark with subtle shadow
- **Muted Foreground**: Secondary text
  - Light mode: Gray (e.g., `text-muted-foreground`)
  - Dark mode: Lighter gray
- **Border**: Dividers and borders
  - Light mode: Light gray (e.g., `border-border`)
  - Dark mode: Dark gray

#### Accent Colors
- **Cool Gradient**: For secondary elements (e.g., `gradient-cool`)
  - Light mode: Teal/cyan gradient
  - Dark mode: Adjusted teal/cyan
- **Warm Gradient**: For highlights (e.g., `gradient-warm`)
  - Light mode: Orange/pink gradient
  - Dark mode: Adjusted orange/pink
- **Success Gradient**: For positive states (e.g., `gradient-success`)
  - Light mode: Green gradient
  - Dark mode: Adjusted green

#### Status Colors
- **Pipeline Hired**: For open positions (e.g., `bg-pipeline-hired/10`, `text-pipeline-hired`)
  - Light mode: Green tint
  - Dark mode: Green with dark background

### Gradients
- `gradient-primary`: Primary blue gradient for buttons, icons, and key elements
- `gradient-cool`: Cool teal/cyan for secondary actions and stats
- `gradient-warm`: Warm orange/pink for highlights and recognitions
- `gradient-success`: Green for success states and completed workflows

### Typography

#### Fonts
- **Display Font**: Used for headings (e.g., `font-display`)
  - Family: Custom display font (likely a sans-serif like Inter or similar)
  - Weights: Regular, Medium, Semibold, Bold
- **Body Font**: Default text (system font stack)
  - Family: System default (sans-serif)

#### Text Sizes
- `text-xs`: 12px - Small labels, metadata (e.g., department, location)
- `text-sm`: 14px - Body text, buttons, descriptions
- `text-lg`: 18px - Section headings, large descriptions
- `text-3xl`: 30px - Page titles (e.g., "Good morning, HR Team")
- `text-4xl` to `text-6xl`: Hero headings (e.g., "Build Your Career in Healthcare")

#### Text Colors
- `text-foreground`: Primary text
- `text-muted-foreground`: Secondary text, descriptions
- `text-primary`: Links, highlights, primary actions

### Layout and Spacing

#### Cards and Containers
- `card-elevated`: Elevated cards with shadow and border
  - Padding: `p-6` (24px)
  - Border: `border-border`
  - Background: `bg-card`
- `gradient-primary p-2 rounded-xl`: Icon containers with primary gradient

#### Buttons
- Primary: `gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm`
- Secondary: `bg-muted text-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted/80`

#### Navigation
- Sticky nav: `bg-background/80 backdrop-blur-xl border-b border-border`
- Height: `h-16` (64px)

### Icons
- Size: `w-4 h-4` or `w-5 h-5` for standard icons
- Color: `text-primary` for primary, `text-muted-foreground` for secondary
- Container: Often in `bg-primary/10 p-2 rounded-lg` or similar

### Animations and Interactions
- Hover effects: `hover:opacity-90`, `hover:bg-muted/80`
- Transitions: `transition-colors`, `transition-opacity`
- Motion: Framer Motion for entrance animations (e.g., `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`)

### Specific Component Styles

#### Stat Cards (Index.tsx)
- Grid: `grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4`
- Each card: Uses StatCard component with icon, title, value, optional gradient

#### Hiring Pipeline (Index.tsx)
- Visual workflow with steps in colored boxes connected by lines

#### Landing Page Sections
- Hero: Large text with gradient background overlay
- Stats: Grid of stat cards
- About: Two-column layout with vision/values cards
- Benefits: Grid of benefit cards with icons
- Jobs: Grid of job cards with filters

### Responsive Design
- Mobile-first: Use `sm:`, `lg:`, `xl:` breakpoints
- Grid adjustments: `grid-cols-2 lg:grid-cols-3`
- Text scaling: `text-4xl sm:text-5xl lg:text-6xl`

### Dark Mode Specifics
- All colors invert appropriately
- Backgrounds become dark
- Text remains readable
- Gradients adjust for contrast
- Use `theme === 'dark'` checks where needed (e.g., theme toggle button)

This guide ensures all new components match the established design language. When in doubt, reference LandingPage.tsx and Index.tsx for implementation examples.