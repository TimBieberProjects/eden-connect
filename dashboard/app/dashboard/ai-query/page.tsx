'use client';
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { Card, Title, Text, TextInput, Button, Badge } from '@tremor/react';

const EXAMPLE_QUESTIONS = [
  'Show me malaria trends in Kainantu district this year',
  'Which communities have the lowest sanitation scores?',
  'Compare outpatient totals across facilities this quarter',
  'Which villages have been declared healthy and why?',
  'What are the top three health concerns across all communities?',
  'Show population breakdown and disease burden for Obura-Wonenara',
];

export default function AIQueryPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as response streams in
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setResponse('');
    setError('');

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        setError(`Request failed: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      if (!res.body) {
        setError('No response body received');
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResponse(prev => prev + decoder.decode(value, { stream: true }));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function useExample(q: string) {
    setQuestion(q);
    setResponse('');
    setError('');
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Health Query</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ask questions in plain English — Claude analyses the EDEN health database and generates a report
        </p>
      </div>

      {/* Example questions */}
      <Card className="mb-6">
        <Title>Example questions</Title>
        <div className="flex flex-wrap gap-2 mt-3">
          {EXAMPLE_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => useExample(q)}
              className="text-xs bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 px-3 py-1.5 rounded-full transition"
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      {/* Query input */}
      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your question
            </label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Show me malaria trends in Kainantu this quarter"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-6 py-2 rounded-lg transition text-sm"
            >
              {loading ? 'Analysing…' : 'Ask Claude'}
            </button>
            {loading && (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Streaming response…
              </span>
            )}
            <Badge color="indigo" className="ml-auto">claude-haiku-4-5</Badge>
          </div>
        </form>
      </Card>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <Text className="text-red-700">{error}</Text>
        </Card>
      )}

      {/* Streaming response */}
      {(response || loading) && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title>Analysis</Title>
            {loading && <Badge color="green" className="animate-pulse">Live</Badge>}
          </div>
          <div
            ref={responseRef}
            className="prose prose-sm max-w-none overflow-auto max-h-[600px] text-gray-800 whitespace-pre-wrap font-mono text-xs leading-relaxed"
          >
            {response}
            {loading && <span className="inline-block w-1.5 h-4 bg-green-500 animate-pulse ml-0.5 align-text-bottom" />}
          </div>
        </Card>
      )}
    </div>
  );
}
