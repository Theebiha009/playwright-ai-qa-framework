import OpenAI from 'openai';
import dotenv from 'dotenv';
import { buildTestGeneratorPrompt } from '../prompts/testGeneratorPrompt.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generatePlaywrightTest(requirementText) {
  try {
    const prompt = buildTestGeneratorPrompt(requirementText);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const rawOutput = response.choices[0]?.message?.content || '';

    let cleanedOutput = rawOutput
      .replace(/^```javascript\s*/i, '')
      .replace(/^```js\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // Fix common wrong relative imports
    cleanedOutput = cleanedOutput
      .replaceAll("../pages/loginPage.js", "../../pages/loginPage.js")
      .replaceAll("../pages/inventoryPage.js", "../../pages/inventoryPage.js")
      .replaceAll("../pages/cartPage.js", "../../pages/cartPage.js")
      .replaceAll("../pages/checkoutPage.js", "../../pages/checkoutPage.js");

    // Fix missing page injection
    cleanedOutput = cleanedOutput
      .replaceAll("new LoginPage()", "new LoginPage(page)")
      .replaceAll("new InventoryPage()", "new InventoryPage(page)")
      .replaceAll("new CartPage()", "new CartPage(page)")
      .replaceAll("new CheckoutPage()", "new CheckoutPage(page)");

    // Fix top-level page object declarations by removing them
    cleanedOutput = cleanedOutput
      .replace(/^\s*const\s+loginPage\s*=\s*new\s+LoginPage\(page\);\s*$/gm, '')
      .replace(/^\s*const\s+inventoryPage\s*=\s*new\s+InventoryPage\(page\);\s*$/gm, '')
      .replace(/^\s*const\s+cartPage\s*=\s*new\s+CartPage\(page\);\s*$/gm, '')
      .replace(/^\s*const\s+checkoutPage\s*=\s*new\s+CheckoutPage\(page\);\s*$/gm, '');

    return cleanedOutput;
  } catch (error) {
    console.error('❌ Failed to generate Playwright test:', error.message);
    throw error;
  }
}