import React from 'react';
import sttService from '../services/sttService';

interface InputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (val: string) => void;
  loading: boolean;
}

export default function InputBar({ value, onChange, onSend, loading }: InputBarProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      onSend(value);
    }
  };

  const handleMic = async () => {
    const result = await sttService.startListening();
    if (result) {
      onChange(result);
    }
  };

  return (
    <div className="flex items-center p-2 border-t bg-gray-50">
      <button
        className="mr-2 p-2 rounded-full bg-blue-200 hover:bg-blue-300"
        onClick={handleMic}
        disabled={loading}
        title="Speak"
      >
        <span role="img" aria-label="mic">🎤</span>
      </button>
      <input
        className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring"
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder="Type or speak your response..."
      />
      <button
        className="ml-2 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300"
        onClick={() => onSend(value)}
        disabled={loading || !value.trim()}
      >
        Send
      </button>
    </div>
  );
} 