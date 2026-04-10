import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ Failed to generate embedding:', error.message);
    return null;
  }
}