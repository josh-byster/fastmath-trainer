import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App', () => {
  it('renders the main app structure', () => {
    render(<App />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('starts on the home screen by default', () => {
    render(<App />);
    
    expect(screen.getByText('Mental Math Training')).toBeInTheDocument();
    expect(screen.getByTestId('start-game-btn')).toBeInTheDocument();
  });

  it('navigates to settings when settings button is clicked', () => {
    render(<App />);
    
    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Game Settings')).toBeInTheDocument();
  });

  it('navigates to game screen when start game is clicked', () => {
    render(<App />);
    
    const startButton = screen.getByTestId('start-game-btn');
    fireEvent.click(startButton);
    
    expect(screen.getByTestId('game-screen')).toBeInTheDocument();
  });

  it('navigates between screens using navigation', () => {
    render(<App />);
    
    const statsNavButton = screen.getByTestId('nav-stats');
    
    fireEvent.click(statsNavButton);
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    
    const homeNavButton = screen.getByTestId('nav-home');
    fireEvent.click(homeNavButton);
    expect(screen.getByText('Mental Math Training')).toBeInTheDocument();
  });

  it('renders accessibility announcements area', () => {
    render(<App />);
    
    const announcements = screen.getByText('Game state updates will be announced here');
    expect(announcements).toBeInTheDocument();
    expect(announcements).toHaveAttribute('aria-live', 'polite');
    expect(announcements).toHaveAttribute('aria-atomic', 'true');
    expect(announcements).toHaveAttribute('id', 'announcements');
  });

  it('provides settings context to child components', () => {
    render(<App />);
    
    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Game Settings')).toBeInTheDocument();
    expect(screen.getByText('Timing Settings')).toBeInTheDocument();
  });
});