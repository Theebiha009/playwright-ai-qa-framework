import fs from 'fs';
import { getHealingLogs } from './healingLogger.js';
import { generateAiSummary } from './aiReportService.js';
import PATHS from '../config/paths.js';
async function run() {
  const healingLogs = getHealingLogs();

  if (!healingLogs.length) {
    console.log('⚠️ No healing events found. Run tests first.');
    return;
  }

  const totalEvents = healingLogs.length;
  const successfulHeals = healingLogs.filter(
    log => log.strategy === 'ai' && log.status === 'success'
  ).length;

  const failedHeals = healingLogs.filter(
    log => log.strategy === 'ai' && log.status === 'failed'
  ).length;

  const cacheHits = healingLogs.filter(
    log => log.strategy === 'cache' && log.status === 'success'
  ).length;

  const fallbackUsed = healingLogs.filter(
    log => log.strategy === 'fallback' && log.status === 'success'
  ).length;

  const detailedTests = healingLogs.map(log => ({
    testName: log.testName,
    page: log.page,
    element: log.element,
    action: log.action,
    originalLocator: log.originalLocator,
    recoveryStrategy: log.strategy,
    status: log.status,
    details: log.details,
    healedLocator: log.healedLocator || null,
    timestamp: log.timestamp
  }));

  let report = {
    summary: 'Local summary only',
    totalEvents,
    successfulHeals,
    failedHeals,
    cacheHits,
    fallbackUsed,
    tests: detailedTests,
    recommendations: []
  };

  const aiSummary = await generateAiSummary(healingLogs);

  if (aiSummary) {
    report = {
      ...report,
      summary: aiSummary.summary || report.summary,
      recommendations: aiSummary.recommendations || []
    };
    if (typeof aiSummary.totalEvents === 'number') report.totalEvents = aiSummary.totalEvents;
    if (typeof aiSummary.successfulHeals === 'number') report.successfulHeals = aiSummary.successfulHeals;
    if (typeof aiSummary.failedHeals === 'number') report.failedHeals = aiSummary.failedHeals;
    if (typeof aiSummary.cacheHits === 'number') report.cacheHits = aiSummary.cacheHits;
    if (typeof aiSummary.fallbackUsed === 'number') report.fallbackUsed = aiSummary.fallbackUsed;
  } else {
    report.recommendations = [
      'Review recurring locator failures.',
      'Update page objects with stable Playwright-native locators.',
      'Keep cache enabled to reduce repeated healing calls.'
    ];
  }

  fs.writeFileSync(PATHS.reports.aiReport, JSON.stringify(report, null, 2));

  console.log('✅ AI report generated: PATHS.reports.aiReport');
  console.log(JSON.stringify(report, null, 2));
}

run();