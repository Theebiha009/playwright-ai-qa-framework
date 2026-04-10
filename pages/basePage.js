import aiLocatorService from '../utils/aiLocatorService.js';
import { getLocator, buildLocatorKey } from '../utils/locatorUtils.js';
import { getCachedLocator, setCachedLocator } from '../utils/locatorCache.js';
import { logHealingEvent } from '../utils/healingLogger.js';
import { addRagEntry } from '../rag/ragStore.js';
import { findSimilarHealing } from '../rag/ragSearch.js';
import { getEmbedding } from '../rag/embeddingService.js';

export default class BasePage {
  constructor(page) {
    this.page = page;
    this.pageName = this.constructor.name;
  }

  getKey(elementName, actionType) {
    return buildLocatorKey(this.pageName, elementName, actionType);
  }

  buildRagContext(elementName, actionType, locator) {
    return `${this.pageName} | ${elementName} | ${actionType} | ${locator.toString()}`;
  }

  isLocatorCompatible(step, actionType, elementName) {
    if (!step) return false;

    const element = (elementName || '').toLowerCase();

    if (actionType === 'click') {
      // Prevent non-clickable locator styles for buttons/actions
      if (element.includes('button') || element.includes('link')) {
        return ['role', 'text', 'css'].includes(step.locatorType);
      }
      return ['role', 'text', 'css'].includes(step.locatorType);
    }

    if (actionType === 'fill') {
      // Prevent button/text style locators for inputs
      if (element.includes('password') || element.includes('username') || element.includes('name')) {
        return ['placeholder', 'label', 'css', 'role'].includes(step.locatorType);
      }
      return ['placeholder', 'label', 'css', 'role'].includes(step.locatorType);
    }

    return true;
  }

  normalizeHealedStep(step, elementName, actionType) {
    if (!step) return null;

    const element = (elementName || '').toLowerCase();

    if (
      step.locatorType === 'role' &&
      step.role === 'button' &&
      typeof step.name === 'string'
    ) {
      const suspicious = step.name.trim().toLowerCase();

      if (suspicious === 'login-button' || suspicious === 'login button') {
        return { locatorType: 'role', role: 'button', name: 'Login' };
      }

      if (suspicious.includes('-')) {
        const normalizedText = step.name
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        if (normalizedText.toLowerCase().includes('login')) {
          return { locatorType: 'role', role: 'button', name: 'Login' };
        }

        return { locatorType: 'text', text: normalizedText };
      }
    }

    if (actionType === 'fill' && element.includes('password')) {
      if (step.locatorType === 'placeholder' && step.placeholder?.toLowerCase() === 'password') {
        return step;
      }

      if (step.locatorType === 'css' && step.selector) {
        return step;
      }

      if (step.locatorType === 'label' && step.label?.toLowerCase() === 'password') {
        return { locatorType: 'placeholder', placeholder: 'Password' };
      }

      return { locatorType: 'css', selector: "input[type='password']" };
    }

    if (actionType === 'fill' && element.includes('username')) {
      if (step.locatorType === 'placeholder' && step.placeholder?.toLowerCase() === 'username') {
        return step;
      }

      if (step.locatorType === 'label' && /username|user/i.test(step.label || '')) {
        return { locatorType: 'placeholder', placeholder: 'Username' };
      }
    }

    if (actionType === 'fill' && step.locatorType === 'label' && step.selector) {
      return { locatorType: 'css', selector: step.selector };
    }

    return step;
  }

  async saveRagMemory(elementName, actionType, originalLocator, healedStep) {
    const weakGeneric =
      (healedStep.locatorType === 'css' && healedStep.selector === 'input') ||
      (healedStep.locatorType === 'role' && healedStep.role === 'textbox' && !healedStep.name) ||
      (healedStep.locatorType === 'text' && !healedStep.text);

    if (weakGeneric) {
      console.log('⚠️ Skipping weak generic locator from RAG memory:', healedStep);
      return;
    }

    const contextText = this.buildRagContext(elementName, actionType, originalLocator);
    const embedding = await getEmbedding(contextText);

    if (!embedding) return;

    addRagEntry({
      page: this.pageName,
      element: elementName,
      action: actionType,
      originalLocator: originalLocator.toString(),
      healedLocator: healedStep,
      embedding,
      createdAt: new Date().toISOString()
    });
  }

  async fallbackClick(locator, elementName, testName) {
    const locatorStr = locator.toString().toLowerCase();

    try {
      if (locatorStr.includes('button')) {
        const loginButton = this.page.getByRole('button', { name: /login/i });
        if (await loginButton.count()) {
          await loginButton.first().click();
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'click',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used login button regex fallback',
            healedLocator: { locatorType: 'role', role: 'button', name: 'Login' }
          });
          return;
        }

        const buttons = this.page.getByRole('button');
        if (await buttons.count()) {
          await buttons.first().click();
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'click',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used generic button fallback'
          });
          return;
        }
      }

      if (locatorStr.includes('link')) {
        const links = this.page.getByRole('link');
        if (await links.count()) {
          await links.first().click();
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'click',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used generic link fallback'
          });
          return;
        }
      }

      const genericClickable = this.page.locator('button, a, [role="button"]');
      if (await genericClickable.count()) {
        await genericClickable.first().click();
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'click',
          originalLocator: locator.toString(),
          strategy: 'fallback',
          status: 'success',
          details: 'Used generic clickable fallback'
        });
        return;
      }

      throw new Error('No fallback click locator found');
    } catch (err) {
      logHealingEvent({
        testName,
        page: this.pageName,
        element: elementName,
        action: 'click',
        originalLocator: locator.toString(),
        strategy: 'fallback',
        status: 'failed',
        details: err.message
      });
      throw err;
    }
  }

  async fallbackFill(locator, value, elementName, testName) {
    const locatorStr = locator.toString().toLowerCase();

    try {
      if (locatorStr.includes('password')) {
        const passwordByPlaceholder = this.page.getByPlaceholder(/password/i);
        if (await passwordByPlaceholder.count()) {
          await passwordByPlaceholder.first().fill(value);
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'fill',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used password placeholder fallback',
            healedLocator: { locatorType: 'placeholder', placeholder: 'Password' }
          });
          return;
        }

        const passwordCss = this.page.locator("input[type='password']");
        if (await passwordCss.count()) {
          await passwordCss.first().fill(value);
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'fill',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used password CSS fallback',
            healedLocator: { locatorType: 'css', selector: "input[type='password']" }
          });
          return;
        }
      }

      const textboxes = this.page.getByRole('textbox');
      if (await textboxes.count()) {
        await textboxes.first().fill(value);
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'fill',
          originalLocator: locator.toString(),
          strategy: 'fallback',
          status: 'success',
          details: 'Used generic textbox fallback',
          healedLocator: { locatorType: 'role', role: 'textbox' }
        });
        return;
      }

      const inputs = this.page.locator('input');
      if (await inputs.count()) {
        await inputs.first().fill(value);
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'fill',
          originalLocator: locator.toString(),
          strategy: 'fallback',
          status: 'success',
          details: 'Used generic input fallback',
          healedLocator: { locatorType: 'css', selector: 'input' }
        });
        return;
      }

      throw new Error('No fallback fill locator found');
    } catch (err) {
      logHealingEvent({
        testName,
        page: this.pageName,
        element: elementName,
        action: 'fill',
        originalLocator: locator.toString(),
        strategy: 'fallback',
        status: 'failed',
        details: err.message
      });
      throw err;
    }
  }

  async safeClick(originalLocator, elementName, testName = 'unknown test') {
    const key = this.getKey(elementName, 'click');

    try {
      await originalLocator.click({ timeout: 5000 });
      return;
    } catch (err) {
      console.log('❌ Original click locator failed:', err.message);
    }

    const cached = getCachedLocator(key);
    if (cached) {
      console.log(`⚡ Using cached click locator for ${key}`);
      try {
        const cachedLocator = getLocator(this.page, cached);
        await cachedLocator.click({ timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'click',
          originalLocator: originalLocator.toString(),
          strategy: 'cache',
          status: 'success',
          details: `Used cached click locator for ${key}`,
          healedLocator: cached
        });
        return;
      } catch (err) {
        console.log('⚠️ Cached click locator failed:', err.message);
      }
    }

    const ragContext = this.buildRagContext(elementName, 'click', originalLocator);
    const ragResult = await findSimilarHealing(ragContext);

    if (ragResult?.match?.healedLocator) {
      console.log(`🧠 RAG match found with score ${ragResult.score.toFixed(4)}`);
      try {
        const ragLocator = getLocator(this.page, ragResult.match.healedLocator);
        await ragLocator.click({ timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'click',
          originalLocator: originalLocator.toString(),
          strategy: 'rag',
          status: 'success',
          details: `Used RAG memory with score ${ragResult.score.toFixed(4)}`,
          healedLocator: ragResult.match.healedLocator
        });

        setCachedLocator(key, ragResult.match.healedLocator);
        return;
      } catch (err) {
        console.log('⚠️ RAG locator failed:', err.message);
      }
    } else {
      console.log(`🧠 No RAG match found for ${key}`);
    }

    console.log('🤖 Trying AI healing for click...');
    let healedStep = await aiLocatorService.healLocator(originalLocator, this.page, 'click', elementName);

    if (healedStep) {
      healedStep = this.normalizeHealedStep(healedStep, elementName, 'click');

      if (!this.isLocatorCompatible(healedStep, 'click', elementName)) {
        console.log('⚠️ Rejected incompatible AI click locator:', healedStep);
      } else {
        try {
          console.log('🧪 Building Playwright locator from AI step:', healedStep);
          const healedLocator = getLocator(this.page, healedStep);

          await healedLocator.click({ timeout: 5000 });

          setCachedLocator(key, healedStep);
          await this.saveRagMemory(elementName, 'click', originalLocator, healedStep);

          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'click',
            originalLocator: originalLocator.toString(),
            strategy: 'ai',
            status: 'success',
            details: `AI healed and cached click locator for ${key}`,
            healedLocator: healedStep
          });
          return;
        } catch (err) {
          console.log('⚠️ AI click locator failed:', err.message);
          console.log('⚠️ AI healed step was:', healedStep);
        }
      }
    } else {
      console.log('⚠️ AI healing returned null for click');
    }

    console.log('⚠️ Using generic click fallback...');
    await this.fallbackClick(originalLocator, elementName, testName);
  }

  async safeFill(originalLocator, value, elementName, testName = 'unknown test') {
    const key = this.getKey(elementName, 'fill');

    try {
      await originalLocator.fill(value, { timeout: 5000 });
      return;
    } catch (err) {
      console.log('❌ Original fill locator failed:', err.message);
    }

    const cached = getCachedLocator(key);
    if (cached) {
      console.log(`⚡ Using cached fill locator for ${key}`);
      try {
        const cachedLocator = getLocator(this.page, cached);
        await cachedLocator.fill(value, { timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'fill',
          originalLocator: originalLocator.toString(),
          strategy: 'cache',
          status: 'success',
          details: `Used cached fill locator for ${key}`,
          healedLocator: cached
        });
        return;
      } catch (err) {
        console.log('⚠️ Cached fill locator failed:', err.message);
      }
    }

    const ragContext = this.buildRagContext(elementName, 'fill', originalLocator);
    const ragResult = await findSimilarHealing(ragContext);

    if (ragResult?.match?.healedLocator) {
      console.log(`🧠 RAG match found with score ${ragResult.score.toFixed(4)}`);
      try {
        const ragLocator = getLocator(this.page, ragResult.match.healedLocator);
        await ragLocator.fill(value, { timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'fill',
          originalLocator: originalLocator.toString(),
          strategy: 'rag',
          status: 'success',
          details: `Used RAG memory with score ${ragResult.score.toFixed(4)}`,
          healedLocator: ragResult.match.healedLocator
        });

        setCachedLocator(key, ragResult.match.healedLocator);
        return;
      } catch (err) {
        console.log('⚠️ RAG fill locator failed:', err.message);
      }
    } else {
      console.log(`🧠 No RAG match found for ${key}`);
    }

    console.log('🤖 Trying AI healing for fill...');
    let healedStep = await aiLocatorService.healLocator(originalLocator, this.page, 'fill', elementName);

    if (healedStep) {
      healedStep = this.normalizeHealedStep(healedStep, elementName, 'fill');

      if (!this.isLocatorCompatible(healedStep, 'fill', elementName)) {
        console.log('⚠️ Rejected incompatible AI fill locator:', healedStep);
      } else {
        try {
          console.log('🧪 Building Playwright locator from AI step:', healedStep);
          const healedLocator = getLocator(this.page, healedStep);

          await healedLocator.fill(value, { timeout: 5000 });

          setCachedLocator(key, healedStep);
          await this.saveRagMemory(elementName, 'fill', originalLocator, healedStep);

          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'fill',
            originalLocator: originalLocator.toString(),
            strategy: 'ai',
            status: 'success',
            details: `AI healed and cached fill locator for ${key}`,
            healedLocator: healedStep
          });
          return;
        } catch (err) {
          console.log('⚠️ AI fill locator failed:', err.message);
          console.log('⚠️ AI healed step was:', healedStep);
        }
      }
    } else {
      console.log('⚠️ AI healing returned null for fill');
    }

    console.log('⚠️ Using generic fill fallback...');
    await this.fallbackFill(originalLocator, value, elementName, testName);
  }
}