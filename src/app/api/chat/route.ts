import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, isInitial } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  console.log('Chat request:', { message, isInitial });
  console.log('API key present:', !!apiKey);
  console.log('API key format:', apiKey ? `${apiKey.substring(0, 7)}...` : 'none');

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
  }

  try {
    let messages;
    
    if (isInitial) {
      // Initial greeting
      messages = [
        {
          role: 'system',
          content: 'You are a friendly Spanish language tutor. Always respond in Spanish. Be encouraging and helpful. Keep responses conversational and not too long. Provide 3 helpful suggestions for what the user could say next.'
        }
      ];
    } else {
      // Continue conversation
      messages = [
        {
          role: 'system',
          content: 'You are a friendly Spanish language tutor. Always respond in Spanish. Be encouraging and helpful. Keep responses conversational and not too long. Provide 3 helpful suggestions for what the user could say next.'
        },
        {
          role: 'user',
          content: message
        }
      ];
    }

    console.log('Calling OpenAI API with messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('OpenAI API full response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const aiResponse = data.choices[0].message.content;
    
    // Extract suggestions from the response (assuming they're provided)
    const suggestions = [
      '¿Cómo estás?',
      '¿De dónde eres?',
      '¿Qué te gusta hacer?'
    ];

    return NextResponse.json({
      message: aiResponse,
      suggestions
    });
  } catch (e: any) {
    console.error('Chat error:', e);
    return NextResponse.json({ error: e.message || 'Chat failed' }, { status: 500 });
  }
} 