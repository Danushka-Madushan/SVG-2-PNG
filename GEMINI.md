# SVG-2-PNG

A high-performance, browser-based tool for converting SVG images to PNG format. The application prioritizes privacy and efficiency by performing all conversions locally using the HTML5 Canvas API.

## Project Overview

SVG-2-PNG is a specialized utility designed for developers and designers who need quick, reliable SVG-to-PNG conversions without uploading sensitive assets to third-party servers. It provides a polished, interactive interface for adjusting output dimensions while maintaining or modifying aspect ratios.

### Core Technologies
- **Framework:** React 19 (TypeScript)
- **UI Framework:** [HeroUI v3 (Beta)](https://v3.heroui.com/)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 & Framer Motion for smooth transitions.
- **Processing:** Client-side HTML5 Canvas for image generation.

## Key Features

- **Local Conversion:** All processing happens in the browser via `FileReader` and `canvas.toDataURL`.
- **Intelligent Resizing:** Automatically detects original SVG dimensions and supports aspect-ratio locking/unlocking.
- **Live Preview:** Instant visual feedback of the conversion result with dimension indicators.
- **Size Estimation:** Real-time calculation of the resulting PNG file size.
- **Clean Aesthetic:** Custom design tokens and minimalist UI primitives for a professional feel.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Commands
- **Development:** `npm run dev` (Starts Vite dev server at `localhost:5173`)
- **Build:** `npm run build` (Standard production build)
- **GitHub Pages Build:** `npm run gh-build` (Configured for deployment to GitHub Pages)
- **Linting:** `npm run lint` (ESLint with TypeScript support)

## Architecture & Structure

- `src/App.tsx`: The primary application component. It encapsulates:
    - State management for dimensions and image data.
    - SVG parsing and canvas rendering logic.
    - Custom UI primitives (NumberInput, ToggleSwitch, etc.).
- `src/Icons/`: Reusable SVG icon components (e.g., `SyncLink`, `UnLink`).
- `src/providers/`: Configuration files for external providers like HeroUI.
- `src/main.tsx`: Application entry point; handles provider wrapping (`HeroUIProvider`, `Toaster`).

## Development Conventions

- **Component Pattern:** Logic and UI are currently centralized in `App.tsx` for small-scale efficiency. For larger features, extract sub-components to `src/components/`.
- **Styling:** Uses a mix of Tailwind CSS 4 utility classes and carefully crafted inline styles for precise design token application (Palette: Background `#F5F4F2`, Accent `#1D4ED8`).
- **Security:** Ensure all file processing remains local. Never introduce network-based conversion services.
- **Types:** Strict TypeScript usage is required for all new logic and components.
