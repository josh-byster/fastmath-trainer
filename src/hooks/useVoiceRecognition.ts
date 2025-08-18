import { useState, useRef, useCallback, useEffect } from 'react';
import { VoiceRecognition } from '../services/VoiceRecognition';
import { NumberParser } from '../services/NumberParser';

interface VoiceRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  transcript: string;
  confidence: number;
  isSupported: boolean;
}

interface VoiceRecognitionConfig {
  language?: string;
  confidenceThreshold?: number;
  autoStart?: boolean;
}

interface UseVoiceRecognitionReturn {
  state: VoiceRecognitionState;
  startListening: () => Promise<number | null>;
  stopListening: () => void;
  clearError: () => void;
  isSupported: boolean;
}

export const useVoiceRecognition = (
  config: VoiceRecognitionConfig = {}
): UseVoiceRecognitionReturn => {
  const voiceRecognitionRef = useRef<VoiceRecognition | null>(null);

  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isProcessing: false,
    error: null,
    transcript: '',
    confidence: 0,
    isSupported: false,
  });

  // Initialize voice recognition
  useEffect(() => {
    voiceRecognitionRef.current = new VoiceRecognition({
      language: config.language || 'en-US',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      confidenceThreshold: config.confidenceThreshold || 0.7,
    });

    setState((prev) => ({
      ...prev,
      isSupported:
        voiceRecognitionRef.current?.isVoiceRecognitionSupported() || false,
    }));

    return () => {
      voiceRecognitionRef.current?.cleanup();
    };
  }, [config.language, config.confidenceThreshold]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const startListening = useCallback(async (): Promise<number | null> => {
    if (!voiceRecognitionRef.current?.isVoiceRecognitionSupported()) {
      const error = 'Voice recognition not supported in this browser';
      setState((prev) => ({ ...prev, error }));
      throw new Error(error);
    }

    setState((prev) => ({
      ...prev,
      isListening: true,
      isProcessing: false,
      error: null,
      transcript: '',
      confidence: 0,
    }));

    try {
      const result = await voiceRecognitionRef.current.startListening();

      setState((prev) => ({
        ...prev,
        isListening: false,
        isProcessing: true,
        transcript: result.transcript,
        confidence: result.confidence,
      }));

      // Process the transcript
      const preprocessedTranscript = NumberParser.preprocessTranscript(
        result.transcript
      );
      const parsedNumber = NumberParser.parseSpokenNumber(
        preprocessedTranscript
      );
      const parsingConfidence = NumberParser.getConfidence(
        preprocessedTranscript
      );

      setState((prev) => ({
        ...prev,
        isProcessing: false,
      }));

      if (
        parsedNumber !== null &&
        NumberParser.validateParseResult(preprocessedTranscript, parsedNumber)
      ) {
        console.log('Voice recognition success:', {
          original: result.transcript,
          preprocessed: preprocessedTranscript,
          parsed: parsedNumber,
          speechConfidence: result.confidence,
          parsingConfidence,
        });
        return parsedNumber;
      } else {
        const error = `Could not understand "${result.transcript}"`;
        setState((prev) => ({ ...prev, error }));
        return null;
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isListening: false,
        isProcessing: false,
        error:
          error instanceof Error ? error.message : 'Voice recognition failed',
      }));
      return null;
    }
  }, []);

  const stopListening = useCallback(() => {
    voiceRecognitionRef.current?.stopListening();
    setState((prev) => ({
      ...prev,
      isListening: false,
      isProcessing: false,
    }));
  }, []);

  return {
    state,
    startListening,
    stopListening,
    clearError,
    isSupported: state.isSupported,
  };
};
