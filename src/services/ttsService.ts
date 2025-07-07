const ttsService = {
  async speak(text: string): Promise<void> {
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
      const audio = new Audio(audioUrl);
      
      // Play the audio
      await audio.play();
      
      // Clean up the URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser's built-in speech synthesis if Vapi fails
      this.fallbackSpeak(text);
    }
  },

  fallbackSpeak(text: string): void {
    // Fallback to browser's built-in speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9; // Slightly slower for clarity
      speechSynthesis.speak(utterance);
    }
  }
};

export default ttsService; 