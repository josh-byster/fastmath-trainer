# FastMath PWA

A modern Progressive Web App for mental math training built with React, TypeScript, and comprehensive testing.

## Features

- 🧮 **Mental Math Training**: Practice addition with customizable sequences
- ⚙️ **Configurable Settings**: Adjust difficulty, timing, and feedback options
- 📱 **PWA Support**: Install as a native app on mobile devices
- 🔊 **Audio & Haptic Feedback**: Enhanced user experience
- 📊 **Statistics Tracking**: Monitor your progress (coming soon)
- ♿ **Accessibility**: Full keyboard navigation and screen reader support
- 🧪 **Comprehensive Testing**: Unit tests with high coverage

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: CSS with custom properties and animations
- **Testing**: Jest + React Testing Library
- **PWA**: Service Worker with Workbox
- **Build Tools**: Create React App
- **Code Quality**: ESLint + Prettier

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── components/          # React components
│   ├── game/           # Game-specific components
│   └── screens/        # Screen components
├── services/           # Context providers and services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and classes
└── styles/             # CSS files

tests/
├── unit/               # Unit tests
└── integration/        # Integration tests (future)

public/
├── icons/              # PWA icons
├── manifest.json       # PWA manifest
└── sw.js              # Service worker
```

## Game Features

### Difficulty Levels
- **Easy**: 2-digit numbers, longer display time
- **Medium**: Balanced settings for regular practice
- **Hard**: 3-digit numbers, fast-paced gameplay

### Customizable Settings
- Number of digits (2 or 3)
- Sequence length (3-10 numbers)
- Display timing (500-3000ms)
- Audio and haptic feedback

### Scoring System
- Base score of 100 points for correct answers
- Time bonus for faster responses
- Maximum possible score varies by difficulty

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test gameLogic.test.ts
```

### Code Quality
```bash
# Lint and fix issues
npm run lint:fix

# Format all files
npm run format

# Type check
npm run type-check
```

### PWA Development
The app includes a full PWA setup with:
- Service worker for offline functionality
- Web app manifest for installation
- Optimized caching strategies
- Performance monitoring

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run lint` and `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details