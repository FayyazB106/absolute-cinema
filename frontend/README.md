# Absolute Cinema Frontend

The modern, responsive frontend for the Absolute Cinema cinema website, built with React and TypeScript. This application provides both a public-facing website for browsing movies and a powerful admin dashboard for content management.

## Overview

The frontend is a unified React application serving two distinct experiences:

### 🎬 Main Website
A public-facing movie discovery and browsing platform where users can:
- Browse and search the movie database
- View detailed movie information
- Check maturity ratings

**Design Philosophy**: Material UI

### 📊 Dashboard
A comprehensive administrative interface for managing platform content:
- CRUD operations for movies, actors, directors, and more.
- Content management and curation

**Design Philosophy**: Traditional React UI.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Internationalization**: i18n for multi-language support
- **UI Components**: Custom component library and Tailwind CSS for dashboard and Material UI main website
- **Routing**: React Router for navigation

## Project Structure

```
src/
├── api/              # API integration layer
├── assets/           # Static assets (images, icons, etc.)
├── components/       # Reusable React components
├── constants/        # Application constants
├── layouts/          # Layout components
├── locales/          # Internationalization files
├── pages/            # Page components for different routes
├── services/         # Business logic services
├── theme.ts          # Theme configuration
├── i18n.ts           # i18n setup
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main App component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API endpoint** (if needed):
   Update the API base URL in your environment or API configuration file.

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

```bash
# Start development server with hot module replacement
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

## API Integration

The frontend communicates with the backend API through the services layer in `src/services/` and API integration layer in `src/api/`. Ensure the backend server is running before using the application.

**Backend URL**: http://localhost:8000 (default)