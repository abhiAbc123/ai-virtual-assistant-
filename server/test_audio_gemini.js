import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing Gemini API key audio support...');

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  console.log('Model instance created successfully:', !!model);
} catch (e) {
  console.error('Error:', e.message);
}
