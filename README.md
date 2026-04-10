# 🚀 Playwright AI QA Automation Framework

An advanced **AI-powered test automation framework** built using **Playwright (JavaScript)**, designed to simulate real-world QA challenges and solutions.

This framework goes beyond traditional automation by introducing:

* 🤖 AI-based locator healing
* 🧠 RAG (Retrieval-Augmented Generation) memory
* ⚡ Smart locator caching
* 📊 AI-assisted reporting
* 🧪 AI test generation (with human validation)
* 🎯 AI-driven test prioritization (execution intelligence)

---

# 📌 Key Features

## 1. 🤖 AI Locator Healing

Automatically fixes broken locators using AI when tests fail.

**Flow:**

```
Original locator → Cache → RAG → AI → Fallback
```

Prevents test failures due to UI changes.

---

## 2. ⚡ Locator Cache

Stores previously healed locators for faster reuse.

* Reduces repeated AI calls
* Improves execution speed

---

## 3. 🧠 RAG Memory System

Stores past healing decisions with embeddings.

* Finds similar failures
* Reuses correct locators intelligently
* Avoids repeated AI mistakes

---

## 4. 🧪 AI Test Generator

Generates Playwright test scripts from requirements.

⚠️ Designed for:

* accelerating test creation
* not replacing human review

---

## 5. 📊 AI Healing Reports

Logs all healing activity:

* which locators failed
* how they were healed
* which strategy worked (cache / RAG / AI / fallback)

---

## 6. 🎯 AI Test Prioritization (NEW 🔥)

Optimizes test execution order based on:

* failure history
* recency of failures
* success trends
* business/module criticality

### 💡 Why this matters

Instead of running all tests blindly:

> Run the most risky tests first → faster feedback → better CI efficiency

---

# 🧠 Test Prioritization Logic

Each test gets a **priority score** based on:

| Factor             | Impact              |
| ------------------ | ------------------- |
| Failure count      | High                |
| Recent failures    | Very High           |
| Success count      | Slight reduction    |
| Module criticality | Business importance |

---

## 🏷️ Module Criticality

```js
login: 25
checkout: 30
cart: 15
inventory: 10
generated: 5
```

---

## 📊 Example Priority Output

```json
[
  {
    "testFile": "tests/checkout.spec.js",
    "module": "checkout",
    "priorityScore": 59
  },
  {
    "testFile": "tests/login.spec.js",
    "module": "login",
    "priorityScore": 53
  }
]
```

---

# 📁 Project Structure

```
playwright-ai-qa-framework/
│
├── pages/                  # Page Object Models
├── tests/                  # Test specs
├── utils/                  # AI, logging, caching utilities
├── rag/                    # RAG memory system
├── prioritization/         # Test prioritization engine
│   ├── testHistoryStore.js
│   ├── testPrioritizer.js
│   └── runPrioritizedTests.js
│
├── test-history.json       # Stores execution history
├── test-priority-report.json
├── locator-cache.json
├── rag-memory.json
│
├── playwright.config.js
├── package.json
└── README.md
```

---

# ⚙️ Setup

## 1. Install dependencies

```bash
npm install
```

---

## 2. Add OpenAI API Key

Create `.env`:

```
OPENAI_API_KEY=your_api_key_here
```

---

## 3. Run tests

```bash
npx playwright test
```

---

# 🎯 Run AI Prioritized Tests

```bash
npm run prioritize:tests
```

---

# 📊 View Priority Report

```bash
npm run report:priority
```

---

# 🔄 How It Works (Execution Intelligence)

```
Run tests
   ↓
Store results (test-history.json)
   ↓
Score tests based on:
   - failures
   - recency
   - criticality
   ↓
Sort tests by risk
   ↓
Run highest priority tests first
```

---

# 🧠 AI Architecture

## Runtime Intelligence

* Locator healing (AI + RAG + cache)

## Memory Intelligence

* RAG system storing past healing decisions

## Execution Intelligence

* Test prioritization based on history

---

# 🧪 Example Use Case

If:

* Checkout tests fail recently
* Login fails occasionally
* Inventory always passes

Then execution becomes:

```
1. checkout.spec.js
2. login.spec.js
3. cart.spec.js
4. inventory.spec.js
```

---

# ⚠️ Important Design Principles

* AI suggestions are **validated before use**
* Cache and RAG store only **useful locators**
* Framework avoids **over-reliance on AI**
* Designed for **real-world maintainability**

---

# 🧠 What This Demonstrates

This framework shows:

* Practical use of AI in QA automation
* Intelligent failure recovery
* Test execution optimization
* Real-world automation architecture

---

# 📌 Future Enhancements

* AI explanation for prioritization decisions
* Change-impact based prioritization (Git diff)
* Flaky test detection
* TypeScript migration
* API + UI integrated testing


---

# 👩‍💻 Author
Theebiha Jeyashankar
Built as part of an **AI SDET upskilling journey** focused on real-world automation challenges.

---

# ⭐ Final Note

This is not a “demo AI project”.

It is a **practical framework** that reflects how AI can be applied meaningfully in QA:

* reduce maintenance
* improve reliability
* optimize execution

---
