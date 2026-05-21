# Contributing to Arduino Simulator

Thank you for contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js v18+
- npm

### Setup

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Set up the database
cd server && npm run db:generate && npm run db:migrate && npm run db:seed && cd ..
```

### Development

```bash
# Start the frontend dev server
npm run start

# Start the backend (in a separate terminal)
cd server && npm run dev
```

## Project Structure

```
src/                    # Frontend React application
  components/           # Reusable UI components
  screens/              # Page-level components
  contexts/             # React context providers
  admin/                # Admin dashboard (reports, analytics)
  hooks/                # Custom React hooks
  utils/                # Utility functions (interpreter, editor, tracking)
server/                 # Backend Express API
  src/
    routes/             # API route handlers
    middleware/         # Auth, error handling
    services/           # Business logic (tracking, reports, cache)
    utils/              # Database, seeding
  prisma/               # Database schema and migrations
__tests__/              # Frontend tests
```

## Making Changes

1. **Create a branch** from `main`
2. **Make your changes** — keep commits focused and atomic
3. **Run the pre-commit checks** manually before committing:
   ```bash
   npm run build && npm run lint && npm run prettier && npm run check-types
   npm run test:dependency && npm run test:benchmark && npm run test:unit && npm run test:e2e
   ```
4. **Push and open a Pull Request**

## Testing

```bash
# Run all tests (same as pre-commit hook)
npm run test

# Run unit tests only
npm run test:unit

# Run E2E tests only (requires dev server running)
npm run test:e2e

# Run backend tests
cd server && npm test

# Run tests with coverage
npm run test:unit -- --coverage
```

Coverage reports are generated in `coverage/` after running with `--coverage`.

## Code Style

- ESLint + Prettier are enforced via pre-commit hook
- No `console` statements — use `src/utils/logger.ts` instead
- TypeScript for all new code
- Components should be focused and single-purpose

## Architecture Notes

- **Simulator**: Arduino sketches are converted via regex replacements and executed in a Web Worker using JSCPP
- **State management**: React Context (`SimulatorContext`, `TrackingContext`)
- **Admin analytics**: Reports are lazy-loaded with React.lazy + Suspense for performance
- **Database**: SQLite with Prisma ORM

## Known Limitations

- JSCPP does not support C++ `static` local variables (stripped as workaround)
- EEPROM is in-memory only (no persistence across sessions)
- Test files use `.js` extension (TypeScript benefits not available in tests)
