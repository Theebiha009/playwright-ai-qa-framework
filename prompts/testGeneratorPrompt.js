export function buildTestGeneratorPrompt(requirementText) {
  return `
You are an expert Playwright JavaScript test generator.

Your task is to generate a complete Playwright test file in JavaScript using ES Modules.

Application under test:
- SauceDemo
- Base URL: https://www.saucedemo.com

Important:
The generated file will be saved inside:
tests/generated/

So all page object imports MUST use this path format:
- ../../pages/loginPage.js
- ../../pages/inventoryPage.js
- ../../pages/cartPage.js
- ../../pages/checkoutPage.js

Existing framework structure:
- tests/generated/
- pages/loginPage.js
- pages/inventoryPage.js
- pages/cartPage.js
- pages/checkoutPage.js

Rules:
- Use Page Object Model imports from existing framework
- Use Playwright test syntax
- Use ES module imports
- Reuse existing page methods where possible
- Generate clean, readable code
- Add only the test code, no explanation
- Output ONLY valid JavaScript code
- Include assertions where appropriate
- Use a testName variable and pass it into page methods
- Do NOT use ../pages/...
- Always use ../../pages/... for page object imports
- NEVER instantiate page objects outside the test block
- ALWAYS create page objects INSIDE:
  test('...', async ({ page }) => { ... })
- ALWAYS pass page when creating page objects:
  const loginPage = new LoginPage(page)
  const inventoryPage = new InventoryPage(page)
  const cartPage = new CartPage(page)
  const checkoutPage = new CheckoutPage(page)

Available page object methods:

LoginPage:
- login(username, password, testName)

InventoryPage:
- verifyInventoryVisible()
- addFirstItemToCart(testName)
- goToCart(testName)
- logout(testName)

CartPage:
- verifyCartItemVisible()
- proceedToCheckout(testName)
- continueShopping(testName)
- removeFirstItem(testName)

CheckoutPage:
- enterCheckoutInformation(firstName, lastName, postalCode, testName)
- continueCheckout(testName)
- finishCheckout(testName)
- cancelCheckout(testName)
- completeCheckout(firstName, lastName, postalCode, testName)
- verifyOrderComplete()

Requirement:
${requirementText}

Generate one complete Playwright test file now.
`;
}