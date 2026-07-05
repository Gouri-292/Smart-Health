require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: "Say hello",
    });
    console.log("Response text type:", typeof response.text);
    console.log("Response text value:", response.text);
  } catch (e) {
    console.error("Error:", e.message);
    if (e.status) console.error("Status:", e.status);
    if (e.response) console.error("API Response:", await e.response.text().catch(()=>''));
  }
}
test();
