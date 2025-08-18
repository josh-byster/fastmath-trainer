export class NumberParser {
  private static readonly NUMBER_WORDS: { [key: string]: number } = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
    hundred: 100,
    thousand: 1000,
  };

  private static readonly SCALE_WORDS = ['hundred', 'thousand'];

  public static parseSpokenNumber(transcript: string): number | null {
    if (!transcript || typeof transcript !== 'string') {
      return null;
    }

    const cleanTranscript = transcript.toLowerCase().trim();

    // Handle direct numeric input first
    const directNumber = this.parseDirectNumber(cleanTranscript);
    if (directNumber !== null) {
      return directNumber;
    }

    // Handle sequence of individual digits (e.g., "two three four" -> 234)
    const sequenceNumber = this.parseDigitSequence(cleanTranscript);
    if (sequenceNumber !== null) {
      return sequenceNumber;
    }

    // Handle full number words (e.g., "twenty-three" -> 23)
    const wordNumber = this.parseWordNumber(cleanTranscript);
    if (wordNumber !== null) {
      return wordNumber;
    }

    return null;
  }

  private static parseDirectNumber(text: string): number | null {
    // Remove any non-digit characters and try to parse
    const numericText = text.replace(/[^\d-]/g, '');
    if (numericText && /^-?\d+$/.test(numericText)) {
      const num = parseInt(numericText, 10);
      if (!isNaN(num) && num >= -99999 && num <= 99999) {
        return num;
      }
    }
    return null;
  }

  private static parseDigitSequence(text: string): number | null {
    const words = text.split(/\s+/);

    // Check if all words are single digit numbers
    if (
      words.length <= 5 &&
      words.every(
        (word) =>
          this.NUMBER_WORDS[word] !== undefined && this.NUMBER_WORDS[word] < 10
      )
    ) {
      const digits = words.map((word) => this.NUMBER_WORDS[word]);
      const result = parseInt(digits.join(''), 10);
      if (!isNaN(result)) {
        return result;
      }
    }

    return null;
  }

  private static parseWordNumber(text: string): number | null {
    // Handle negative numbers
    let isNegative = false;
    let cleanText = text;
    if (text.includes('negative') || text.includes('minus')) {
      isNegative = true;
      cleanText = text.replace(/\b(negative|minus)\b/g, '').trim();
    }

    // Split on common separators and clean up
    const words = cleanText
      .replace(/[,-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0);

    let result = 0;
    let current = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const value = this.NUMBER_WORDS[word];

      if (value === undefined) {
        // Skip unknown words, might be artifacts from speech recognition
        continue;
      }

      if (value === 100) {
        if (current === 0) current = 1;
        current *= 100;
      } else if (value === 1000) {
        if (current === 0) current = 1;
        result += current * 1000;
        current = 0;
      } else if (value < 100) {
        current += value;
      }
    }

    result += current;

    if (isNegative) {
      result = -result;
    }

    // Validate reasonable range for mental math
    if (result >= -99999 && result <= 99999) {
      return result;
    }

    return null;
  }

  public static getConfidence(transcript: string): number {
    const cleanTranscript = transcript.toLowerCase().trim();

    // Higher confidence for direct numbers
    if (/^\d+$/.test(cleanTranscript)) {
      return 1.0;
    }

    // Check how many words are recognized number words
    const words = cleanTranscript.split(/\s+/);
    const recognizedWords = words.filter(
      (word) =>
        this.NUMBER_WORDS[word] !== undefined ||
        word === 'negative' ||
        word === 'minus'
    );

    if (recognizedWords.length === 0) {
      return 0.0;
    }

    const confidence = recognizedWords.length / words.length;

    // Boost confidence for common patterns
    if (words.length <= 3 && confidence >= 0.8) {
      return Math.min(1.0, confidence + 0.2);
    }

    return confidence;
  }

  public static validateParseResult(input: string, result: number): boolean {
    if (result === null || result === undefined) {
      return false;
    }

    // Basic sanity checks
    if (!Number.isInteger(result)) {
      return false;
    }

    // Reasonable range for mental math game
    if (result < -99999 || result > 99999) {
      return false;
    }

    return true;
  }

  // Helper method to suggest corrections for common misheard words
  public static preprocessTranscript(transcript: string): string {
    let processed = transcript.toLowerCase();

    // Common speech recognition corrections
    const corrections: { [key: string]: string } = {
      to: 'two',
      too: 'two',
      for: 'four',
      fore: 'four',
      ate: 'eight',
      won: 'one',
      tree: 'three',
      free: 'three',
      sex: 'six',
      sick: 'six',
      heaven: 'seven',
      tent: 'ten',
      teen: 'ten',
      dirty: 'thirty',
      fourty: 'forty',
    };

    const words = processed.split(/\s+/);
    const correctedWords = words.map((word) => corrections[word] || word);

    return correctedWords.join(' ');
  }
}
