import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json(); // how does this work

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ output: text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
