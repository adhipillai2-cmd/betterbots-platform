// src/components/ChatWidget.tsx
'use client';

import { useState, Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { SendHorizonal, X } from 'lucide-react';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

interface ChatWidgetProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ChatWidget({ isOpen, setIsOpen }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Welcome! How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the chat log
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: 'betterbots-demo', // Using a test client ID
          message: input
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const botMessage: Message = { sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CHAT BUBBLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full text-white flex items-center justify-center text-3xl shadow-lg hover:from-indigo-700 hover:to-violet-700 transition-all hover:scale-110 z-50"
        aria-label="Toggle Chat"
      >
        {isOpen ? <X size={30} /> : '💬'}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-[380px] h-[70vh] max-h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up-fade">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-700 to-violet-600 text-white p-5 rounded-t-2xl text-center">
            <h3 className="font-bold text-lg">BetterBots Assistant</h3>
            <p className="text-sm text-indigo-200">Online and ready to help</p>
          </div>

          {/* Message Log */}
          <div ref={chatLogRef} className="flex-1 p-5 overflow-y-auto flex flex-col space-y-4 bg-slate-100">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 px-4 rounded-xl max-w-[85%] w-fit ${
                  msg.sender === 'bot'
                    ? 'bg-slate-200 text-gray-800 self-start'
                    : 'bg-indigo-600 text-white self-end'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 flex items-center space-x-3 rounded-b-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="p-3 bg-violet-600 text-white rounded-lg disabled:bg-violet-300 hover:bg-violet-700 transition-colors"
              aria-label="Send Message"
            >
              <SendHorizonal size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}