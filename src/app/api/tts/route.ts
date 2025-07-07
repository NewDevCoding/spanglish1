import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.VAPI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Vapi API key' }, { status: 500 });
  }

  try {
    // Vapi TTS endpoint - you may need to adjust based on their specific API
    const response = await fetch('https://api.vapi.ai/speech/synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: 'spanish', // or specific voice ID from Vapi
        language: 'es',
        speed: 1.0,
        pitch: 1.0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vapi TTS error:', errorData);
      return NextResponse.json({ error: errorData.message || 'TTS failed' }, { status: 500 });
    }

    // Vapi should return audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Return the audio data as base64 or binary
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg', // or appropriate audio format
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (e: any) {
    console.error('TTS error:', e);
    return NextResponse.json({ error: e.message || 'TTS failed' }, { status: 500 });
  }
} 