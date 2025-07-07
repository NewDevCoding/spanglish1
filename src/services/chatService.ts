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
          originalText: '¡Hola! ¿Qué tal? Me encanta conocer gente nueva. ¿De dónde eres?',
          translatedText: '',
          timestamp: new Date(),
          suggestions: [
            '¿Y tú de dónde eres?',
            'Me llamo Juan',
            '¿Qué te gusta hacer?'
          ],
        },
        suggestions: [
          '¿Y tú de dónde eres?',
          'Me llamo Juan',
          '¿Qué te gusta hacer?'
        ]
      };
    }
  },

  async getAIResponse(userText: string, conversationHistory: Message[]): Promise<AIResponse> {
    try {
      // Convert conversation history to OpenAI format
      const history = conversationHistory.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.originalText
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText, 
          isInitial: false,
          conversationHistory: history
        }),
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
      const aiResponse = `¡Qué chévere! ${userText} Me encanta eso. ¿Cuéntame más?`;
      return {
        message: {
          id: Date.now() + '-ai',
          sender: 'ai',
          originalText: aiResponse,
          translatedText: '',
          timestamp: new Date(),
          suggestions: [
            '¿Qué más te gusta?',
            'Cuéntame más',
            '¿Qué opinas?'
          ],
        },
        suggestions: [
          '¿Qué más te gusta?',
          'Cuéntame más',
          '¿Qué opinas?'
        ]
      };
    }
  }
};

export default chatService; 