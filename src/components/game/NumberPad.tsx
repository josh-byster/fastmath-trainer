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
  const numbers = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  const handleKeyDown = (event: React.KeyboardEvent): void => {
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
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [canSubmit]);

  return (
    <div className="number-pad" data-testid="number-pad">
      {numbers.map((digit) => (
        <button
          key={digit}
          className="number-key"
          onClick={() => onNumberClick(digit)}
        >
          {digit}
        </button>
      ))}
      
      <button className="clear-btn" onClick={onClear}>
        Clear
      </button>
      
      <button 
        className="number-key" 
        onClick={() => onNumberClick('0')}
      >
        0
      </button>
      
      <button
        className="submit-btn"
        data-testid="submit-btn"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        ✓
      </button>
    </div>
  );
};