import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAiSummary(healingLogs) {
  try {
    const prompt = `
You are an AI QA reporting assistant.

Analyze the following automation healing events and generate a concise report.

Healing events:
${JSON.stringify(healingLogs, null, 2)}

Return ONLY valid JSON in this format:
{
  "summary": "...",
  "totalEvents": 0,
  "successfulHeals": 0,
  "failedHeals": 0,
  "cacheHits": 0,
  "fallbackUsed": 0,
  "recommendations": ["...", "..."]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    });

    const raw = response.choices[0].message.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.log('❌ AI report generation failed:', error.message);
    return null;
  }
}