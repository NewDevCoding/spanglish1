let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

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
      
      // Play the audio
      await currentAudio.play();
      
      // Clean up the URL after playing
      currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
      };

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
      
      utterance.onend = () => {
        currentUtterance = null;
      };
      
      utterance.onerror = () => {
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
  },

  isPlaying(): boolean {
    const audioPlaying = currentAudio && !currentAudio.paused && !currentAudio.ended;
    const synthesisPlaying = currentUtterance && speechSynthesis.speaking;
    return Boolean(audioPlaying) || Boolean(synthesisPlaying);
  }
};

export default ttsService; 