// Tests the SAME structured JSON schema as the real route, with a small
// prompt (like the successful quick test), standalone — no Express, no DB,
// no large context. Run with: node test-gemini-schema.js
// This isolates: is it the responseSchema/structured output itself that
// causes the hang, or something about Express / the DB context?

require('dotenv').config();
const { GoogleGenAI, Type } = require('@google/genai');

const key = process.env.GEMINI_API_KEY;
console.log('Key loaded:', key ? 'YES' : 'NO KEY FOUND');
const ai = new GoogleGenAI({ apiKey: key });

console.log('Sending SMALL prompt but with the FULL structured schema...');
const started = Date.now();

ai.models.generateContent({
  model: 'gemini-3.5-flash',
  contents: 'Generate 1 fake prediction and 2 fake prescriptive actions about a health clinic, for testing purposes.',
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        predictions: {
          type: Type.OBJECT,
          properties: {
            expected_patient_load: { type: Type.STRING },
            patient_load_trend: { type: Type.STRING },
            // patient_confidence: { type: Type.STRING },
            disease_outbreak_risk: { type: Type.STRING },
            disease_risk_trend: { type: Type.STRING },
            // disease_confidence: { type: Type.STRING },
            medicine_shortage_count: { type: Type.INTEGER },
            medicine_shortage_trend: { type: Type.STRING },
            // medicine_confidence: { type: Type.STRING }
          },
          required: ["expected_patient_load", "patient_load_trend", "disease_outbreak_risk", "disease_risk_trend", "medicine_shortage_count", "medicine_shortage_trend"]
        },
        prescriptive_actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["title", "description", "type"]
          }
        }
      },
      required: ["predictions", "prescriptive_actions"]
    }
  }
})
  .then(r => {
    console.log(`SUCCESS in ${Date.now() - started}ms`);
    console.log(r.text);
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
