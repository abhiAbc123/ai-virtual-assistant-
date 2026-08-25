import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing key:', apiKey);

try {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  console.log('Models response:', JSON.stringify(data, null, 2));
} catch (e) {
  console.error('Fetch error:', e);
}
