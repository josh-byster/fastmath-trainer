import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('Header', () => {
  const mockOnSettingsClick = jest.fn();

  const renderHeader = () => {
    return render(
      <ThemeProvider>
        <Header onSettingsClick={mockOnSettingsClick} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app title', () => {
    renderHeader();

    expect(screen.getByText('FastMath')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'FastMath'
    );
  });

  it('renders the settings button with correct aria-label', () => {
    renderHeader();

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton).toHaveAttribute('aria-label', 'Settings');
  });

  it('calls onSettingsClick when settings button is clicked', () => {
    renderHeader();

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsButton);

    expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('has correct CSS classes', () => {
    renderHeader();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header-modern', 'sticky', 'top-0', 'z-50');

    const title = screen.getByRole('heading');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gradient');

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toHaveClass('glass', 'rounded-full');
  });

  it('renders settings button with settings icon', () => {
    const { container } = renderHeader();

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toBeInTheDocument();
    // Check that it contains an SVG icon (the Settings component renders as SVG)
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const icon = container.querySelector('svg.w-5.h-5');
    expect(icon).toBeInTheDocument();
  });
});
