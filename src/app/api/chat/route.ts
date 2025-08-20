// src/app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase and Gemini Clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are an expert AI dispatcher for a professional home services company.", 
});

// Define the structure for the lead data we want to extract
interface LeadData {
  service: string | null;
  urgency: 'emergency' | 'quote' | null;
  address: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  isComplete: boolean;
}

export async function POST(req: Request) {
  try {
    const { clientId, message, history = [] } = await req.json();

    if (!clientId || !message) {
      return NextResponse.json({ error: 'clientId and message are required.' }, { status: 400 });
    }

    const { data: clientConfig, error } = await supabase
      .from('clients')
      .select('training_prompt')
      .eq('client_id', clientId)
      .single();

    if (error || !clientConfig) {
      return NextResponse.json({ error: `Client configuration not found.` }, { status: 404 });
    }

    const fullPrompt = `
      ${clientConfig.training_prompt}

      ---
      Here is the current conversation history:
      ${JSON.stringify(history)}

      Here is the latest user message: "${message}"
      ---

      Based on the workflow, provide a conversational reply to the user.
      After the reply, extract the information gathered SO FAR into a VALID JSON object.
      The JSON object must follow this exact structure:
      {
        "service": "string or null",
        "urgency": "'emergency', 'quote', or null",
        "address": "string or null",
        "fullName": "string or null",
        "phone": "string or null",
        "email": "string or null",
        "isComplete": boolean
      }
      
      Your entire response must be a single string containing the reply, followed by "|||", followed by the JSON object.
      EXAMPLE RESPONSE FORMAT:
      Thank you, I have your address. Is this an emergency or are you looking for a quote?|||{"service":"HVAC","urgency":null,"address":"123 Main St, Anytown, USA","fullName":null,"phone":null,"email":null,"isComplete":false}
    `;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    const parts = responseText.split('|||');
    const reply = parts[0].trim();
    let jsonString = parts[1] ? parts[1].trim() : '{}';

    // THIS IS THE FIX: Clean the JSON string if it's wrapped in Markdown fences
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    }

    const leadDataJson = JSON.parse(jsonString);

    return NextResponse.json({
      reply: reply,
      leadData: leadDataJson,
    });

  } catch (error) {
    console.error('An internal error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}