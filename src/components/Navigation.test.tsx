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

    const homeButton = screen.getByTestId('nav-home');
    const settingsButton = screen.getByTestId('nav-settings');
    const statsButton = screen.getByTestId('nav-stats');

    expect(homeButton).not.toHaveClass('text-blue-600');
    expect(settingsButton).toHaveClass('text-blue-600');
    expect(statsButton).not.toHaveClass('text-blue-600');
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
    expect(footer).toHaveClass(
      'fixed',
      'bottom-0',
      'left-0',
      'right-0',
      'z-40'
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('nav-modern');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    buttons.forEach((button) => {
      expect(button).toHaveClass(
        'relative',
        'flex',
        'flex-col',
        'items-center'
      );
    });
  });

  it('updates active state when currentScreen changes', () => {
    const { rerender } = render(
      <Navigation currentScreen="home" onNavigate={mockOnNavigate} />
    );

    expect(screen.getByTestId('nav-home')).toHaveClass('text-blue-600');
    expect(screen.getByTestId('nav-stats')).not.toHaveClass('text-blue-600');

    rerender(<Navigation currentScreen="stats" onNavigate={mockOnNavigate} />);

    expect(screen.getByTestId('nav-home')).not.toHaveClass('text-blue-600');
    expect(screen.getByTestId('nav-stats')).toHaveClass('text-blue-600');
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
