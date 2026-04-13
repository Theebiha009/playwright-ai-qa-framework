import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of project (better than process.cwd in some cases)
const ROOT = process.cwd();

const PATHS = {
  reports: {
    ai: path.join(ROOT, "reports", "ai"),
    history: path.join(ROOT, "reports", "history"),
    playwright: path.join(ROOT, "reports", "playwright"),
    aiReport: path.join(ROOT, "reports", "ai", "ai-report.json"),
    aiSteps: path.join(ROOT, "reports", "ai", "ai_steps.json"),
    healingEvents: path.join(ROOT, "reports", "ai", "healing-events.json"),
    testHistory: path.join(ROOT, "reports", "history", "test-history.json"),
    testPriorityReport: path.join(ROOT, "reports", "history", "test-priority-report.json"),
  },
  storage: {
    locatorCache: path.join(ROOT, "storage", "cache", "locator-cache.json"),
    ragMemory: path.join(ROOT, "storage", "memory", "rag-memory.json"),
  },
};

export default PATHS;