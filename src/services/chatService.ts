import { Message } from '../utils/formatters';

type AIResponse = {
  message: Message;
  suggestions: string[];
};

const chatService = {
  async getInitialMessage(): Promise<AIResponse> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isInitial: true }),
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        message: {
          id: Date.now() + '-ai',
          sender: 'ai',
          originalText: data.message,
          translatedText: '', // Will be filled by translationService
          timestamp: new Date(),
          suggestions: data.suggestions,
        },
        suggestions: data.suggestions
      };
    } catch (e: any) {
      // Fallback to mock if API fails
      return {
        message: {
          id: Date.now() + '-ai',
          sender: 'ai',
          originalText: '¡Hola! ¿Cómo estás?',
          translatedText: '',
          timestamp: new Date(),
          suggestions: [
            'Estoy bien, gracias. ¿Y tú?',
            '¿De dónde eres?',
            '¿Qué te gusta hacer en tu tiempo libre?'
          ],
        },
        suggestions: [
          'Estoy bien, gracias. ¿Y tú?',
          '¿De dónde eres?',
          '¿Qué te gusta hacer en tu tiempo libre?'
        ]
      };
    }
  },

  async getAIResponse(userText: string): Promise<AIResponse> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, isInitial: false }),
      });
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        message: {
          id: Date.now() + '-ai',
          sender: 'ai',
          originalText: data.message,
          translatedText: '', // Will be filled by translationService
          timestamp: new Date(),
          suggestions: data.suggestions,
        },
        suggestions: data.suggestions
      };
    } catch (e: any) {
      // Fallback to mock if API fails
      const aiResponse = `¡Interesante! ${userText} (cuéntame más)`;
      return {
        message: {
          id: Date.now() + '-ai',
          sender: 'ai',
          originalText: aiResponse,
          translatedText: '',
          timestamp: new Date(),
          suggestions: [
            '¿Por qué piensas eso?',
            '¿Puedes darme un ejemplo?',
            '¿Qué más te gustaría compartir?'
          ],
        },
        suggestions: [
          '¿Por qué piensas eso?',
          '¿Puedes darme un ejemplo?',
          '¿Qué más te gustaría compartir?'
        ]
      };
    }
  }
};

export default chatService; 