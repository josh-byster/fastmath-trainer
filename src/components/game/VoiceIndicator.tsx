import React from 'react';

interface VoiceIndicatorProps {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  transcript: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({
  isListening,
  isProcessing,
  error,
  transcript,
  onRetry,
  onCancel,
}) => {
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <div className="flex space-x-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Use Keyboard
              </button>
            )}
          </div>
        </div>
      );
    }

    if (isProcessing) {
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Processing: "{transcript}"
          </div>
        </div>
      );
    }

    if (isListening) {
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 w-12 h-12 bg-red-500 rounded-full animate-ping opacity-25"></div>
            </div>
          </div>
          <div className="text-lg font-medium text-slate-700 dark:text-slate-200">
            Listening...
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Speak your answer clearly
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isListening && !isProcessing && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-6 max-w-sm mx-4">{renderContent()}</div>
    </div>
  );
};
