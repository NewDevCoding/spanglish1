export type Message = {
  id: string;
  sender: 'ai' | 'user';
  originalText: string;
  translatedText: string;
  timestamp: Date;
  suggestions?: string[];
}; 