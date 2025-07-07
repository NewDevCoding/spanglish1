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
  const [hasPlayed, setHasPlayed] = useState(false);

  // Set up TTS state change callback
  useEffect(() => {
    ttsService.onPlayStateChange((playing: boolean) => {
      setIsPlaying(playing);
      if (playing) {
        setHasPlayed(true);
      }
    });
  }, []);

  // Auto-play TTS for AI messages
  useEffect(() => {
    if (isAI && message.originalText) {
      // Small delay to ensure the message is rendered
      const timer = setTimeout(() => {
        ttsService.speak(message.originalText);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        ttsService.stop();
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
  };

  const handlePlayTTS = () => {
    console.log('Play button clicked');
    ttsService.speak(message.originalText);
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
            <div className="flex gap-2">
              {isPlaying ? (
                <button
                  onClick={handleStopTTS}
                  className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 active:bg-red-700 transition-colors"
                  title="Stop audio"
                >
                  ⏹️ Stop
                </button>
              ) : hasPlayed ? (
                <button
                  onClick={handlePlayTTS}
                  className="px-2 py-1 rounded text-xs bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition-colors"
                  title="Play audio again"
                >
                  ▶️ Play
                </button>
              ) : null}
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
} 