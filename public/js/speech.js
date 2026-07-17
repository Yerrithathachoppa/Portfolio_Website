/**
 * Browser Speech Recognition Helper using native Web Speech API.
 */
export class SpeechRecognizer {
  constructor(onResult, onStateChange) {
    this.onResult = onResult;
    this.onStateChange = onStateChange;
    this.recognition = null;
    this.isListening = false;

    // Check support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Stop when user stops speaking
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      // Attach event listeners
      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChange(false);
      };

      this.recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        this.isListening = false;
        this.onStateChange(false);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          this.onResult(transcript);
        }
      };
    }
  }

  isSupported() {
    return this.recognition !== null;
  }

  toggle() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  }
}
