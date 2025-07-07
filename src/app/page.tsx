"use client";
import React, { useEffect, useState, useRef } from "react";
import ChatWindow from "../components/ChatWindow";
import InputBar from "../components/InputBar";
import SuggestionsBar from "../components/SuggestionsBar";
import chatService from "../services/chatService";
import translationService from "../services/translationService";
import persistenceService from "../services/persistenceService";
import ttsService from "../services/ttsService";
import { Message } from "../utils/formatters";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = persistenceService.loadChatHistory();
    if (history && history.length > 0) {
      setMessages(history);
      const lastAIMsg = [...history].reverse().find((m) => m.sender === "ai");
      setSuggestions(lastAIMsg?.suggestions || []);
    } else {
      chatService.getInitialMessage().then(({ message, suggestions }) => {
        setMessages([message]);
        setSuggestions(suggestions);
        persistenceService.saveChatHistory([message]);
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      persistenceService.saveChatHistory(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Stop any playing TTS
    ttsService.stop();

    const userMessage: Message = {
      id: Date.now() + '-user',
      sender: 'user',
      originalText: text,
      translatedText: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    // Clear the input field immediately after sending
    setInputText("");

    try {
      // Translate user message
      const translatedUser = await translationService.translate(text, 'es', 'en');
      userMessage.translatedText = translatedUser;
      setMessages(prev => [...prev.slice(0, -1), userMessage]);

      // Get AI response with conversation history
      const aiResponse = await chatService.getAIResponse(text, messages);
      
      // Translate AI response
      const translatedAI = await translationService.translate(aiResponse.message.originalText, 'es', 'en');
      aiResponse.message.translatedText = translatedAI;

      setMessages(prev => [...prev, aiResponse.message]);
      setSuggestions(aiResponse.suggestions);

      // Auto-play AI message
      ttsService.speak(aiResponse.message.originalText);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Auto-send the suggestion as a message
    await handleSendMessage(suggestion);
  };

  const handleUserMessage = () => {
    // Stop TTS when user sends a message
    ttsService.stop();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
        <div className="flex-1 overflow-y-auto p-4" ref={chatWindowRef}>
          <ChatWindow 
            messages={messages} 
            onUserMessage={handleUserMessage}
          />
        </div>
        <SuggestionsBar suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
        <InputBar
          value={inputText}
          onChange={setInputText}
          onSend={handleSendMessage}
          loading={loading}
        />
        {error && <div className="text-red-500 text-center py-2">{error}</div>}
      </div>
    </div>
  );
}
