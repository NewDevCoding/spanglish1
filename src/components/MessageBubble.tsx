import React from 'react';
import { Message } from '../utils/formatters';

type MessageBubbleProps = {
  message: Message;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAI = message.sender === 'ai';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs p-3 rounded-lg shadow ${isAI ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
        <div className="font-semibold">{message.originalText}</div>
        <div className="text-xs text-gray-500 mt-1">{message.translatedText}</div>
        {isAI && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 text-xs text-blue-700">
            <div className="font-bold">Sugerencias:</div>
            <ul className="list-disc list-inside">
              {message.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 