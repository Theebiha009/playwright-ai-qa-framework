import { execSync } from 'child_process';
import fs from 'fs';
import { getPrioritizedTests } from './testPrioritizer.js';
import { upsertTestHistoryRecord, loadTestHistory } from './testHistoryStore.js';

function getDefaultTests() {
  const defaultTests = [
    { testFile: 'tests/login.spec.js', module: 'login' },
    { testFile: 'tests/inventory.spec.js', module: 'inventory' },
    { testFile: 'tests/cart.spec.js', module: 'cart' },
    { testFile: 'tests/checkout.spec.js', module: 'checkout' }
  ];

  return defaultTests.filter(item => fs.existsSync(item.testFile));
}

function detectModuleFromTestFile(testFile) {
  const normalized = testFile.toLowerCase();

  if (normalized.includes('login')) return 'login';
  if (normalized.includes('checkout')) return 'checkout';
  if (normalized.includes('cart')) return 'cart';
  if (normalized.includes('inventory')) return 'inventory';
  if (normalized.includes('generated')) return 'generated';

  return 'default';
}

function runSingleTest(testFile) {
  try {
    console.log(`\n🚀 Running: ${testFile}`);
    execSync(`npx playwright test ${testFile}`, { stdio: 'inherit' });
    return { testFile, status: 'passed' };
  } catch (error) {
    return { testFile, status: 'failed' };
  }
}

function mergeCounts(existingHistory, testFile, status) {
  const existing = existingHistory.find(item => item.testFile === testFile);

  const existingFailureCount = existing?.failureCount || 0;
  const existingSuccessCount = existing?.successCount || 0;

  if (status === 'passed') {
    return {
      failureCount: existingFailureCount,
      successCount: existingSuccessCount + 1
    };
  }

  return {
    failureCount: existingFailureCount + 1,
    successCount: existingSuccessCount
  };
}

async function run() {
  let prioritized = getPrioritizedTests();

  if (!prioritized.length) {
    console.log('⚠️ No history found. Running default test order.');
    prioritized = getDefaultTests().map(item => ({
      ...item,
      priorityScore: 0
    }));
  }

  const history = loadTestHistory();
  const results = [];

  for (const item of prioritized) {
    const testFile = item.testFile;
    const module = item.module || detectModuleFromTestFile(testFile);

    const result = runSingleTest(testFile);
    const merged = mergeCounts(history, testFile, result.status);

    upsertTestHistoryRecord({
      testFile,
      module,
      lastStatus: result.status,
      failureCount: merged.failureCount,
      successCount: merged.successCount,
      lastRun: new Date().toISOString()
    });

    results.push({
      testFile,
      module,
      status: result.status
    });
  }

  console.log('\n✅ Prioritized execution complete');
  console.log(JSON.stringify(results, null, 2));
}

run();