import React from 'react';

interface SuggestionsBarProps {
  suggestions: string[];
  onSuggestionClick: (s: string) => void;
}

export default function SuggestionsBar({ suggestions, onSuggestionClick }: SuggestionsBarProps) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="flex space-x-2 px-4 py-2 bg-gray-200 border-t overflow-x-auto">
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="px-3 py-1 rounded bg-blue-300 text-blue-900 hover:bg-blue-400 text-sm whitespace-nowrap"
          onClick={() => onSuggestionClick(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
} 