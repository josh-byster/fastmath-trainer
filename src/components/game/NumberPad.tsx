import React from 'react';

interface NumberPadProps {
  onNumberClick: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onClear,
  onSubmit,
  canSubmit,
}) => {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent): void => {
      const key = event.key;

      if (key >= '0' && key <= '9') {
        event.preventDefault();
        onNumberClick(key);
      } else if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
        onClear();
      } else if (key === 'Enter' && canSubmit) {
        event.preventDefault();
        onSubmit();
      } else if (key === 'Escape') {
        event.preventDefault();
        onClear();
      }
    },
    [onNumberClick, onClear, onSubmit, canSubmit]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="grid grid-cols-3 gap-4 max-w-xs mx-auto"
      data-testid="number-pad"
    >
      {numbers.map((digit) => (
        <button
          key={digit}
          className="number-key"
          data-testid={`number-${digit}`}
          onClick={() => onNumberClick(digit)}
        >
          {digit}
        </button>
      ))}

      <button className="clear-key" data-testid="clear-btn" onClick={onClear}>
        Clear
      </button>

      <button
        className="number-key"
        data-testid="number-0"
        onClick={() => onNumberClick('0')}
      >
        0
      </button>

      <button
        className={`submit-key ${
          !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        data-testid="submit-btn"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        ✓
      </button>
    </div>
  );
};
