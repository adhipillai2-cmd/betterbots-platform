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

export async function POST(req: Request) {
  try {
    const { clientId, message, history = [] } = await req.json();

    if (!clientId || !message) {
      return NextResponse.json({ error: 'clientId and message are required.' }, { status: 400 });
    }

    const { data: clientConfig, error } = await supabase
      .from('clients')
      .select('training_prompt, services_offered, service_area_zip_codes, business_hours, booking_link, notification_email, notification_phone')
      .eq('client_id', clientId)
      .single();

    if (error || !clientConfig) {
      return NextResponse.json({ error: `Client configuration not found.` }, { status: 404 });
    }

    const fullPrompt = `
      You have the following specific information about the business you work for:
      - Services Offered: ${JSON.stringify(clientConfig.services_offered) || 'Not specified.'}
      - Service Area ZIP Codes: ${clientConfig.service_area_zip_codes?.join(', ') || 'Not specified.'}
      - Business Hours: ${JSON.stringify(clientConfig.business_hours) || 'Not specified.'}
      
      Begin by following the main training prompt below. Use the specific information above to answer user questions accurately if they ask.
      ---
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
    `;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    const parts = responseText.split('|||');
    const reply = parts[0].trim();
    let jsonString = parts[1] ? parts[1].trim() : '{}';

    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    }

    const leadDataJson = JSON.parse(jsonString);

    // --- FUTURE INTEGRATION: LEAD NOTIFICATIONS ---
    // When a lead is marked as complete by the AI, the code to send
    // email and SMS alerts will go here.
    if (leadDataJson.isComplete) {
      console.log(`LEAD CAPTURED FOR ${clientId}:`, leadDataJson);
      // TODO: Add SendGrid/Resend email logic here using clientConfig.notification_email
      // TODO: Add Twilio SMS logic here using clientConfig.notification_phone
    }
    // ------------------------------------------------

    return NextResponse.json({
      reply: reply,
      leadData: leadDataJson,
    });

  } catch (error) {
    console.error('An internal error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}