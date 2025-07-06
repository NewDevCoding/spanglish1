import { Message } from '../utils/formatters';

const STORAGE_KEY = 'spanglish1_chat_history';

const persistenceService = {
  saveChatHistory(messages: Message[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // Ignore errors for now
    }
  },
  loadChatHistory(): Message[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      // Ignore errors for now
    }
    return [];
  }
};

export default persistenceService; 