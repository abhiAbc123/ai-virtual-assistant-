import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('Testing Gemini API key...');
const apiKey = process.env.GEMINI_API_KEY;
console.log('Key exists:', !!apiKey, 'length:', apiKey ? apiKey.length : 0);

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent('Say hello in 5 words');
  console.log('Response:', result.response.text());
} catch (e) {
  console.error('Gemini test error:', e.message);
}
