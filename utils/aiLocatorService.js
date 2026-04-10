import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function isValidHealedStep(step) {
  if (!step || !step.locatorType) return false;

  switch (step.locatorType) {
    case 'role':
      return !!step.role;
    case 'label':
      return !!step.label;
    case 'placeholder':
      return !!step.placeholder;
    case 'text':
      return !!step.text;
    case 'css':
      return !!step.selector;
    default:
      return false;
  }
}

const aiLocatorService = {
  async healLocator(locator, page, actionType, elementName) {
    try {
      if (page.isClosed()) {
        console.log('⚠️ Page is already closed, skipping AI healing');
        return null;
      }

      const buttons = (
        await page.locator('button').evaluateAll(elements =>
          elements.map(el => ({
            visibleText: (el.textContent || '').trim(),
            ariaLabel: el.getAttribute('aria-label') || '',
            id: el.getAttribute('id') || '',
            name: el.getAttribute('name') || '',
            dataTest: el.getAttribute('data-test') || ''
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
            visibleText: (el.textContent || '').trim(),
            ariaLabel: el.getAttribute('aria-label') || '',
            href: el.getAttribute('href') || ''
          }))
        )
      ).slice(0, 10);

      const prompt = `
You are a Playwright automation expert.

A locator failed:
${locator.toString()}

Action type:
${actionType}

Element name:
${elementName}

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

IMPORTANT RULES:
- If actionType is "click", prefer role/text/css for clickable elements
- If actionType is "click", do NOT return placeholder for buttons like loginButton
- If actionType is "fill", prefer placeholder/css for inputs
- If elementName is "loginButton", prefer:
  { "locatorType": "role", "role": "button", "name": "Login" }
  or
  { "locatorType": "text", "text": "Login" }
- If elementName contains "password", prefer:
  { "locatorType": "placeholder", "placeholder": "Password" }
  or css for password input
- If elementName contains "username", prefer:
  { "locatorType": "placeholder", "placeholder": "Username" }
- Do NOT return internal-looking names like "login-button" unless using css
- Use css only as last option

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text

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

      const raw = response.choices[0]?.message?.content || '';
      console.log('🧠 Raw AI locator response:', raw);

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

      if (!isValidHealedStep(healedStep)) {
        console.log('⚠️ Invalid healed locator structure:', healedStep);
        return null;
      }

      console.log('✅ AI healed locator candidate:', healedStep);
      return healedStep;
    } catch (err) {
      console.log('❌ AI healing failed:', err.message);
      return null;
    }
  }
};

export default aiLocatorService;