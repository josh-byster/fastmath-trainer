import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NumberPad } from './NumberPad';

describe('NumberPad', () => {
  const mockOnNumberClick = jest.fn();
  const mockOnClear = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all number buttons (0-9)', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it('renders Clear button', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('renders Submit button', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('calls onNumberClick when number button is clicked', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.click(screen.getByText('5'));
    expect(mockOnNumberClick).toHaveBeenCalledWith('5');
    expect(mockOnNumberClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when Clear button is clicked', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.click(screen.getByText('Clear'));
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Submit button is clicked and canSubmit is true', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.click(screen.getByText('✓'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables Submit button when canSubmit is false', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={false}
      />
    );

    const submitButton = screen.getByText('✓');
    expect(submitButton).toBeDisabled();
  });

  it('handles keyboard input for numbers', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.keyDown(document, { key: '7' });
    expect(mockOnNumberClick).toHaveBeenCalledWith('7');
  });

  it('handles keyboard input for clear (Backspace and Delete)', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.keyDown(document, { key: 'Backspace' });
    expect(mockOnClear).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Delete' });
    expect(mockOnClear).toHaveBeenCalledTimes(2);
  });

  it('handles keyboard input for clear (Escape)', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard input for submit (Enter) when canSubmit is true', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit on Enter when canSubmit is false', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={false}
      />
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('has correct CSS classes', () => {
    render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    const numberPad = screen.getByTestId('number-pad');
    expect(numberPad).toBeInTheDocument();

    const clearButton = screen.getByText('Clear');
    expect(clearButton).toHaveClass('clear-key');

    const submitButton = screen.getByText('✓');
    expect(submitButton).toHaveClass('submit-key');

    const numberButtons = screen.getAllByText(/^[0-9]$/);
    numberButtons.forEach(button => {
      expect(button).toHaveClass('number-key');
    });
  });

  it('cleans up keyboard event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <NumberPad
        onNumberClick={mockOnNumberClick}
        onClear={mockOnClear}
        onSubmit={mockOnSubmit}
        canSubmit={true}
      />
    );

    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});