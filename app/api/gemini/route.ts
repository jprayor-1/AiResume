import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile } from 'node:fs/promises';
import fs from 'fs';
import path from 'path';
// @ts-expect-error: pdf-parse CJS import
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json(); // how does this work

    const filePath = path.join(process.cwd(), 'JprayorResume.pdf');
    const buffer = fs.readFileSync(filePath);

    // pdf-parse v1.x
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(`can you summarize my resume: /n${resumeText}`);
    const text = result.response.text();

    return NextResponse.json({ output: text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
