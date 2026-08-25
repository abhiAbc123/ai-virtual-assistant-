import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing with gemini-3.6-flash...');

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent('Explain what a software engineer does in 2 sentences.');
  console.log('\n--- SUCCESS! Response from Gemini 3.6 Flash ---');
  console.log(result.response.text());
} catch (e) {
  console.error('Test error:', e.message);
}
