// Jest DOM matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock AudioContext for tests
const mockAudioContext = {
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
  state: 'running',
  close: jest.fn(),
};

global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
(global as any).webkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator.vibrate for haptic feedback
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});

// Mock framer-motion components to avoid animation prop warnings
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    section: 'section', 
    button: 'button',
    span: 'span',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    header: 'header',
    main: 'main',
    nav: 'nav',
    form: 'form',
    label: 'label',
    input: 'input',
    select: 'select',
    option: 'option',
    textarea: 'textarea',
  },
  AnimatePresence: ({ children }) => children,
}));

// Ensure document.body exists for React Testing Library
beforeAll(() => {
  if (!document.body) {
    document.body = document.createElement('body');
  }
});

// Mock DOM element methods for testing
Element.prototype.scrollIntoView = jest.fn();
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  toJSON: () => {},
}));