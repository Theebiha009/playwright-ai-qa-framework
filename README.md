# 🚀 Playwright AI QA Framework

An enterprise-style Playwright automation framework built with JavaScript, Page Object Model (POM), AI-assisted test generation, self-healing locators, intelligent caching, AI reporting, and CI/CD integration.

---

## 📌 Overview

This project demonstrates how modern QA automation can evolve using AI — not to replace engineers, but to **accelerate test creation, improve resilience, and reduce maintenance effort**.

The framework combines:

- Playwright (JavaScript)
- Page Object Model (POM)
- AI-assisted test generation
- AI-powered locator healing
- Locator caching
- AI execution reporting
- GitHub Actions CI/CD pipeline

Application under test:
👉 https://www.saucedemo.com

---

## 🧠 Key Features

### ✅ 1. Page Object Model (POM)
Clean separation of UI logic into reusable page classes:
- LoginPage
- InventoryPage
- CartPage
- CheckoutPage

---

### 🤖 2. AI-Assisted Test Generation

Converts natural-language requirements into **Playwright test scripts**.

Example:

**Input:**
```
User should login and complete checkout
```

**Output:**
- Playwright `.spec.js` test file
- Reuses existing page objects
- Includes assertions

⚠️ **Important (Real-World Behavior):**
- AI generates a **draft test**
- Human review is required for:
  - locator accuracy
  - framework conventions
  - edge cases

👉 This reflects real enterprise usage where AI acts as a **test accelerator, not a replacement**

---

### 🔁 3. AI Self-Healing Locators

When a locator fails:

1. Try original locator  
2. Try cached locator  
3. Try AI-generated locator  
4. Use fallback strategy  

This reduces flaky test failures and maintenance effort.

---

### ⚡ 4. Locator Cache

- Stores successful healed locators in `locator-cache.json`
- Avoids repeated AI calls
- Improves performance

---

### 🛡️ 5. Fallback Strategy

If all else fails, framework uses:
- generic Playwright locators
- role-based fallback
- input-based fallback

Ensures test resilience.

---

### 📊 6. AI Reporting

After execution, framework generates:

👉 `ai-report.json`

Includes:
- total healing events
- successful AI heals
- cache usage
- fallback usage
- detailed per-test logs
- recommendations

---

### ⚙️ 7. CI/CD Integration (GitHub Actions)

Pipeline automatically:

- installs dependencies
- installs Playwright browsers
- clears healing logs
- runs tests
- generates AI report
- uploads artifacts

Artifacts include:
- Playwright HTML report
- test results
- healing logs
- AI report
- locator cache

---

## 🔄 Framework Execution Flow

```text
Test starts
   ↓
Page Object method called
   ↓
BasePage executes action
   ↓
If locator fails:
   → check cache
   → AI healing
   → fallback strategy
   ↓
Event logged
   ↓
Locator cached
   ↓
AI report generated
```

---

## 📁 Project Structure

```text
playwright-ai-ui-framework/
├─ .github/workflows/playwright-ai.yml
├─ pages/
│  ├─ basePage.js
│  ├─ loginPage.js
│  ├─ inventoryPage.js
│  ├─ cartPage.js
│  └─ checkoutPage.js
├─ tests/
│  ├─ login.spec.js
│  ├─ inventory.spec.js
│  ├─ cart.spec.js
│  ├─ checkout.spec.js
│  └─ generated/
├─ utils/
│  ├─ aiLocatorService.js
│  ├─ aiReportService.js
│  ├─ aiTestGeneratorService.js
│  ├─ generateTestFromRequirement.js
│  ├─ locatorUtils.js
│  ├─ locatorCache.js
│  ├─ healingLogger.js
│  └─ generateAiReport.js
├─ prompts/
│  └─ testGeneratorPrompt.js
├─ locator-cache.json
├─ healing-events.json
├─ ai-report.json
├─ .env.example
├─ playwright.config.js
├─ package.json
└─ README.md
```

---

## 🧪 Running the Framework

### Install dependencies

```bash
npm install
npx playwright install
```

---

### Run all tests

```bash
npx playwright test
```

---

### Run specific tests

```bash
npx playwright test tests/login.spec.js
```

---

### Run generated tests

```bash
npx playwright test tests/generated
```

---

### Generate AI test

```bash
npm run generate:test -- "User should login with valid credentials"
```

---

### Generate AI report

```bash
npm run report:ai
```

---

### Clear logs

```bash
npm run clear:healing
```

---

## 🔐 Environment Setup

Create `.env` locally:

```text
OPENAI_API_KEY=your_openai_api_key_here
```

Do NOT commit `.env`

Use `.env.example` as reference.

---

## 🧠 How AI is Used (Realistic View)

This framework demonstrates **practical AI usage in QA**, not unrealistic automation.

### AI is used for:
- generating test drafts
- suggesting locators
- healing failures
- reporting insights

### Human involvement is still required for:
- reviewing generated tests
- validating locators
- maintaining framework structure

👉 This matches real-world enterprise QA practices.

---

## 💼 Why This Project Matters

Traditional automation:
- brittle locators
- high maintenance
- slow test creation

This framework improves by:
- reducing locator failures
- accelerating test creation
- providing intelligent insights
- integrating AI into QA workflows

---

## 🚀 Future Enhancements

- AI multi-scenario test generation
- RAG-based failure analysis
- AI chatbot for test reports
- database-backed locator cache
- CI/CD insights dashboard
- Slack/Teams notifications

---

## 👨‍💻 Author
Theebiha Jeyashankar
Built as part of an AI QA / AI SDET portfolio project to demonstrate:

- Playwright automation
- AI integration in testing
- scalable framework design
- CI/CD automation
- real-world QA engineering practices