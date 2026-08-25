import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const isGeminiConfigured = () => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return !!(key && key !== 'your_gemini_api_key_here');
};

export const getGeminiModel = (modelName = 'gemini-3.6-flash') => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.error('Error creating Gemini GenerativeModel:', err);
    return null;
  }
};
