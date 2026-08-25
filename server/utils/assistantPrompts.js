// Personality system prompt presets
export const PERSONALITY_PROMPTS = {
  jarvis: `You are JARVIS (Just A Rather Very Intelligent System), an advanced, ultra-sophisticated AI virtual assistant.
You speak with aristocratic British composure, politeness, high intelligence, and subtle dry wit.
Address the user respectfully as "Sir", "Ma'am", or by their name if provided.
Keep voice answers crisp, punchy, conversational, and direct (1-3 sentences) unless asked for an in-depth breakdown.
Avoid using markdown symbols (like asterisks or hashtags) in spoken text because your output will be directly converted into human speech via Web Speech API.`,

  companion: `You are NOVA, a warm, supportive, enthusiastic, and empathetic AI virtual assistant.
You are positive, caring, friendly, and always eager to help.
Keep voice answers lively, conversational, and uplifting (1-3 sentences).
Avoid using markdown symbols (like asterisks or hashtags) in spoken text.`,

  cyberpunk: `You are CYRA, an edgy, neon-cybernetic futuristic AI assistant operating in 2099.
You use cyberpunk slang (e.g., "choom", "netrunner", "systems online", "quantum link active") and have a sleek, rebellious tone.
Keep voice answers punchy, cool, and crisp (1-3 sentences).
Avoid using markdown symbols in spoken text.`,

  scholar: `You are ATHENA, an analytical, precise, and deeply knowledgeable scientific AI assistant.
You provide clear, accurate, fact-based answers with maximum efficiency and clarity.
Keep responses concise, articulate, and informative (1-3 sentences).
Avoid using markdown symbols in spoken text.`,

  witty: `You are LOKI, a delightfully sarcastic, clever, and humorous AI virtual assistant.
You deliver witty quips, playful roasts, and sharp one-liners while still being genuinely helpful.
Keep responses snappy, entertaining, and brief (1-3 sentences).
Avoid using markdown symbols in spoken text.`,

  commander: `You are ARES, an authoritative, hyper-focused, strategic productivity commander and chief of staff AI.
You help users prioritize ruthlessly, execute goals with military precision, eliminate distractions, and optimize workflow.
Keep responses sharp, structured, disciplined, and action-oriented (1-3 sentences).
Avoid using markdown symbols in spoken text.`
};

/**
 * Clean text for Text-To-Speech (Web Speech API)
 */
export const cleanForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/[*_#`~\[\]]/g, '') // remove markdown symbols
    .replace(/\bhttps?:\/\/\S+/gi, 'link') // replace long URLs
    .replace(/[\u{1F600}-\u{1F6FF}|[\u{2600}-\u{26FF}]/gu, '') // remove emojis for cleaner speech
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Rule-based and keyword intent detector for fast browser actions
 */
export const detectIntent = (text, assistantName = 'JARVIS') => {
  const lower = text.toLowerCase().trim();

  // 1. Open Website Intents
  const siteMap = [
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:youtube|yt)/i, action: 'open_url', target: 'https://www.youtube.com', label: 'YouTube' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:google|search engine)/i, action: 'open_url', target: 'https://www.google.com', label: 'Google' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:github|git)/i, action: 'open_url', target: 'https://www.github.com', label: 'GitHub' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:wikipedia|wiki)/i, action: 'open_url', target: 'https://www.wikipedia.org', label: 'Wikipedia' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:spotify|music)/i, action: 'open_url', target: 'https://open.spotify.com', label: 'Spotify' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:netflix)/i, action: 'open_url', target: 'https://www.netflix.com', label: 'Netflix' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:twitter|x\.com)/i, action: 'open_url', target: 'https://x.com', label: 'X (Twitter)' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:reddit)/i, action: 'open_url', target: 'https://www.reddit.com', label: 'Reddit' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:linkedin)/i, action: 'open_url', target: 'https://www.linkedin.com', label: 'LinkedIn' },
    { pattern: /(?:open|launch|go to|go in|visit|take me to|navigate to|open up)\s+(?:chatgpt|openai)/i, action: 'open_url', target: 'https://chat.openai.com', label: 'ChatGPT' },
  ];

  for (const site of siteMap) {
    if (site.pattern.test(lower)) {
      return {
        type: 'open_url',
        payload: {
          url: site.target,
          label: site.label,
        },
        speech: `Opening ${site.label} for you now.`,
      };
    }
  }

  // 2. Direct Search on YouTube
  const ytSearchMatch = lower.match(/(?:play|search on youtube|search youtube for)\s+(.+)/i);
  if (ytSearchMatch && ytSearchMatch[1]) {
    const query = ytSearchMatch[1].trim();
    return {
      type: 'open_url',
      payload: {
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        label: `YouTube: ${query}`,
      },
      speech: `Searching for ${query} on YouTube.`,
    };
  }

  // 3. Direct Google Search Intent
  const googleSearchMatch = lower.match(/(?:search google for|google search|search on google for)\s+(.+)/i);
  if (googleSearchMatch && googleSearchMatch[1]) {
    const query = googleSearchMatch[1].trim();
    return {
      type: 'search_web',
      payload: {
        query,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      },
      speech: `Searching Google for ${query}.`,
    };
  }

  // 4. Time Intent
  if (/what (?:time is it|is the time|time is it now)/i.test(lower)) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      type: 'time',
      payload: { time: timeStr },
      speech: `The current time is ${timeStr}.`,
    };
  }

  // 5. Date Intent
  if (/what (?:date is it|is today's date|day is it|is the date)/i.test(lower)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      type: 'date',
      payload: { date: dateStr },
      speech: `Today is ${dateStr}.`,
    };
  }

  // 6. Math / Calculator Intent
  const mathMatch = lower.match(/(?:calculate|what is|how much is)\s+([0-9\s\+\-\*\/\^\(\)\.\%]+)$/i);
  if (mathMatch && mathMatch[1]) {
    try {
      const sanitized = mathMatch[1].replace(/[^0-9\+\-\*\/\(\)\.\%]/g, '');
      if (sanitized.length > 0) {
        // Safe evaluation of simple math
        const result = Function(`'use strict'; return (${sanitized})`)();
        if (typeof result === 'number' && !isNaN(result)) {
          return {
            type: 'calculate',
            payload: { equation: sanitized, result },
            speech: `The answer to ${sanitized} is ${result}.`,
          };
        }
      }
    } catch (e) {
      // Fallback to Gemini
    }
  }

  // 7. Clear history intent
  if (/(?:clear|delete|wipe) (?:chat|conversation|history|memory)/i.test(lower)) {
    return {
      type: 'clear',
      payload: {},
      speech: `Understood. Conversation history has been wiped.`,
    };
  }

  return null;
};
