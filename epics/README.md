# FastMath App - Development Epics

## Project Overview
FastMath is a responsive mental math training web application optimized for iPhone Safari with PWA capabilities. Users practice mental arithmetic by viewing sequences of numbers that flash on screen at configurable intervals, then entering the sum.

## Epic Overview

| Epic | Description | Priority | Estimated Time |
|------|-------------|----------|----------------|
| [Epic 1: Core UI Foundation](./01-core-ui-foundation.md) | Basic HTML structure, responsive CSS, and mobile-first design | High | 8-12 hours |
| [Epic 2: Settings System](./02-settings-system.md) | Configurable timing, difficulty, and game parameters | High | 6-8 hours |
| [Epic 3: Game Engine](./03-game-engine.md) | Number sequence generation, timing control, and display logic | High | 10-14 hours |
| [Epic 4: Scoring & Statistics](./04-scoring-statistics.md) | Difficulty-based scoring algorithm and performance tracking | Medium | 8-10 hours |
| [Epic 5: PWA Implementation](./05-pwa-implementation.md) | Service worker, manifest, and offline capabilities | Medium | 6-8 hours |
| [Epic 6: Testing & Optimization](./06-testing-optimization.md) | Cross-device testing, performance optimization, and bug fixes | Low | 4-6 hours |

## Development Prerequisites

### Required Knowledge
- HTML5 semantic markup
- CSS3 (Flexbox, Grid, animations)
- ES6+ JavaScript (modules, classes, async/await)
- Local Storage API
- Service Workers (basic understanding)
- Mobile web development best practices

### Development Environment
- Modern code editor (VS Code recommended)
- Web browser with developer tools (Chrome/Safari)
- Local development server (Live Server extension or Python's `http.server`)
- Git for version control

### Testing Devices
- iPhone Safari (primary target)
- Chrome DevTools mobile emulation
- Various screen sizes (320px - 768px width)

## Getting Started

1. **Read the [Project Plan](../PROJECT_PLAN.md)** - Understand the overall architecture
2. **Start with Epic 1** - Foundational UI structure
3. **Follow epics sequentially** - Each epic builds on the previous
4. **Test frequently** - Especially on mobile devices
5. **Review acceptance criteria** - Ensure all requirements are met

## Code Standards

### File Organization
```
fastmath/
├── index.html
├── manifest.json
├── sw.js
├── css/
│   ├── styles.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── game.js
│   ├── settings.js
│   ├── scoring.js
│   ├── storage.js
│   └── ui.js
└── icons/
```

### JavaScript Standards
- Use ES6+ modules
- Implement classes for major components
- Use async/await for asynchronous operations
- Include JSDoc comments for public methods
- Use descriptive variable and function names

### CSS Standards
- Mobile-first responsive design
- Use CSS custom properties for theming
- Prefer Flexbox/Grid over floats
- Use semantic class names (BEM methodology)
- Optimize for touch interfaces (44px minimum touch targets)

### HTML Standards
- Semantic HTML5 elements
- Proper meta tags for mobile
- Accessible markup (ARIA labels where needed)
- Valid HTML5 structure

## Success Metrics

### Technical Requirements
- ✅ Responsive design (320px - 768px+)
- ✅ PWA installable on iPhone
- ✅ Offline functionality
- ✅ <3 second initial load time
- ✅ Smooth 60fps animations
- ✅ Touch-optimized interface

### User Experience Requirements
- ✅ Intuitive settings configuration
- ✅ Clear visual feedback during games
- ✅ Accurate scoring and statistics
- ✅ Persistent data storage
- ✅ Error handling and validation

## Support and Resources

### Documentation
- [MDN Web Docs](https://developer.mozilla.org/) - Web APIs and standards
- [PWA Documentation](https://web.dev/progressive-web-apps/) - Progressive Web Apps
- [iOS Safari Web Content Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/) - Safari-specific optimizations

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA and performance auditing
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Debugging and profiling

Start with Epic 1 and work through each epic sequentially for the best development experience.