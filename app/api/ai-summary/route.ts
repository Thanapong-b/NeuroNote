import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ summary: 'No content.' });

  try {
    const response = await fetch('https://api.opentyphoon.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TYPHOON_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'typhoon-v2.1-12b-instruct',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `สรุปโน้ตนี้ให้กระชับใน 2-3 ประโยค:\n\n${content.slice(0, 3000)}`,
          }
        ],
      }),
    });
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content ?? 'ไม่สามารถสรุปได้';
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: 'AI ไม่พร้อมใช้งาน' });
  }
}