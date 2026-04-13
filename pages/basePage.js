import aiLocatorService from '../utils/aiLocatorService.js';
import { getLocator, buildLocatorKey } from '../utils/locatorUtils.js';
import { getCachedLocator, setCachedLocator } from '../utils/locatorCache.js';
import { logHealingEvent } from '../utils/healingLogger.js';
import { addRagEntry } from '../rag/ragStore.js';
import { findSimilarHealing } from '../rag/ragSearch.js';
import { getEmbedding } from '../rag/embeddingService.js';
import { ELEMENT_STRATEGIES } from '../utils/elementStrategies.js';

export default class BasePage {
  constructor(page) {
    this.page = page;
    this.pageName = this.constructor.name;
  }

  getKey(meta, actionType) {
    return buildLocatorKey(this.pageName, meta.name, actionType);
  }

  buildRagContext(meta, actionType, locator) {
    return `${this.pageName} | ${meta.name} | ${meta.semantic || 'unknown'} | ${actionType} | ${locator.toString()}`;
  }

  getElementStrategy(meta) {
    return ELEMENT_STRATEGIES[meta.name] || { semantic: meta.semantic || 'unknown', fallback: [] };
  }

  isLocatorCompatible(step, actionType, meta) {
    if (!step) return false;

    const semantic = meta.semantic || this.getElementStrategy(meta).semantic;

    if (actionType === 'click') {
      if (semantic === 'button' || semantic === 'link') {
        return ['role', 'text', 'css'].includes(step.locatorType);
      }
      return ['role', 'text', 'css'].includes(step.locatorType);
    }

    if (actionType === 'fill') {
      if (semantic === 'input' || semantic === 'textbox') {
        return ['placeholder', 'label', 'css', 'role'].includes(step.locatorType);
      }
      return ['placeholder', 'label', 'css', 'role'].includes(step.locatorType);
    }

    if (actionType === 'select') {
      return ['role', 'label', 'css'].includes(step.locatorType);
    }

    return true;
  }

  normalizeHealedStep(step, meta, actionType) {
    if (!step) return null;

    const semantic = meta.semantic || this.getElementStrategy(meta).semantic;

    if (
      actionType === 'click' &&
      semantic === 'button' &&
      step.locatorType === 'role' &&
      typeof step.name === 'string'
    ) {
      const suspicious = step.name.trim();

      if (suspicious.includes('-')) {
        const normalizedText = suspicious
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return { locatorType: 'text', text: normalizedText };
      }
    }

    if (
      actionType === 'fill' &&
      semantic === 'input' &&
      step.locatorType === 'label' &&
      step.selector
    ) {
      return { locatorType: 'css', selector: step.selector };
    }

    return step;
  }

  async saveRagMemory(meta, actionType, originalLocator, healedStep) {
    const weakGeneric =
      (healedStep.locatorType === 'css' && healedStep.selector === 'input') ||
      (healedStep.locatorType === 'role' && healedStep.role === 'textbox' && !healedStep.name) ||
      (healedStep.locatorType === 'text' && !healedStep.text);

    if (weakGeneric) {
      console.log('⚠️ Skipping weak generic locator from RAG memory:', healedStep);
      return;
    }

    const contextText = this.buildRagContext(meta, actionType, originalLocator);
    const embedding = await getEmbedding(contextText);

    if (!embedding) return;

    addRagEntry({
      page: this.pageName,
      element: meta.name,
      semantic: meta.semantic,
      action: actionType,
      originalLocator: originalLocator.toString(),
      healedLocator: healedStep,
      embedding,
      createdAt: new Date().toISOString()
    });
  }

  async tryStrategyFallback(actionType, value, meta) {
    const strategy = this.getElementStrategy(meta);

    if (!strategy.fallback?.length) {
      return false;
    }

    for (const fallbackStep of strategy.fallback) {
      try {
        const locator = getLocator(this.page, fallbackStep);

        if (actionType === 'click') {
          if (await locator.count()) {
            await locator.first().click();
            return fallbackStep;
          }
        }

        if (actionType === 'fill') {
          if (await locator.count()) {
            await locator.first().fill(value);
            return fallbackStep;
          }
        }

        if (actionType === 'select') {
          if (await locator.count()) {
            await locator.first().selectOption(value);
            return fallbackStep;
          }
        }
      } catch {
        // continue trying next fallback
      }
    }

    return false;
  }

  async genericFallbackClick(locator) {
    const buttons = this.page.getByRole('button');
    if (await buttons.count()) {
      await buttons.first().click();
      return { locatorType: 'role', role: 'button' };
    }

    const clickable = this.page.locator('button, a, [role="button"]');
    if (await clickable.count()) {
      await clickable.first().click();
      return { locatorType: 'css', selector: 'button, a, [role="button"]' };
    }

    throw new Error(`No generic click fallback found for ${locator.toString()}`);
  }

  async genericFallbackFill(locator, value) {
    const textboxes = this.page.getByRole('textbox');
    if (await textboxes.count()) {
      await textboxes.first().fill(value);
      return { locatorType: 'role', role: 'textbox' };
    }

    const inputs = this.page.locator('input');
    if (await inputs.count()) {
      await inputs.first().fill(value);
      return { locatorType: 'css', selector: 'input' };
    }

    throw new Error(`No generic fill fallback found for ${locator.toString()}`);
  }

  async safeClick(originalLocator, meta, testName = 'unknown test') {
    const key = this.getKey(meta, 'click');

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
          element: meta.name,
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

    const ragContext = this.buildRagContext(meta, 'click', originalLocator);
    const ragResult = await findSimilarHealing(ragContext);

    if (ragResult?.match?.healedLocator) {
      console.log(`🧠 RAG match found with score ${ragResult.score.toFixed(4)}`);
      try {
        const ragLocator = getLocator(this.page, ragResult.match.healedLocator);
        await ragLocator.click({ timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: meta.name,
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
        console.log('⚠️ RAG click locator failed:', err.message);
      }
    } else {
      console.log(`🧠 No RAG match found for ${key}`);
    }

    console.log('🤖 Trying AI healing for click...');
    let healedStep = await aiLocatorService.healLocator(originalLocator, this.page, 'click', meta.name);

    if (healedStep) {
      healedStep = this.normalizeHealedStep(healedStep, meta, 'click');

      if (!this.isLocatorCompatible(healedStep, 'click', meta)) {
        console.log('⚠️ Rejected incompatible AI click locator:', healedStep);
      } else {
        try {
          console.log('🧪 Building Playwright locator from AI step:', healedStep);
          const healedLocator = getLocator(this.page, healedStep);

          await healedLocator.click({ timeout: 5000 });

          setCachedLocator(key, healedStep);
          await this.saveRagMemory(meta, 'click', originalLocator, healedStep);

          logHealingEvent({
            testName,
            page: this.pageName,
            element: meta.name,
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

    const strategyFallback = await this.tryStrategyFallback('click', null, meta);
    if (strategyFallback) {
      logHealingEvent({
        testName,
        page: this.pageName,
        element: meta.name,
        action: 'click',
        originalLocator: originalLocator.toString(),
        strategy: 'fallback',
        status: 'success',
        details: 'Used configured fallback strategy',
        healedLocator: strategyFallback
      });
      return;
    }

    const genericFallback = await this.genericFallbackClick(originalLocator);
    logHealingEvent({
      testName,
      page: this.pageName,
      element: meta.name,
      action: 'click',
      originalLocator: originalLocator.toString(),
      strategy: 'fallback',
      status: 'success',
      details: 'Used generic click fallback',
      healedLocator: genericFallback
    });
  }

  async safeFill(originalLocator, value, meta, testName = 'unknown test') {
    const key = this.getKey(meta, 'fill');

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
          element: meta.name,
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

    const ragContext = this.buildRagContext(meta, 'fill', originalLocator);
    const ragResult = await findSimilarHealing(ragContext);

    if (ragResult?.match?.healedLocator) {
      console.log(`🧠 RAG match found with score ${ragResult.score.toFixed(4)}`);
      try {
        const ragLocator = getLocator(this.page, ragResult.match.healedLocator);
        await ragLocator.fill(value, { timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: meta.name,
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
    let healedStep = await aiLocatorService.healLocator(originalLocator, this.page, 'fill', meta.name);

    if (healedStep) {
      healedStep = this.normalizeHealedStep(healedStep, meta, 'fill');

      if (!this.isLocatorCompatible(healedStep, 'fill', meta)) {
        console.log('⚠️ Rejected incompatible AI fill locator:', healedStep);
      } else {
        try {
          console.log('🧪 Building Playwright locator from AI step:', healedStep);
          const healedLocator = getLocator(this.page, healedStep);

          await healedLocator.fill(value, { timeout: 5000 });

          setCachedLocator(key, healedStep);
          await this.saveRagMemory(meta, 'fill', originalLocator, healedStep);

          logHealingEvent({
            testName,
            page: this.pageName,
            element: meta.name,
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

    const strategyFallback = await this.tryStrategyFallback('fill', value, meta);
    if (strategyFallback) {
      logHealingEvent({
        testName,
        page: this.pageName,
        element: meta.name,
        action: 'fill',
        originalLocator: originalLocator.toString(),
        strategy: 'fallback',
        status: 'success',
        details: 'Used configured fallback strategy',
        healedLocator: strategyFallback
      });
      return;
    }

    const genericFallback = await this.genericFallbackFill(originalLocator, value);
    logHealingEvent({
      testName,
      page: this.pageName,
      element: meta.name,
      action: 'fill',
      originalLocator: originalLocator.toString(),
      strategy: 'fallback',
      status: 'success',
      details: 'Used generic fill fallback',
      healedLocator: genericFallback
    });
  }

  async safeSelectOption(originalLocator, value, meta, testName = 'unknown test') {
    const key = this.getKey(meta, 'select');

    try {
      await originalLocator.selectOption(value, { timeout: 5000 });
      return;
    } catch (err) {
      console.log('❌ Original select locator failed:', err.message);
    }

    const cached = getCachedLocator(key);
    if (cached) {
      console.log(`⚡ Using cached select locator for ${key}`);
      try {
        const cachedLocator = getLocator(this.page, cached);
        await cachedLocator.selectOption(value, { timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: meta.name,
          action: 'select',
          originalLocator: originalLocator.toString(),
          strategy: 'cache',
          status: 'success',
          details: `Used cached select locator for ${key}`,
          healedLocator: cached
        });
        return;
      } catch (err) {
        console.log('⚠️ Cached select locator failed:', err.message);
      }
    }

    const ragContext = this.buildRagContext(meta, 'select', originalLocator);
    const ragResult = await findSimilarHealing(ragContext);

    if (ragResult?.match?.healedLocator) {
      console.log(`🧠 RAG match found with score ${ragResult.score.toFixed(4)}`);
      try {
        const ragLocator = getLocator(this.page, ragResult.match.healedLocator);
        await ragLocator.selectOption(value, { timeout: 5000 });

        logHealingEvent({
          testName,
          page: this.pageName,
          element: meta.name,
          action: 'select',
          originalLocator: originalLocator.toString(),
          strategy: 'rag',
          status: 'success',
          details: `Used RAG memory with score ${ragResult.score.toFixed(4)}`,
          healedLocator: ragResult.match.healedLocator
        });

        setCachedLocator(key, ragResult.match.healedLocator);
        return;
      } catch (err) {
        console.log('⚠️ RAG select locator failed:', err.message);
      }
    } else {
      console.log(`🧠 No RAG match found for ${key}`);
    }

    console.log('🤖 Trying AI healing for select...');
    let healedStep = await aiLocatorService.healLocator(originalLocator, this.page, 'select', meta.name);

    if (healedStep) {
      healedStep = this.normalizeHealedStep(healedStep, meta, 'select');

      if (!this.isLocatorCompatible(healedStep, 'select', meta)) {
        console.log('⚠️ Rejected incompatible AI select locator:', healedStep);
      } else {
        try {
          console.log('🧪 Building Playwright locator from AI step:', healedStep);
          const healedLocator = getLocator(this.page, healedStep);

          await healedLocator.selectOption(value, { timeout: 5000 });

          setCachedLocator(key, healedStep);
          await this.saveRagMemory(meta, 'select', originalLocator, healedStep);

          logHealingEvent({
            testName,
            page: this.pageName,
            element: meta.name,
            action: 'select',
            originalLocator: originalLocator.toString(),
            strategy: 'ai',
            status: 'success',
            details: `AI healed and cached select locator for ${key}`,
            healedLocator: healedStep
          });
          return;
        } catch (err) {
          console.log('⚠️ AI select locator failed:', err.message);
          console.log('⚠️ AI healed step was:', healedStep);
        }
      }
    } else {
      console.log('⚠️ AI healing returned null for select');
    }

    const strategyFallback = await this.tryStrategyFallback('select', value, meta);
    if (strategyFallback) {
      logHealingEvent({
        testName,
        page: this.pageName,
        element: meta.name,
        action: 'select',
        originalLocator: originalLocator.toString(),
        strategy: 'fallback',
        status: 'success',
        details: 'Used configured fallback strategy',
        healedLocator: strategyFallback
      });
      return;
    }

    throw new Error(`Select action failed for ${meta.name}`);
  }
}