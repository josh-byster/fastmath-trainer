# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code linting
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
```

### Testing
```bash
npm test                 # Run tests in watch mode
npm run test:unit        # Run unit tests once
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Cypress e2e tests headless
npm run test:e2e:open    # Open Cypress test runner
npm run test:all         # Run both unit and e2e tests
```

### Production
```bash
npm run serve            # Serve production build locally
```

## Architecture Overview

### Core Application Structure
The app uses a **screen-based navigation system** with centralized state management:

- **App.tsx**: Main container with screen routing, animations (Framer Motion), and two context providers
- **Navigation**: Bottom navigation bar for screen switching
- **Screen Components**: Each major view is a separate screen component
- **Context Architecture**: Dual provider system (Settings + Theme contexts)

### Key Architectural Patterns

#### State Management
- **Settings**: Persistent localStorage-backed settings via SettingsContext
- **Game State**: Local component state in GameScreen with complex state machine
- **Navigation**: Simple string-based screen routing in App component

#### Game Logic Architecture
- **GameLogic**: Static utility class for pure game calculations (sequence generation, scoring)
- **AudioManager**: Singleton-pattern class for sound effects and haptic feedback
- **Component State Machine**: GameScreen manages complex state transitions (idle → playing → input → finished)

#### Component Organization
```
components/
├── screens/          # Full-screen views (Home, Game, Settings, Results, Stats)
├── game/            # Game-specific UI components (NumberPad)
└── [root]           # Shared components (Header, Navigation)
```

### Critical Implementation Details

#### Game State Machine
The GameScreen component implements a state machine with these states:
- `idle`: Initial state, triggers game start
- `playing`: Displaying number sequence
- `input`: Waiting for user answer
- `finished`: Processing result

#### Settings Persistence
All game settings are automatically persisted to localStorage via SettingsContext. Settings include digit count, sequence length, timing, and audio/haptic preferences.

#### Testing Architecture
- **Unit Tests**: Co-located with source files (`.test.tsx` suffix)
- **E2E Tests**: Cypress tests in `cypress/e2e/` covering accessibility, game flow, keyboard navigation
- **Coverage**: 80% threshold enforced for branches, functions, lines, and statements

#### PWA Implementation
- Service worker with Workbox for offline functionality
- Web app manifest for installation capabilities
- Performance monitoring and caching strategies

## Development Guidelines

### Code Quality Standards
- ESLint + Prettier enforced with specific rules for TypeScript and React
- Comprehensive test coverage required (80% threshold)
- TypeScript strict mode enabled

### Component Conventions
- React functional components with TypeScript
- Props interfaces defined for all components
- Event handlers use descriptive naming (e.g., `onNavigate`, `onStartGame`)
- Accessibility features included (ARIA labels, keyboard navigation)

### Styling Approach
- Tailwind CSS with custom animations and glassmorphism design
- Custom CSS properties for theming
- Responsive design with mobile-first approach

### Audio and Haptics
- AudioManager handles all sound effects (number display, keypress, success/error)
- Haptic feedback integrated for mobile devices
- Both can be disabled via settings

## Testing Notes

### Running Specific Tests
```bash
npm test gameLogic.test.ts        # Test specific file
npm test -- --testNamePattern="GameLogic"  # Test specific suite
```

### E2E Test Development
- Cypress config: `baseUrl: localhost:3000`, viewport: 1280x720
- Tests cover accessibility, game flow, keyboard navigation, settings
- Use `cypress/support/commands.ts` for custom commands

### Coverage Reports
Coverage reports generated in `coverage/` directory with detailed HTML reports.

## Known Issues and Considerations

### Keyboard Navigation
Some Cypress e2e keyboard tests are currently failing - this indicates potential keyboard navigation issues that need investigation.

### Audio Context
AudioManager requires user interaction before playing sounds (browser security). The implementation handles this gracefully with try-catch blocks.

### Performance
The app uses Framer Motion for page transitions, which may impact performance on lower-end devices. Monitor performance when making changes to animations.