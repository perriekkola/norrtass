# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Next.js and Slice Machine concurrently
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm slicemachine` - Start Slice Machine UI at http://localhost:9999
- `pnpm create-slice <name>` - Create new slice with basic intro fields using custom script

## Architecture Overview

### Tech Stack
- **Next.js 15** with App Router and TypeScript
- **Prismic CMS** as headless CMS with Slice Machine
- **pnpm** as package manager (v10.15.0 via Corepack)
- **Node.js v22.18.0** (use `nvm use`)

### Internationalization
- **Master locale**: `sv-se` (Swedish)
- **Secondary locale**: `en-us` (English)
- Locale configuration in `src/lib/locales.ts`
- URL structure: `/{locale}/{path}` (default locale omits prefix)
- Middleware handles locale detection and URL rewriting

### Prismic Integration
- Repository name configured in `slicemachine.config.json`
- Slice components in `src/slices/` directory
- Custom types defined in `customtypes/` directory
- CMS data fetching through `src/lib/cms.ts` with caching for hreflang URLs
- Preview functionality at `/api/preview` and `/api/exit-preview`

### Key Architecture Patterns
- **Layout System**: Global layout with Navbar, Footer, and CookieBanner fetched from Prismic
- **Context Providers**: Cart context and Cookie banner context wrap the application
- **Theme System**: Next-themes with system/light/dark modes
- **Component Structure**: 
  - UI components in `src/components/ui/` (shadcn/ui based)
  - Layout components in `src/components/layout/`
  - Motion primitives in `src/components/motion-primitives/`

### Stripe Integration
- Product management through Stripe API
- Checkout flow via `/api/stripe/checkout`
- Product data hooks in `src/hooks/use-stripe-product.ts`

### Slice Machine Workflow
1. Create slice: `pnpm create-slice <name>` (auto-generates with intro fields)
2. Edit in Slice Machine UI at localhost:9999
3. Save changes to sync Prismic types
4. Implement component in `src/slices/<SliceName>/index.tsx`

### URL Structure & Routing
- Catch-all routing via `[[...slug]]/page.tsx`
- Nested page support with parent-child relationships
- URL validation in `src/lib/cms.ts` ensures correct hierarchical structure
- Hreflang generation with caching for multilingual SEO
- Always use cn util for conditonal classNames, not template literals
- Use the Tailwind className size-X instead of w-X + h-X if the width and height is the same on elements
- Don't add margins to icons inside the <Button /> component. This is handled inside the component itself.