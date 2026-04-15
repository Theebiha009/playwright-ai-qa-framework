import fs from 'fs';
import PATHS from '../config/paths.js';

function ensureRagStoreFile() {
  if (!fs.existsSync(PATHS.storage.ragMemory)) {
    fs.writeFileSync(PATHS.storage.ragMemory, JSON.stringify([], null, 2));
  }
}

export function loadRagMemory() {
  ensureRagStoreFile();
  return JSON.parse(fs.readFileSync(PATHS.storage.ragMemory, 'utf-8'));
}

export function saveRagMemory(memory) {
  fs.writeFileSync(PATHS.storage.ragMemory, JSON.stringify(memory, null, 2));
}

export function addRagEntry(entry) {
  const memory = loadRagMemory();
  memory.push(entry);
  saveRagMemory(memory);
}