// src/app/page.tsx
'use client'; 

import ChatWidget from "@/components/ChatWidget";
import { useState } from 'react'; 
import { ArrowDownRight } from 'lucide-react'; // We'll use this for the arrow

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Add 'relative' to allow positioning the arrow inside this container
    <div className="bg-white text-slate-800 min-h-screen relative">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-indigo-600">BetterBots</span>
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Don&apos;t just get visitors.
                <br />
                Get customers.
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                BetterBots engages every website visitor with a smart AI assistant,
                answering questions and capturing leads 24/7.
              </p>
              {/* The "Try the Live Demo" button has been removed from here */}
            </div>
          </div>
        </div>
      </main>

      {/* Social Proof Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
            The trusted AI assistant for leading local businesses
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <p className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-center text-gray-400 font-bold text-xl">Client Logo</p>
            <p className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-center text-gray-400 font-bold text-xl">Local Biz</p>
            <p className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 text-center text-gray-400 font-bold text-xl">Startup Inc.</p>
            <p className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 text-center text-gray-400 font-bold text-xl">Your Biz Here</p>
            <p className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 text-center text-gray-400 font-bold text-xl">Service Co.</p>
          </div>
        </div>
      </div>
      
      {/* NEW: Arrow pointing to the widget */}
      <div className="absolute bottom-24 right-28 flex items-center space-x-2 animate-pulse">
        <p className="text-lg font-semibold text-indigo-600">Try the live demo!</p>
        <ArrowDownRight className="w-8 h-8 text-indigo-600" />
      </div>

      <ChatWidget isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}