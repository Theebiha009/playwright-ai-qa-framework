import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const aiLocatorService = {
  async healLocator(locator, page) {
    try {
      if (page.isClosed()) return null;

      const buttons = (
        await page.locator('button').evaluateAll(elements =>
          elements.map(el => ({
            text: (el.textContent || '').trim(),
            ariaLabel: el.getAttribute('aria-label') || '',
            id: el.getAttribute('id') || '',
            name: el.getAttribute('name') || ''
          }))
        )
      ).slice(0, 10);

      const inputs = (
        await page.locator('input').evaluateAll(elements =>
          elements.map(el => ({
            type: el.getAttribute('type') || '',
            placeholder: el.getAttribute('placeholder') || '',
            ariaLabel: el.getAttribute('aria-label') || '',
            name: el.getAttribute('name') || '',
            id: el.getAttribute('id') || '',
            dataTest: el.getAttribute('data-test') || ''
          }))
        )
      ).slice(0, 10);

      const links = (
        await page.locator('a').evaluateAll(elements =>
          elements.map(el => ({
            text: (el.textContent || '').trim(),
            ariaLabel: el.getAttribute('aria-label') || '',
            href: el.getAttribute('href') || ''
          }))
        )
      ).slice(0, 10);

      const prompt = `
You are a Playwright automation expert.

A locator failed:
${locator.toString()}

Available page elements:

Buttons:
${JSON.stringify(buttons, null, 2)}

Inputs:
${JSON.stringify(inputs, null, 2)}

Links:
${JSON.stringify(links, null, 2)}

TASK:
Suggest the BEST Playwright locator using ONE of:
- getByRole
- getByLabel
- getByPlaceholder
- getByText
- css

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text
- Prefer Playwright-native locators first
- Use css only as last option

FORMAT:
{
  "locatorType": "role | label | placeholder | text | css",
  "role": "...",
  "name": "...",
  "label": "...",
  "placeholder": "...",
  "text": "...",
  "selector": "..."
}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0
      });

      const raw = response.choices[0].message.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.log('⚠️ No JSON found in AI response');
        return null;
      }

      let healedStep;
      try {
        healedStep = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.log('⚠️ JSON parse failed:', err.message);
        return null;
      }

      if (!healedStep?.locatorType) {
        console.log('⚠️ Invalid locator structure');
        return null;
      }

      return healedStep;
    } catch (err) {
      console.log('❌ AI healing failed:', err.message);
      return null;
    }
  }
};

export default aiLocatorService;