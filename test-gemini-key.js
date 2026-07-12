// Standalone Gemini API key test — run with: node test-gemini-key.js
// This isolates the API key/network from the rest of the app so we can
// tell whether the problem is the key itself or something else.

require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
console.log('Key loaded:', key ? `YES (starts with ${key.substring(0, 6)}..., length ${key.length})` : 'NO KEY FOUND');

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });

console.log('Sending test request to Gemini...');
const started = Date.now();

ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Say hi in one word.' })
  .then(r => {
    console.log(`SUCCESS in ${Date.now() - started}ms:`, r.text);
  })
  .catch(e => {
    console.error(`FAILED after ${Date.now() - started}ms`);
    console.error('Error name:', e.name);
    console.error('Error message:', e.message);
    if (e.cause) {
      console.error('Cause:', e.cause.message || e.cause);
      console.error('Cause code:', e.cause.code);
    }
  });
