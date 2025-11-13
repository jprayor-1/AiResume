'use client';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  async function handleGenerate() {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.output);
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Google Gemini + Next.js</h1>
      <textarea
        className="border p-2 w-full rounded mb-4"
        rows={4}
        placeholder="Ask something..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Generate
      </button>
      {response && (
        <div className="mt-6 border p-4 rounded bg-white-50">
          <h2 className="font-semibold mb-2">Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </main>
  );
}