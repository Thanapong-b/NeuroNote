import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ summary: 'No content to summarize.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Summarize this note in 2-3 concise sentences. Be direct and capture the key points:\n\n${content}`,
        }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ summary: 'AI service unavailable. Please try again.' });
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text ?? 'Could not generate summary.';
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: 'AI summary failed. Please check your connection.' });
  }
}
