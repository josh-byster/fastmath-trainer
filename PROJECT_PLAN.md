# Mental Math Training App - Project Plan

## Overview
A responsive web application for mental math training that can run as a PWA on iPhone. Users configure timing and difficulty settings, then practice adding sequences of numbers that flash on screen.

## Core Features

### 1. Configurable Settings
- **Time on screen**: How long each number is displayed (e.g., 500ms - 3000ms)
- **Time between numbers**: Delay between number displays (e.g., 100ms - 1000ms)
- **Number type**: 2-digit vs 3-digit numbers
- **Sequence length**: How many numbers to flash (e.g., 3-10 numbers)

### 2. Game Flow
1. User configures settings
2. Game displays sequence of N numbers with specified timing
3. User enters the sum of all displayed numbers
4. System calculates score based on difficulty and accuracy
5. Display results and statistics

### 3. Scoring System
Score factors:
- **Digit complexity**: 3-digit numbers = higher multiplier
- **Speed factor**: Shorter display time = higher multiplier
- **Sequence length**: More numbers = higher multiplier
- **Accuracy**: Correct answer vs time taken
- **Consistency**: Performance tracking over time

### 4. Mobile-First Design
- iPhone Safari optimized
- Touch-friendly interface
- PWA capabilities for "Add to Home Screen"
- Offline functionality
- Responsive across all screen sizes

## Implementation Plan

### Phase 1: Core Structure
- [x] Create HTML structure with mobile-first responsive design
- [ ] Implement CSS styles for iPhone-optimized interface
- [ ] Build settings panel with configurable options

### Phase 2: Game Logic
- [ ] Create game engine for number sequence display
- [ ] Implement scoring system based on difficulty
- [ ] Create numeric input interface

### Phase 3: PWA & Persistence
- [ ] Add PWA manifest and service worker
- [ ] Add statistics tracking and local storage

### Phase 4: Testing & Optimization
- [ ] Test and optimize for iPhone Safari

## Technical Architecture

### Frontend Stack
- **HTML5**: Semantic structure with mobile viewport
- **CSS3**: Flexbox/Grid for responsive layout, CSS animations
- **Vanilla JavaScript**: Modular ES6+ for game logic
- **PWA**: Service Worker + Web App Manifest

### File Structure
```
fastmath/
├── index.html              # Main app entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── styles.css          # Main styles
│   └── animations.css      # Number flash animations
├── js/
│   ├── app.js              # Main application controller
│   ├── game.js             # Game engine and logic
│   ├── settings.js         # Settings management
│   ├── scoring.js          # Scoring algorithm
│   ├── storage.js          # Local storage utilities
│   └── ui.js               # UI interactions
├── icons/                  # PWA icons (various sizes)
└── README.md
```

### Architecture Components

#### 1. Application Controller (`app.js`)
- Manages app state and navigation
- Coordinates between different modules
- Handles PWA installation prompts

#### 2. Game Engine (`game.js`)
```javascript
class GameEngine {
  - generateNumbers(count, digits)
  - displaySequence(numbers, timing)
  - calculateCorrectSum(numbers)
  - validateUserInput(input, correctSum)
}
```

#### 3. Settings Manager (`settings.js`)
```javascript
class SettingsManager {
  - timeOnScreen: number (milliseconds)
  - timeBetween: number (milliseconds)
  - digitCount: 2 | 3
  - sequenceLength: number
  - saveSettings()
  - loadSettings()
}
```

#### 4. Scoring System (`scoring.js`)
```javascript
class ScoringSystem {
  - calculateDifficulty(settings)
  - calculateScore(accuracy, time, difficulty)
  - updateStats(score, settings)
}
```

#### 5. UI Controller (`ui.js`)
- Screen transitions and animations
- Touch event handling
- Number display animations
- Input validation and feedback

#### 6. Storage Manager (`storage.js`)
- Local storage for settings
- Game statistics persistence
- High score tracking

### Data Flow Architecture

```
User Input → Settings Manager → Game Engine → UI Controller
                    ↓               ↓            ↓
            Local Storage ← Scoring System → Statistics
```

### Mobile Optimization Strategy

#### 1. Performance
- Minimal DOM manipulation
- CSS transforms for animations
- Efficient event listeners
- Lazy loading for non-critical features

#### 2. UX/UI
- Large touch targets (44px minimum)
- High contrast for readability
- Haptic feedback simulation
- Gesture-friendly interactions

#### 3. PWA Features
- Offline game functionality
- App-like navigation
- Background sync for statistics
- Push notifications for practice reminders

### Scoring Algorithm Design

```javascript
const calculateScore = (settings, accuracy, responseTime) => {
  const difficultyMultiplier = 
    (settings.digitCount === 3 ? 1.5 : 1.0) *
    (3000 / settings.timeOnScreen) *
    (settings.sequenceLength / 5);
  
  const speedBonus = Math.max(0, 10000 - responseTime) / 1000;
  const accuracyScore = accuracy ? 100 : 0;
  
  return Math.round((accuracyScore + speedBonus) * difficultyMultiplier);
};
```

### Progressive Enhancement

1. **Base Experience**: Works without JavaScript (basic form)
2. **Enhanced**: Full interactive experience with JS
3. **PWA**: Install prompt and offline functionality
4. **Advanced**: Statistics, animations, haptic feedback

This architecture ensures a scalable, maintainable codebase while delivering an optimal mobile experience for mental math training.