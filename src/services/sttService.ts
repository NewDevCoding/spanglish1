// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const sttService = {
  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // Use the appropriate speech recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition settings
      recognition.lang = 'es-ES'; // Spanish
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // Handle results
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      // Handle errors
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          resolve(''); // Return empty string if no speech detected
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      // Handle when recognition ends
      recognition.onend = () => {
        // Recognition ended normally
      };

      // Start listening
      try {
        recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default sttService; 