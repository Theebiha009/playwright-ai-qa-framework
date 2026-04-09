import fs from 'fs';

const HEALING_LOG_FILE = './healing-events.json';

function ensureHealingLogFile() {
  if (!fs.existsSync(HEALING_LOG_FILE)) {
    fs.writeFileSync(HEALING_LOG_FILE, JSON.stringify([], null, 2));
  }
}

function loadHealingLogs() {
  ensureHealingLogFile();
  return JSON.parse(fs.readFileSync(HEALING_LOG_FILE, 'utf-8'));
}

function saveHealingLogs(logs) {
  fs.writeFileSync(HEALING_LOG_FILE, JSON.stringify(logs, null, 2));
}

export function clearHealingLogs() {
  saveHealingLogs([]);
}

export function logHealingEvent(event) {
  const logs = loadHealingLogs();
  logs.push({
    timestamp: new Date().toISOString(),
    ...event
  });
  saveHealingLogs(logs);
}

export function getHealingLogs() {
  return loadHealingLogs();
}