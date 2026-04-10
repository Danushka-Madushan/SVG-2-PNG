# GEMINI.md

## Project Overview

**SVG to PNG Converter** is a modern, responsive web application built with **React 19**, **TypeScript**, and **Vite 8**. It allows users to upload SVG files, resize them (with optional aspect ratio synchronization), and download the resulting image as a PNG.

### Core Technologies
- **Frontend Framework:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [HeroUI v2](https://heroui.com/) (formerly NextUI)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Utility Libraries:** `react-hot-toast` for notifications.

### Architecture
The project follows a standard Vite-based React application structure:
- **`src/main.tsx`**: The entry point, which wraps the application with the `HeroUIProvider` and `Toaster`.
- **`src/App.tsx`**: The main application logic, including file handling, SVG parsing, canvas rendering, and the primary UI.
- **`src/Icons/`**: Contains custom SVG icon components (`SyncLink`, `UnLink`).
- **`src/index.css`**: Global styles and Tailwind CSS directives.
- **`public/`**: Static assets like the favicon.

## Building and Running

### Development
Start the development server with hot-module replacement (HMR):
```bash
npm run dev
```

### Build
Create a production-ready build in the `dist/` directory:
```bash
npm run build
```

### GitHub Build
Build specifically for GitHub Pages using the `vite.config.github.js` configuration:
```bash
npm run gh-build
```

### Linting
Check for code quality and style issues:
```bash
npm run lint
```

### Preview
Locally preview the production build:
```bash
npm run preview
```

## Development Conventions

### Coding Style
- **Functional Components:** All components are written as functional components using React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
- **TypeScript:** Use TypeScript for all source files to ensure type safety.
- **State Management:** Local state is managed using React's `useState`. For complex logic, `useCallback` and `useEffect` are used to manage side effects and optimize performance.
- **Styling:** Use Tailwind CSS utility classes directly in the components. Custom HeroUI styles are applied via the `classNames` prop when necessary.

### Key Logic
- **SVG Parsing:** Uses `DOMParser` to extract dimensions (`width`, `height`, `viewBox`) from uploaded SVG strings.
- **Conversion:** Utilizes an HTML5 `<canvas>` element to render SVG data and export it as a PNG data URL (`canvas.toDataURL('image/png')`).
- **Aspect Ratio:** Logic for maintaining aspect ratio is centralized in the `ResizeResolution` function and managed by the `SyncAspectRatio` state.

### UI/UX
- **HeroUI:** Standardized UI components (Button, Input, Switch, Link) are sourced from `@heroui/react`.
- **Toasts:** Use `react-hot-toast` for providing feedback on file uploads and conversion status.
