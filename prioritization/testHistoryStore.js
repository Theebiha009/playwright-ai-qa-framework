import fs from 'fs';
import PATHS from '../config/paths.js';

function ensureHistoryFile() {
  if (!fs.existsSync(PATHS.reports.testHistory)) {
    fs.writeFileSync(PATHS.reports.testHistory, JSON.stringify([], null, 2));
  }
}

export function loadTestHistory() {
  ensureHistoryFile();
  return JSON.parse(fs.readFileSync(PATHS.reports.testHistory, 'utf-8'));
}

export function saveTestHistory(history) {
  fs.writeFileSync(PATHS.reports.testHistory, JSON.stringify(history, null, 2));
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