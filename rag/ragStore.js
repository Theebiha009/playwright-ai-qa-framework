import fs from 'fs';

const RAG_STORE_FILE = './rag-memory.json';

function ensureRagStoreFile() {
  if (!fs.existsSync(RAG_STORE_FILE)) {
    fs.writeFileSync(RAG_STORE_FILE, JSON.stringify([], null, 2));
  }
}

export function loadRagMemory() {
  ensureRagStoreFile();
  return JSON.parse(fs.readFileSync(RAG_STORE_FILE, 'utf-8'));
}

export function saveRagMemory(memory) {
  fs.writeFileSync(RAG_STORE_FILE, JSON.stringify(memory, null, 2));
}

export function addRagEntry(entry) {
  const memory = loadRagMemory();
  memory.push(entry);
  saveRagMemory(memory);
}