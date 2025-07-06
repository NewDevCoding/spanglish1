import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, from, to } = await req.json();
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  console.log('Translation request:', { text, from, to });
  console.log('API key present:', !!apiKey);

  if (!apiKey) {
    console.error('Missing Google Translate API key');
    return NextResponse.json({ error: 'Missing Google Translate API key' }, { status: 500 });
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    console.log('Calling Google Translate API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text',
      }),
    });
    
    const data = await response.json();
    console.log('Google API response:', data);
    
    if (data.error) {
      console.error('Google API error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }
    
    const translated = data.data.translations[0].translatedText;
    console.log('Translation result:', translated);
    return NextResponse.json({ translated });
  } catch (e: any) {
    console.error('Translation error:', e);
    return NextResponse.json({ error: e.message || 'Translation failed' }, { status: 500 });
  }
} 