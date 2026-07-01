/**
 * ai.js — AI integration with priority fallback
 * Priority: VITE_GROQ_API_KEY → VITE_OPENAI_API_KEY → mock
 */

import { mockSummary } from './data.js';

const SYSTEM_PROMPT = 'You are a concise assistant. Summarize the following text in 2 sentences.';
const MAX_TOKENS = 150;

/**
 * Determine the active AI source based on available env vars.
 * Returns 'groq', 'openai', or 'mock'.
 */
export function getAiSource() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_GROQ_API_KEY) return 'groq';
    if (import.meta.env.VITE_OPENAI_API_KEY) return 'openai';
  }
  return 'mock';
}

/**
 * Run AI summarization with fallback chain.
 * @param {string} inputText
 * @returns {{ summary: string, source: string }}
 */
export async function runSummarize(inputText) {
  const source = getAiSource();

  if (source === 'groq') {
    try {
      const result = await callGroq(inputText);
      return { summary: result, source: 'groq' };
    } catch (err) {
      console.warn('Groq API failed, falling back to mock:', err);
    }
  }

  if (source === 'openai') {
    try {
      const result = await callOpenAI(inputText);
      return { summary: result, source: 'openai' };
    } catch (err) {
      console.warn('OpenAI API failed, falling back to mock:', err);
    }
  }

  // Mock fallback
  await simulateDelay(600);
  return { summary: mockSummary(inputText), source: 'mock' };
}

async function callGroq(inputText) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: inputText },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? mockSummary(inputText);
}

async function callOpenAI(inputText) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: inputText },
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? mockSummary(inputText);
}

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
