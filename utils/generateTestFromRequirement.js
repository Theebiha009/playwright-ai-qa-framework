import fs from 'fs';
import path from 'path';
import { generatePlaywrightTest } from './aiTestGeneratorService.js';

async function run() {
  const requirementText = process.argv.slice(2).join(' ').trim();

  if (!requirementText) {
    console.log('⚠️ Please provide a requirement.');
    console.log('Example: npm run generate:test -- "User should login with valid credentials"');
    process.exit(1);
  }

  try {
    const generatedCode = await generatePlaywrightTest(requirementText);

    const outputDir = path.resolve('./tests/generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const safeFileName = requirementText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    const outputFile = path.join(outputDir, `${safeFileName}.spec.js`);

    fs.writeFileSync(outputFile, generatedCode, 'utf-8');

    console.log(`✅ Test generated successfully: ${outputFile}`);
  } catch (error) {
    console.error('❌ Error generating test file:', error.message);
    process.exit(1);
  }
}

run();