# Playwright AI QA Framework

An enterprise-style Playwright automation framework built with JavaScript, Page Object Model (POM), AI-powered self-healing locators, locator caching, AI reporting, and GitHub Actions CI/CD integration.

## Overview

This framework was designed to demonstrate how modern QA automation can evolve beyond traditional locator-based scripts into a more resilient, intelligent, and maintainable testing solution.

The project uses:

- Playwright with JavaScript
- Page Object Model (POM)
- AI-powered locator healing using OpenAI
- Locator caching for performance optimization
- Healing event logging
- AI-generated execution reports
- GitHub Actions pipeline for CI execution and artifact publishing

The framework is implemented using the SauceDemo application as the UI under test.

---

## Key Features

### 1. Page Object Model (POM)
All pages are separated into reusable page classes for maintainability and scalability.

### 2. AI Self-Healing Locators
If a locator fails, the framework tries to recover using AI by analyzing page metadata and suggesting a better Playwright locator.

### 3. Locator Cache
Once a locator is healed successfully, it is stored in a local cache file so the framework can reuse it in future executions without repeated AI calls.

### 4. Fallback Strategy
If original locator, cache, and AI healing all fail, the framework attempts a generic fallback strategy to keep test execution resilient.

### 5. AI Reporting
Healing events are captured and summarized into an AI-powered report showing:
- test name
- page
- element
- action
- strategy used
- whether AI healing, cache, or fallback was used
- recommendations

### 6. CI/CD Integration
The framework runs through GitHub Actions and uploads:
- Playwright HTML report
- test results
- healing logs
- AI report
- locator cache

---

## Framework Flow

```text
Test starts
   ↓
Page Object method is called
   ↓
BasePage tries original locator
   ↓
If original locator fails:
   → check cache
   → if not found, try AI healing
   → if AI fails, use generic fallback
   ↓
Healing event is logged
   ↓
Healed locator is cached
   ↓
AI report is generated after execution
```

---

## Project Structure

```text
playwright-ai-ui-framework/
├─ .github/
│  └─ workflows/
│     └─ playwright-ai.yml
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
│  └─ checkout.spec.js
├─ utils/
│  ├─ aiLocatorService.js
│  ├─ aiReportService.js
│  ├─ locatorUtils.js
│  ├─ locatorCache.js
│  ├─ healingLogger.js
│  ├─ clearHealingLogs.js
│  └─ generateAiReport.js
├─ locator-cache.json
├─ healing-events.json
├─ ai-report.json
├─ playwright.config.js
├─ package.json
├─ .env.example
└─ README.md
```

---

## Technologies Used

- JavaScript
- Playwright
- Node.js
- OpenAI API
- GitHub Actions
- JSON-based caching and reporting

---

## How AI Healing Works

The framework follows a multi-layer recovery strategy:

1. Try original locator
2. Try cached healed locator
3. Try AI-generated locator
4. Try fallback strategy

This makes the framework more resilient to UI changes and reduces maintenance effort.

---

## Example Healing Scenario

Suppose the login button locator is intentionally incorrect:

```js
this.loginBtn = page.getByRole('button', { name: 'Login123' });
```

When the test runs:

- original locator fails
- framework checks cache
- if cache not available, AI analyzes page metadata
- AI suggests a new locator like:

```json
{
  "locatorType": "role",
  "role": "button",
  "name": "Login"
}
```

- healed locator is used
- healed locator is saved to cache
- next run uses cache directly

---

## AI Reporting

After test execution, healing events are stored in `healing-events.json`.

Then the framework generates `ai-report.json` containing:
- execution summary
- successful AI heals
- failed AI heals
- cache hits
- fallback usage
- detailed test-level healing events
- recommendations

---

## Running the Framework Locally

### Install dependencies

```bash
npm install
npx playwright install
```

### Run tests

```bash
npx playwright test
```

### Run a single test file

```bash
npx playwright test tests/login.spec.js
```

### Clear healing logs

```bash
npm run clear:healing
```

### Generate AI report

```bash
npm run report:ai
```

---

## Environment Variables

Create a local `.env` file:

```text
OPENAI_API_KEY=your_openai_api_key_here
```

Do not commit `.env`.

Use `.env.example` as the sample template.

---

## GitHub Actions Pipeline

The framework includes a GitHub Actions workflow that:

- installs dependencies
- installs Playwright browsers
- clears healing logs
- executes Playwright tests
- generates AI report
- uploads artifacts

Artifacts include:
- `playwright-report`
- `test-results`
- `healing-events.json`
- `ai-report.json`
- `locator-cache.json`

---

## Why This Project Matters

Traditional UI automation frameworks often fail when locators change, causing frequent maintenance.

This framework demonstrates a more modern AI-assisted testing approach by combining:

- resilient automation design
- locator healing
- self-learning cache
- detailed execution visibility
- CI/CD integration

This project is intended to represent an AI SDET / AI QA Engineer style framework rather than a basic UI automation project.

---

## Interview Talking Points

This project can be explained using the following themes:

- enterprise Playwright framework design
- Page Object Model architecture
- AI-assisted locator healing
- cache-based optimization
- fallback strategies for resiliency
- AI-powered reporting
- CI/CD execution and artifact publishing

---

## Possible Future Enhancements

- AI-generated test case creation from user stories
- RAG-based failure knowledge retrieval
- AI chatbot for execution reports
- dynamic locator confidence scoring
- database-backed locator cache
- Slack or Teams notification integration

---

## Author
Theebiha Jeyashankar

Built as part of an AI QA / AI SDET portfolio project to demonstrate practical use of Playwright, AI integration, resilient test design, and CI/CD automation.