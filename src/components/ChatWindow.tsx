import React from 'react';
import MessageBubble from './MessageBubble';
import { Message } from '../utils/formatters';

type ChatWindowProps = {
  messages: Message[];
  onUserMessage?: () => void;
};

export default function ChatWindow({ messages, onUserMessage }: ChatWindowProps) {
  return (
    <div className="space-y-4">
      {messages.map(msg => (
        <MessageBubble 
          key={msg.id} 
          message={msg} 
          onUserMessage={onUserMessage}
        />
      ))}
    </div>
  );
} 