# Kumpan Starter

A modern Next.js starter with Prismic CMS and internationalization support.

## Tech Stack

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[Prismic](https://prismic.io/)** - Headless CMS
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[pnpm](https://pnpm.io/)** - Fast package manager

## Features

- 🌐 **Internationalization** - See src/lib/locales for localization. Match this with the locales in Prismic.
- 🎨 **Slice Machine** - Component-based content modeling
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Performance Optimized** - Server-side rendering and static generation
- 🔍 **SEO Ready** - Dynamic meta tags and proper HTML lang attributes

## Getting Started

### Prerequisites

- Node.js v22.18.0 (use `nvm use` to switch to the correct version)
- Corepack enabled

### Development Setup

1. **Switch to the correct Node.js version**

   ```bash
   nvm use
   ```

2. **Enable Corepack**

   ```bash
   corepack enable
   ```

3. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kumpan-starter
   ```

4. **Install dependencies** (this will automatically use the correct pnpm version)

   ```bash
   pnpm install
   ```

5. **Set up Prismic**
   - Create a new repository at [prismic.io](https://prismic.io/dashboard)
   - Copy your repository name to `slicemachine.config.json`
   - Set up your locales in Prismic (Swedish as master, English as secondary)

6. **Start development server**

   ```bash
   pnpm dev
   ```

Your site will be available at `http://localhost:3000` and Slice Machine will automatically start at `http://localhost:9999`

### Creating New Slices

To create a new slice with basic intro section fields:

1. **Create a new slice**

   ```bash
   pnpm create-slice MySliceName
   ```

2. **Open Slice Machine UI** and make a small change to the slice (like updating the screenshot)

3. **Save the changes** - Slice Machine will automatically update the Prismic types

The slice will be created with:

- Callout field
- Title field
- Description field
- Buttons field
- Tinted background toggle
- Basic component structure using `SectionIntro`

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm slicemachine` - Start Slice Machine
- `pnpm create-slice <name>` - Create a new slice with basic intro fields
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Documentation

- [Prismic Documentation](https://prismic.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Slice Machine Guide](https://prismic.io/docs/slice-machine)
