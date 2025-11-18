import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, writeFile } from 'node:fs/promises';
import fs from 'fs';
import path from 'path';
// @ts-expect-error: pdf-parse CJS import
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { join } from 'node:path';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const TECH_SKILLS = ["python", "react", "node", "aws", "docker", "javascript","typescript", "next"]
const GENERAL_SKILLS = ["design", "build", "optimize", "deploy", "test"]
const SWE_KEYWORDS = ["api", "distributed", "scalable", "frontend", "backend"]
const SENORITY_MAP = {'Lead':.2, 'Mid-level': 1, 'Senior': .75, 'Associate': .3, 'Entry': .1, 'Entry-level': .1}
const INDUSTRY_MAP = {
    'Technology': .8,
    'Technology & Analytics': .8,
    'Software Testing': .8,
    'Consulting': .6,
    'Marketing': .5,
    'Marketing & Advertising': .5,
    'Human Resources': .2,
    'Automotive': .5,
    'Healthcare': 1
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json(); // how does this work

    // read your JSON files
    const linkedIn_jobs =  path.join(process.cwd(), 'mock_linkedin_jobs.json');
    const jsonData = fs.readFileSync(linkedIn_jobs, 'utf-8');
    const jobsObject = JSON.parse(jsonData);

    // Iterate through each job
    for (const currentJob of jobsObject.jobs) {
        const jobText = (currentJob.description || "").toLowerCase()

        // calculate tech score
        const matchedTech =  TECH_SKILLS.filter(tech => jobText.includes(tech))
        const techScore = matchedTech.length / TECH_SKILLS.length * 40
        currentJob['tech_score'] = techScore
        currentJob['seniority_score'] = (currentJob.seniority in SENORITY_MAP ? SENORITY_MAP[currentJob.seniority] : .5) * 30 
        currentJob['domain_score'] = (currentJob.industry in INDUSTRY_MAP ? INDUSTRY_MAP[currentJob.industry] : .5) * 30
        currentJob['final_score'] = currentJob['tech_score'] + currentJob['seniority_score'] + currentJob['domain_score']
    }

    const jobText = JSON.stringify(jobsObject)
    


    // Resume
    const resume = path.join(process.cwd(), 'JprayorResume.pdf');
    const buffer = fs.readFileSync(resume);

    // pdf-parse v1.x
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

   
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(`
        You are an AI assistant that evaluates job postings for how well they match a candidate’s background. 
        You MUST base your reasoning only on the structured scores and the provided text. 
        Do not invent details that are not provided. 
        You summarize clearly and concisely.
        user's resume job info: ${resumeText}
        jobs: ${jobText}
    `);
    const text = result.response.text();



    return NextResponse.json({ output: text});
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
