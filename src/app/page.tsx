// src/app/page.tsx
'use client'; 

import ChatWidget from "@/components/ChatWidget";
import { useState } from 'react'; 
import { ArrowDownRight } from 'lucide-react';

// Define the structure for the lead data here as well
type LeadData = {
  service?: string | null;
  urgency?: 'emergency' | 'quote' | null;
  address?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  isComplete?: boolean;
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  // New: State to hold the structured lead data from the widget
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  return (
    <div className="bg-white text-slate-800 min-h-screen relative">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-indigo-600">BetterBots</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="grid lg:grid-cols-2 gap-8 items-center min-h-screen p-8 pt-24">
        {/* Left Side: Hero Text */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Don&apos;t just get visitors.
            <br />
            Get qualified leads.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            This is a live demonstration of our AI Dispatcher for home services.
            Start a conversation with the bot and watch as it extracts the information into a structured lead sheet in real-time.
          </p>
        </div>

        {/* Right Side: Live Lead Sheet */}
        <div className="bg-slate-100 p-6 rounded-lg border border-slate-200 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">Live Lead Sheet</h2>
          <pre className="text-sm bg-slate-800 text-white p-4 rounded-md overflow-x-auto">
            {JSON.stringify(leadData, null, 2)}
          </pre>
          <p className="text-xs text-slate-500 mt-4">This panel shows the structured JSON data captured by the AI in real-time.</p>
        </div>
      </main>

      <ChatWidget 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLeadDataUpdate={setLeadData} // Pass the setter function to the widget
        clientId="betterbots-demo" // Tell the widget which bot to use
      />
    </div>
  );
}