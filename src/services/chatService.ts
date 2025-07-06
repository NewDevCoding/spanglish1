import { Message } from '../utils/formatters';

type AIResponse = {
  message: Message;
  suggestions: string[];
};

const chatService = {
  async getInitialMessage(): Promise<AIResponse> {
    return {
      message: {
        id: Date.now() + '-ai',
        sender: 'ai',
        originalText: '¡Hola! ¿Cómo estás?',
        translatedText: '', // Will be filled by translationService
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
  },

  async getAIResponse(userText: string): Promise<AIResponse> {
    const aiResponse = `¡Interesante! ${userText} (cuéntame más)`;
    return {
      message: {
        id: Date.now() + '-ai',
        sender: 'ai',
        originalText: aiResponse,
        translatedText: '', // Will be filled by translationService
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
};

export default chatService; 