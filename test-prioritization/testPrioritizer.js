import fs from 'fs';
import { loadTestHistory } from './testHistoryStore.js';
import PATHS from '../config/paths.js';

const MODULE_CRITICALITY = {
  login: 25,
  checkout: 30,
  cart: 15,
  inventory: 10,
  generated: 5,
  default: 0
};

function getDaysSince(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  return diffMs / (1000 * 60 * 60 * 24);
}

function getCriticalityScore(moduleName) {
  return MODULE_CRITICALITY[moduleName] ?? MODULE_CRITICALITY.default;
}

function calculatePriorityScore(record) {
  let score = 0;

  // Business criticality
  score += getCriticalityScore(record.module);

  // More failures = higher priority
  score += (record.failureCount || 0) * 10;

  // Recent failures matter more
  if (record.lastStatus === 'failed' && record.lastRun) {
    const daysSince = getDaysSince(record.lastRun);

    if (daysSince <= 1) score += 20;
    else if (daysSince <= 3) score += 10;
    else if (daysSince <= 7) score += 5;
  }

  // Repeated passes reduce urgency a bit
  score -= Math.min(record.successCount || 0, 5);

  return score;
}

export function getPrioritizedTests() {
  const history = loadTestHistory();

  const prioritized = history
    .map(record => ({
      ...record,
      criticalityScore: getCriticalityScore(record.module),
      priorityScore: calculatePriorityScore(record)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  fs.writeFileSync(PATHS.reports.testPriorityReport, JSON.stringify(prioritized, null, 2));

  return prioritized;
}

export function getPrioritizedTestFiles() {
  return getPrioritizedTests().map(item => item.testFile);
}