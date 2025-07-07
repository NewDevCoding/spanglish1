import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const apiKey = process.env.VAPI_API_KEY;

  console.log('TTS request received:', { text, hasApiKey: !!apiKey });

  if (!apiKey) {
    console.log('No Vapi API key, returning error');
    return NextResponse.json({ error: 'Missing Vapi API key' }, { status: 500 });
  }

  try {
    // For now, let's return an error to test the fallback
    // This will force the app to use browser speech synthesis
    console.log('Vapi TTS not fully implemented yet, using fallback');
    return NextResponse.json({ error: 'Vapi TTS not configured' }, { status: 500 });
    
    // TODO: Implement actual Vapi TTS integration
    // const response = await fetch('https://api.vapi.ai/speech/synthesize', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     text: text,
    //     voice: 'spanish',
    //     language: 'es',
    //     speed: 1.0,
    //     pitch: 1.0,
    //   }),
    // });

    // if (!response.ok) {
    //   const errorData = await response.json();
    //   console.error('Vapi TTS error:', errorData);
    //   return NextResponse.json({ error: errorData.message || 'TTS failed' }, { status: 500 });
    // }

    // const audioBuffer = await response.arrayBuffer();
    
    // return new NextResponse(audioBuffer, {
    //   headers: {
    //     'Content-Type': 'audio/mpeg',
    //     'Content-Length': audioBuffer.byteLength.toString(),
    //   },
    // });

  } catch (e: any) {
    console.error('TTS error:', e);
    return NextResponse.json({ error: e.message || 'TTS failed' }, { status: 500 });
  }
} 