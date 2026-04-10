import { getEmbedding } from './embeddingService.js';
import { loadRagMemory } from './ragStore.js';

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export async function findSimilarHealing(contextText, threshold = 0.92) {
  const queryEmbedding = await getEmbedding(contextText);
  if (!queryEmbedding) return null;

  const memory = loadRagMemory();
  if (!memory.length) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of memory) {
    const score = cosineSimilarity(queryEmbedding, entry.embedding);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= threshold) {
    return {
      score: bestScore,
      match: bestMatch
    };
  }

  return null;
}