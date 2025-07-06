"use client";
import React, { useEffect, useState, useRef } from "react";
import ChatWindow from "../components/ChatWindow";
import InputBar from "../components/InputBar";
import SuggestionsBar from "../components/SuggestionsBar";
import chatService from "../services/chatService";
import translationService from "../services/translationService";
import persistenceService from "../services/persistenceService";
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

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const userMsg: Message = {
        id: Date.now() + "-user",
        sender: "user",
        originalText: text,
        translatedText: await translationService.translate(text, "es", "en"),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");

      const { message: aiMsg, suggestions: newSuggestions } = await chatService.getAIResponse(text);
      aiMsg.translatedText = await translationService.translate(aiMsg.originalText, "es", "en");
      setMessages((prev) => [...prev, aiMsg]);
      setSuggestions(newSuggestions);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
        <div className="flex-1 overflow-y-auto p-4" ref={chatWindowRef}>
          <ChatWindow messages={messages} />
        </div>
        <SuggestionsBar suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
        <InputBar
          value={inputText}
          onChange={setInputText}
          onSend={handleSend}
          loading={loading}
        />
        {error && <div className="text-red-500 text-center py-2">{error}</div>}
      </div>
    </div>
  );
}
