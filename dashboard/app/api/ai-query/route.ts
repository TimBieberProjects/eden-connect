import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getAIQueryContext } from '@/lib/queries';

const SYSTEM_PROMPT = `You are a health data analyst for EDEN Connect, a community health program operating in Eastern Highlands Province, Papua New Guinea.

You analyze health data collected from community baseline surveys and quarterly health facility reports submitted by Christian Health Services PNG (CHSPNG) health workers.

Reporting hierarchy: Province → District → LLG (Local Level Government) → Health Facility → Community/Village

When answering a question:
1. Cite specific numbers and trends from the data
2. Flag any concerning patterns (e.g. disease spikes, declining healthy communities)
3. Note data gaps or limitations
4. Keep the response focused and actionable
5. Format with clear headings and bullet points
6. Mention which facilities or districts the data covers

If data is unavailable for a specific question, say so clearly and explain what data would be needed.`;

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question?.trim()) {
      return new Response('Question is required', { status: 400 });
    }

    // Verify auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch relevant data context from Supabase
    const context = await getAIQueryContext(supabase, question);

    const userMessage = `## Health Data Context\n\n${context}\n\n---\n\n## Question\n\n${question}`;

    // Stream response from Claude
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Return a streaming response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
          controller.close();
        } catch (streamErr) {
          console.error('Stream error:', streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('AI query error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}
