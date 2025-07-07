let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isCurrentlyPlaying = false;
let onPlayStateChange: ((playing: boolean) => void) | null = null;

const ttsService = {
  async speak(text: string): Promise<void> {
    // Stop any current playback first
    this.stop();
    
    try {
      // Call our TTS API route
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS failed');
      }

      // Get the audio data
      const audioBlob = await response.blob();
      
      // Create an audio URL and play it
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      
      // Set up event listeners
      currentAudio.onplay = () => {
        isCurrentlyPlaying = true;
        if (onPlayStateChange) onPlayStateChange(true);
      };
      
      currentAudio.onended = () => {
        isCurrentlyPlaying = false;
        if (onPlayStateChange) onPlayStateChange(false);
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
      };

      currentAudio.onpause = () => {
        isCurrentlyPlaying = false;
        if (onPlayStateChange) onPlayStateChange(false);
      };

      currentAudio.onerror = () => {
        isCurrentlyPlaying = false;
        if (onPlayStateChange) onPlayStateChange(false);
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
      };
      
      // Play the audio
      await currentAudio.play();

    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser's built-in speech synthesis if Vapi fails
      this.fallbackSpeak(text);
    }
  },

  fallbackSpeak(text: string): void {
    // Stop any current speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9; // Slightly slower for clarity
      currentUtterance = utterance;
      
      utterance.onstart = () => {
        isCurrentlyPlaying = true;
        if (onPlayStateChange) onPlayStateChange(true);
      };
      
      utterance.onend = () => {
        isCurrentlyPlaying = false;
        if (onPlayStateChange) onPlayStateChange(false);
        currentUtterance = null;
      };
      
      utterance.onerror = () => {
        isCurrentlyPlaying = false;
        if (onPlayStateChange) onPlayStateChange(false);
        currentUtterance = null;
      };
      
      speechSynthesis.speak(utterance);
    }
  },

  stop(): void {
    console.log('Stopping TTS...');
    
    // Stop current audio playback
    if (currentAudio) {
      console.log('Stopping audio playback');
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
      currentAudio = null;
    }
    
    // Stop current speech synthesis
    if ('speechSynthesis' in window) {
      console.log('Stopping speech synthesis');
      speechSynthesis.cancel();
      currentUtterance = null;
    }

    // Update state
    isCurrentlyPlaying = false;
    if (onPlayStateChange) onPlayStateChange(false);
  },

  isPlaying(): boolean {
    return isCurrentlyPlaying;
  },

  // Add callback for state changes
  onPlayStateChange(callback: (playing: boolean) => void): void {
    onPlayStateChange = callback;
  }
};

export default ttsService; 