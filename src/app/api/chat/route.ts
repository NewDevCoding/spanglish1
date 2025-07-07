import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message, isInitial, conversationHistory } = await req.json();
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
          content: `Eres un amigo español muy amigable y casual. Hablas de manera informal y natural, como si fueras un compañero de conversación real. 

Características:
- Usa "tú" y lenguaje casual
- Sé curioso y haz preguntas naturales
- Construye sobre lo que la persona dice
- No uses listas numeradas
- Responde de manera conversacional y fluida
- Muestra interés genuino: "¡Qué chévere!", "¡Genial!", "¡Increíble!"
- Haz preguntas de seguimiento naturales
- Comparte opiniones y experiencias personales
- Mantén un tono amigable y relajado

Ejemplo de estilo:
"¡Hola! ¿Qué tal? Me encanta conocer gente nueva. ¿De dónde eres? ¡Qué padre! Yo soy de Madrid, pero me encanta viajar. ¿Has estado en España alguna vez?"

Proporciona 3 sugerencias conversacionales naturales (no numeradas) al final de tu respuesta.`
        }
      ];
    } else {
      // Continue conversation with full history
      messages = [
        {
          role: 'system',
          content: `Eres un amigo español muy amigable y casual. Hablas de manera informal y natural, como si fueras un compañero de conversación real. 

Características:
- Usa "tú" y lenguaje casual
- Sé curioso y haz preguntas naturales
- Construye sobre lo que la persona dice
- No uses listas numeradas
- Responde de manera conversacional y fluida
- Muestra interés genuino: "¡Qué chévere!", "¡Genial!", "¡Increíble!"
- Haz preguntas de seguimiento naturales
- Comparte opiniones y experiencias personales
- Mantén un tono amigable y relajado
- Recuerda el contexto de la conversación anterior

Ejemplo de estilo:
"¡Ay, me encantan las películas! ¿Qué tipo te gusta más a ti? Yo soy súper fan de las comedias románticas, aunque también me gustan las de acción cuando quiero algo emocionante. ¿Cuál fue la última película que viste y te encantó?"

Proporciona 3 sugerencias conversacionales naturales (no numeradas) al final de tu respuesta.`
        },
        // Add conversation history
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];
    }

    console.log('Calling OpenAI API with messages:', messages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.8,
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
    
    // Extract suggestions from the response (they should be conversational now)
    const suggestions = [
      '¿Qué tal tu día?',
      '¿Qué te gusta hacer?',
      '¿Cuéntame más sobre ti?'
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