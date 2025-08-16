import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation items', () => {
    render(<Navigation currentScreen="home" onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });

  it('highlights the current screen', () => {
    render(<Navigation currentScreen="settings" onNavigate={mockOnNavigate} />);
    
    const homeButton = screen.getByText('Home');
    const settingsButton = screen.getByText('Settings');
    const statsButton = screen.getByText('Stats');
    
    expect(homeButton).not.toHaveClass('active');
    expect(settingsButton).toHaveClass('active');
    expect(statsButton).not.toHaveClass('active');
  });

  it('calls onNavigate when navigation item is clicked', () => {
    render(<Navigation currentScreen="home" onNavigate={mockOnNavigate} />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('settings');
    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
  });

  it('has correct structure and CSS classes', () => {
    render(<Navigation currentScreen="home" onNavigate={mockOnNavigate} />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('app-footer');
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bottom-nav');
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('nav-btn');
    });
  });

  it('updates active state when currentScreen changes', () => {
    const { rerender } = render(
      <Navigation currentScreen="home" onNavigate={mockOnNavigate} />
    );
    
    expect(screen.getByText('Home')).toHaveClass('active');
    expect(screen.getByText('Stats')).not.toHaveClass('active');
    
    rerender(<Navigation currentScreen="stats" onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Home')).not.toHaveClass('active');
    expect(screen.getByText('Stats')).toHaveClass('active');
  });

  it('calls onNavigate with correct screen for each navigation item', () => {
    render(<Navigation currentScreen="home" onNavigate={mockOnNavigate} />);
    
    fireEvent.click(screen.getByText('Home'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('home');
    
    fireEvent.click(screen.getByText('Settings'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('settings');
    
    fireEvent.click(screen.getByText('Stats'));
    expect(mockOnNavigate).toHaveBeenLastCalledWith('stats');
    
    expect(mockOnNavigate).toHaveBeenCalledTimes(3);
  });
});