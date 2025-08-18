// src/app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Supabase client
// We use process.env to access the environment variables you set in .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize the Google Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// This function handles POST requests to /api/chat
export async function POST(req: Request) {
  try {
    // 1. Extract the message and clientId from the request body
    const { clientId, message } = await req.json();

    if (!clientId || !message) {
      return NextResponse.json(
        { error: 'clientId and message are required.' },
        { status: 400 }
      );
    }

    // 2. Fetch the client's unique configuration from your Supabase database
    const { data: clientConfig, error } = await supabase
      .from('clients')
      .select('training_prompt, branding')
      .eq('client_id', clientId)
      .single(); // .single() expects only one result

    if (error || !clientConfig) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Client configuration not found for ID: ${clientId}` },
        { status: 404 }
      );
    }

    // 3. Construct the prompt for the AI with the client's specific training data
    const fullPrompt = `${clientConfig.training_prompt}\n\nUser: ${message}\nAssistant:`;

    // 4. Call the Gemini API to get a smart response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const botReply = response.text();

    // 5. Send the successful response back to the widget
    return NextResponse.json({
      reply: botReply,
      branding: clientConfig.branding,
    });

  } catch (error) {
    // Handle any unexpected errors
    console.error('An internal error occurred:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}