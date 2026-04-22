# Project Overview: SVG-2-PNG

A high-performance, browser-native SVG to PNG conversion utility built with React 19, Vite, and HeroUI. This application allows users to upload SVG files, adjust dimensions (with optional aspect ratio locking), and export them as PNG images directly in the browser using HTML5 Canvas.

## Core Technologies

- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 8
- **UI Components:** [HeroUI](https://heroui.com/) (formerly NextUI)
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **State Management:** React Hooks (`useState`, `useRef`, `useCallback`, `useEffect`)

## Architecture & Logic

- **Browser-Native Processing:** Conversions happen entirely on the client side using the Canvas API. No data is sent to a server.
- **SVG Parsing:** `DOMParser` is used to extract initial resolution from the SVG's `width`, `height`, or `viewBox` attributes.
- **Rendering Strategy:** Uses a base64-encoded data URI for SVG-to-Canvas rendering to ensure all external references (gradients, masks) are resolved before drawing.
- **Aspect Ratio Locking:** Implements bi-directional synchronization of width and height based on the original image's aspect ratio.

## Building and Running

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Static Analysis & Linting
```bash
npm run lint
```

### GitHub Pages Build
```bash
npm run gh-build
```

## Development Conventions

- **File Structure:**
  - `src/App.tsx`: Main application container and logic.
  - `src/Icons/`: Custom SVG icon components.
  - `src/providers/`: HeroUI provider configuration.
- **Styling:** Uses a mix of Tailwind CSS utility classes and inline styles with CSS-in-JS design tokens (defined in `App.tsx`) for high-fidelity UI control.
- **Code Style:** Strictly typed with TypeScript. ESLint is configured to enforce quality standards (warnings treated as errors in production builds).
- **Asynchronous Rendering:** `ConvertSVG2PNG` utilizes `requestAnimationFrame` to ensure the SVG renderer has fully composited before the canvas snapshot is taken.
