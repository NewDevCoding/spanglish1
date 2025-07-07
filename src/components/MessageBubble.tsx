import React, { useEffect, useState } from 'react';
import { Message } from '../utils/formatters';
import ttsService from '../services/ttsService';

type MessageBubbleProps = {
  message: Message;
  onUserMessage?: () => void; // Callback to stop TTS when user sends message
};

export default function MessageBubble({ message, onUserMessage }: MessageBubbleProps) {
  const isAI = message.sender === 'ai';
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play TTS for AI messages
  useEffect(() => {
    if (isAI && message.originalText) {
      // Small delay to ensure the message is rendered
      const timer = setTimeout(() => {
        setIsPlaying(true);
        ttsService.speak(message.originalText).finally(() => {
          setIsPlaying(false);
        });
      }, 500);
      
      return () => {
        clearTimeout(timer);
        ttsService.stop();
        setIsPlaying(false);
      };
    }
  }, [isAI, message.originalText]);

  // Stop TTS when user sends a message
  useEffect(() => {
    if (onUserMessage) {
      onUserMessage();
    }
  }, [onUserMessage]);

  const handleStopTTS = () => {
    console.log('Stop button clicked');
    ttsService.stop();
    setIsPlaying(false);
  };

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs p-3 rounded-lg shadow ${isAI ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
        <div className="font-semibold">{message.originalText}</div>
        <div className="text-xs text-gray-500 mt-1">{message.translatedText}</div>
        
        {/* TTS Controls for AI messages */}
        {isAI && (
          <div className="mt-2 flex items-center justify-between">
            {isPlaying && (
              <div className="flex items-center text-xs text-blue-700">
                <span className="animate-pulse">🔊</span>
                <span className="ml-1">Playing...</span>
              </div>
            )}
            <button
              onClick={handleStopTTS}
              disabled={!isPlaying}
              className={`ml-2 px-2 py-1 rounded text-xs transition-colors ${
                isPlaying 
                  ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isPlaying ? "Stop audio" : "No audio playing"}
            >
              ⏹️ Stop
            </button>
          </div>
        )}
        

      </div>
    </div>
  );
} 