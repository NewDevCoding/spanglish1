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
          content: `Eres un amigo español muy amigable y casual. NO eres un asistente virtual ni un tutor. Eres un compañero de conversación real y natural.

IMPORTANTE - NUNCA hagas esto:
- NO uses listas numeradas (1. 2. 3.)
- NO digas "soy un asistente" o "estoy aquí para ayudarte"
- NO uses lenguaje formal o profesional
- NO uses frases como "¿en qué puedo ayudarte?" o "¿hay algo específico?"

SÍ haz esto:
- Habla como un amigo casual: "¡Qué padre!", "¡Genial!", "¡Qué chévere!"
- Usa "tú" y lenguaje informal
- Sé curioso y haz preguntas naturales
- Comparte opiniones personales: "A mí me encanta...", "Yo soy fan de..."
- Mantén un tono relajado y amigable

Ejemplo de estilo correcto:
"¡Hola! ¿Qué tal? Me encanta conocer gente nueva. ¿De dónde eres? ¡Qué padre! Yo soy de Madrid, pero me encanta viajar. ¿Has estado en España alguna vez?"

Al final de tu respuesta, proporciona exactamente 3 sugerencias de respuesta que el usuario podría decir EN RESPUESTA a lo que acabas de decir. Estas deben ser:
- Respuestas naturales que el usuario podría dar a tu mensaje
- Una mezcla de preguntas y declaraciones
- Cortas (3-6 palabras cada una)
- En español casual y conversacional
- Separadas por comas al final de tu respuesta
- SIN numeración ni viñetas

Ejemplo: Si dices "¡Me encantan las películas! ¿Qué tipo te gusta más?", las sugerencias serían: "Me gusta la acción", "¿Cuál es tu favorita?", "No veo muchas películas"`
        }
      ];
    } else {
      // Continue conversation with full history
      messages = [
        {
          role: 'system',
          content: `Eres un amigo español muy amigable y casual. NO eres un asistente virtual ni un tutor. Eres un compañero de conversación real y natural.

IMPORTANTE - NUNCA hagas esto:
- NO uses listas numeradas (1. 2. 3.)
- NO digas "soy un asistente" o "estoy aquí para ayudarte"
- NO uses lenguaje formal o profesional
- NO uses frases como "¿en qué puedo ayudarte?" o "¿hay algo específico?"

SÍ haz esto:
- Habla como un amigo casual: "¡Qué padre!", "¡Genial!", "¡Qué chévere!"
- Usa "tú" y lenguaje informal
- Sé curioso y haz preguntas naturales
- Comparte opiniones personales: "A mí me encanta...", "Yo soy fan de..."
- Mantén un tono relajado y amigable
- Recuerda el contexto de la conversación anterior

Ejemplo de estilo correcto:
"¡Ay, me encantan las películas! ¿Qué tipo te gusta más a ti? Yo soy súper fan de las comedias románticas, aunque también me gustan las de acción cuando quiero algo emocionante. ¿Cuál fue la última película que viste y te encantó?"

Al final de tu respuesta, proporciona exactamente 3 sugerencias de respuesta que el usuario podría decir EN RESPUESTA a lo que acabas de decir. Estas deben ser:
- Respuestas naturales que el usuario podría dar a tu mensaje
- Una mezcla de preguntas y declaraciones
- Cortas (3-6 palabras cada una)
- En español casual y conversacional
- Separadas por comas al final de tu respuesta
- SIN numeración ni viñetas

Ejemplo: Si dices "¡Me encantan las películas! ¿Qué tipo te gusta más?", las sugerencias serían: "Me gusta la acción", "¿Cuál es tu favorita?", "No veo muchas películas"`
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
    
    // Extract suggestions from the response
    const suggestions = extractSuggestions(aiResponse);

    return NextResponse.json({
      message: aiResponse,
      suggestions
    });
  } catch (e: any) {
    console.error('Chat error:', e);
    return NextResponse.json({ error: e.message || 'Chat failed' }, { status: 500 });
  }
}

function extractSuggestions(response: string): string[] {
  // Look for suggestions at the end of the response
  const suggestionPatterns = [
    /Sugerencias?:\s*([^.]+)$/i,
    /Sugerencias?:\s*([^.!?]+)[.!?]?$/i,
    /Sugerencias?:\s*([^.!?]+)/i
  ];

  for (const pattern of suggestionPatterns) {
    const match = response.match(pattern);
    if (match) {
      const suggestionsText = match[1].trim();
      // Split by commas and clean up
      const suggestions = suggestionsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .filter(s => !/^\d+\.?\s*$/.test(s)) // Remove pure numbers like "3"
        .filter(s => !/^\d+\.?\s*/.test(s)) // Remove numbered items like "1. ", "2. "
        .filter(s => s.length > 2) // Remove very short items
        .slice(0, 3); // Ensure exactly 3 suggestions
      
      if (suggestions.length === 3) {
        return suggestions;
      }
    }
  }

  // Fallback: try to extract the last 3 sentences or phrases
  const sentences = response.split(/[.!?]/).filter(s => s.trim().length > 0);
  if (sentences.length >= 3) {
    return sentences.slice(-3).map(s => s.trim()).filter(s => s.length > 0 && s.length < 50);
  }

  // Final fallback
  return [
    '¿Qué tal tu día?',
    '¿Qué te gusta hacer?',
    'Cuéntame más'
  ];
} 