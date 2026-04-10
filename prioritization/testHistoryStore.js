import fs from 'fs';

const HISTORY_FILE = './test-history.json';

function ensureHistoryFile() {
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
  }
}

export function loadTestHistory() {
  ensureHistoryFile();
  return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
}

export function saveTestHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export function upsertTestHistoryRecord(record) {
  const history = loadTestHistory();

  const index = history.findIndex(item => item.testFile === record.testFile);

  if (index >= 0) {
    history[index] = {
      ...history[index],
      ...record
    };
  } else {
    history.push(record);
  }

  saveTestHistory(history);
}