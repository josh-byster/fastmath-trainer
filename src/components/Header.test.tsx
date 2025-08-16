import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';

describe('Header', () => {
  const mockOnSettingsClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app title', () => {
    render(<Header onSettingsClick={mockOnSettingsClick} />);
    
    expect(screen.getByText('FastMath')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('FastMath');
  });

  it('renders the settings button with correct aria-label', () => {
    render(<Header onSettingsClick={mockOnSettingsClick} />);
    
    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton).toHaveAttribute('aria-label', 'Settings');
  });

  it('calls onSettingsClick when settings button is clicked', () => {
    render(<Header onSettingsClick={mockOnSettingsClick} />);
    
    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsButton);
    
    expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('has correct CSS classes', () => {
    render(<Header onSettingsClick={mockOnSettingsClick} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('app-header');
    
    const title = screen.getByRole('heading');
    expect(title).toHaveClass('app-title');
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('settings-btn');
  });

  it('renders settings button with gear emoji', () => {
    render(<Header onSettingsClick={mockOnSettingsClick} />);
    
    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toHaveTextContent('⚙️');
  });
});