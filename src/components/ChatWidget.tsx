// src/components/ChatWidget.tsx

'use client'; // This is a required directive for components that use interactivity

import { useState } from 'react';

// Define the structure of a chat message
type Message = {
  sender: 'user' | 'bot';
  text: string;
};

export default function ChatWidget() {
  // State variables to manage the widget's behavior
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hi there! How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat immediately for a responsive feel
    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call our own backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // For now, we are hardcoding the client ID for testing.
          // Later, this will be passed in dynamically.
          clientId: 'better-bakery-demo', 
          message: input
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add the bot's response to the chat
      const botMessage: Message = { sender: 'bot', text: data.reply };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CHAT BUBBLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-16 h-16 bg-indigo-600 rounded-full text-white flex items-center justify-center text-3xl shadow-lg hover:bg-indigo-700 transition-colors"
      >
        💬
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-lg">Echo AI Assistant</h3>
          </div>

          {/* Message Log */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.sender === 'bot'
                    ? 'bg-gray-200 text-gray-800 self-start'
                    : 'bg-indigo-500 text-white self-end'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="ml-2 px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-300"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}