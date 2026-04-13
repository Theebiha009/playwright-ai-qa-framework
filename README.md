# 🚀 Playwright AI QA Framework

### Self-Healing | RAG Memory | AI Automation | Test Prioritization

---

# 📌 Overview

This project is an **AI-powered Playwright automation framework** designed to:

* Reduce test flakiness
* Automatically heal broken locators
* Learn from past failures using **RAG (Retrieval-Augmented Generation)**
* Optimize CI execution using **test prioritization**

---

# 🧠 Core Features

## 🔁 1. Self-Healing Locator Engine

When a locator fails, the framework recovers using a layered approach:

```
Original Locator
   ↓
Cache (fast reuse)
   ↓
RAG Memory (similar past fixes)
   ↓
AI Healing (LLM-based)
   ↓
Strategy Fallback (config-driven)
   ↓
Generic Fallback
```

---

## 🧠 2. RAG-Based Memory System

* Stores successful locator fixes with embeddings
* Retrieves similar past fixes
* Reduces repeated AI calls
* Improves performance over time

---

## ⚡ 3. Locator Cache

* Stores exact working locators
* Enables instant reuse
* Reduces dependency on AI

---

## 🧩 4. Metadata-Driven Generic Design

Framework is **fully generic** — no hardcoded login/password logic.

Each action passes structured metadata:

```js
await this.safeClick(
  this.loginBtn,
  { name: 'loginButton', semantic: 'button' },
  testName
);
```

---

## 🧠 5. Strategy-Based Fallback (Config Driven)

App-specific logic is externalized in:

`utils/elementStrategies.js`

```js
loginButton: {
  fallback: [
    { locatorType: 'role', role: 'button', name: 'Login' }
  ]
}
```

---

## 📊 6. AI Reporting

Framework logs:

* Failed locators
* Healing strategy used (cache / RAG / AI / fallback)
* Success / failure status
* Recommendations

---

## ⚡ 7. Test Prioritization (CI Optimization)

Tests are ranked using:

* Failure history
* Recency
* Criticality

👉 High-risk tests run first in CI pipelines

---

# 🏗️ Project Structure

```
tests/
pages/
  ├── basePage.js
  ├── loginPage.js
  ├── inventoryPage.js
  ├── cartPage.js
  ├── checkoutPage.js

utils/
  ├── aiLocatorService.js
  ├── locatorUtils.js
  ├── locatorCache.js
  ├── elementStrategies.js
  ├── healingLogger.js

rag/
  ├── ragStore.js
  ├── ragSearch.js
  ├── embeddingService.js

reports/
locator-cache.json
rag-memory.json
```

---

# 🔄 Execution Flow

```
Test → Page Object → BasePage

BasePage handles:
  1. Original locator
  2. Cache lookup
  3. RAG similarity search
  4. AI healing
  5. Strategy fallback
  6. Generic fallback
```

---

# 🧪 Example Test Flow

```
Login → Inventory → Cart → Checkout
```

Each step uses:

* safeClick()
* safeFill()

with metadata-driven healing.

---

# ▶️ How to Run

## 1. Install dependencies

```bash
npm install
npx playwright install
```

---

## 2. Reset learned memory (IMPORTANT)

```bash
echo {} > locator-cache.json
echo [] > rag-memory.json
```

---

## 3. Run tests

```bash
npx playwright test
```

---

## 4. Debug mode

```bash
npx playwright test --headed
```

---

# ⚠️ Important Notes

* Framework heals **actions only** (click, fill, select)
* Assertions (`expect`) are NOT auto-healed
* AI outputs are validated before use
* Weak/generic locators are NOT stored in RAG

---

# 💡 Design Decisions

### Why not rely only on AI?

AI is non-deterministic → used as last resort

### Why cache before AI?

Fast + reliable reuse

### Why RAG?

Handles similar failures, not just exact matches

### How bad locators are prevented?

Only successful locators are stored

---

# 🚧 Known Limitations

* Cannot heal assertions
* AI may generate incorrect locators
* Generic fallback may click wrong element in complex UI

---

# 🔮 Future Improvements

* AI explanation layer for prioritization
* Change-impact based test selection
* Context-aware fallback strategies

---

# 🎯 Goal

To build a **self-learning automation framework** that becomes more stable and efficient over time.

---

Author:
Theebiha Jeyashankar

