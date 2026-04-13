import fs from 'fs';
import PATHS from '../config/paths.js';

function ensureHealingLogFile() {
  if (!fs.existsSync(PATHS.reports.healingEvents)) {
    fs.writeFileSync(PATHS.reports.healingEvents, JSON.stringify([], null, 2));
  }
}

function loadHealingLogs() {
  ensureHealingLogFile();
  return JSON.parse(fs.readFileSync(PATHS.reports.healingEvents, 'utf-8'));
}

function saveHealingLogs(logs) {
  fs.writeFileSync(PATHS.reports.healingEvents, JSON.stringify(logs, null, 2));
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