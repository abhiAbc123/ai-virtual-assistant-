import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

try {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const contentModels = (data.models || []).filter(m => m.supportedGenerationMethods?.includes('generateContent'));
  console.log('Supported generateContent models:');
  contentModels.forEach(m => console.log('-', m.name));
} catch (e) {
  console.error('Fetch error:', e);
}
