import aiLocatorService from '../utils/aiLocatorService.js';
import { getLocator, buildLocatorKey } from '../utils/locatorUtils.js';
import { getCachedLocator, setCachedLocator } from '../utils/locatorCache.js';
import { logHealingEvent } from '../utils/healingLogger.js';

export default class BasePage {
  constructor(page) {
    this.page = page;
    this.pageName = this.constructor.name;
  }

  getKey(elementName, actionType) {
    return buildLocatorKey(this.pageName, elementName, actionType);
  }

  async fallbackClick(locator, elementName, testName) {
    const locatorStr = locator.toString().toLowerCase();

    try {
      if (locatorStr.includes('button')) {
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

        const passwordByCss = this.page.locator('input[type="password"]');
        if (await passwordByCss.count()) {
          await passwordByCss.first().fill(value);
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'fill',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used password CSS fallback',
            healedLocator: { locatorType: 'css', selector: 'input[type="password"]' }
          });
          return;
        }
      }

      if (
        locatorStr.includes('username') ||
        locatorStr.includes('user-name') ||
        locatorStr.includes('email') ||
        locatorStr.includes('user')
      ) {
        const userByPlaceholder = this.page.getByPlaceholder(/username|email/i);
        if (await userByPlaceholder.count()) {
          await userByPlaceholder.first().fill(value);
          logHealingEvent({
            testName,
            page: this.pageName,
            element: elementName,
            action: 'fill',
            originalLocator: locator.toString(),
            strategy: 'fallback',
            status: 'success',
            details: 'Used username/email placeholder fallback',
            healedLocator: { locatorType: 'placeholder', placeholder: 'Username' }
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
    } catch {
      console.log('❌ Original click locator failed');
      logHealingEvent({
        testName,
        page: this.pageName,
        element: elementName,
        action: 'click',
        originalLocator: originalLocator.toString(),
        strategy: 'original',
        status: 'failed',
        details: 'Original click locator failed'
      });
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
      } catch {
        console.log('⚠️ Cached click locator failed');
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'click',
          originalLocator: originalLocator.toString(),
          strategy: 'cache',
          status: 'failed',
          details: `Cached click locator failed for ${key}`,
          healedLocator: cached
        });
      }
    }

    console.log('🤖 Trying AI healing for click...');
    const healedStep = await aiLocatorService.healLocator(originalLocator, this.page);

    if (healedStep) {
      try {
        const healedLocator = getLocator(this.page, healedStep);
        await healedLocator.click({ timeout: 5000 });

        setCachedLocator(key, healedStep);
        console.log(`✅ Saved healed click locator for ${key}`);

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
      } catch {
        console.log('⚠️ AI click locator failed');
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'click',
          originalLocator: originalLocator.toString(),
          strategy: 'ai',
          status: 'failed',
          details: `AI click locator failed for ${key}`,
          healedLocator: healedStep
        });
      }
    }

    console.log('⚠️ Using generic click fallback...');
    await this.fallbackClick(originalLocator, elementName, testName);
  }

  async safeFill(originalLocator, value, elementName, testName = 'unknown test') {
    const key = this.getKey(elementName, 'fill');

    try {
      await originalLocator.fill(value, { timeout: 5000 });
      return;
    } catch {
      console.log('❌ Original fill locator failed');
      logHealingEvent({
        testName,
        page: this.pageName,
        element: elementName,
        action: 'fill',
        originalLocator: originalLocator.toString(),
        strategy: 'original',
        status: 'failed',
        details: 'Original fill locator failed'
      });
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
      } catch {
        console.log('⚠️ Cached fill locator failed');
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'fill',
          originalLocator: originalLocator.toString(),
          strategy: 'cache',
          status: 'failed',
          details: `Cached fill locator failed for ${key}`,
          healedLocator: cached
        });
      }
    }

    console.log('🤖 Trying AI healing for fill...');
    const healedStep = await aiLocatorService.healLocator(originalLocator, this.page);

    if (healedStep) {
      try {
        const healedLocator = getLocator(this.page, healedStep);
        await healedLocator.fill(value, { timeout: 5000 });

        setCachedLocator(key, healedStep);
        console.log(`✅ Saved healed fill locator for ${key}`);

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
      } catch {
        console.log('⚠️ AI fill locator failed');
        logHealingEvent({
          testName,
          page: this.pageName,
          element: elementName,
          action: 'fill',
          originalLocator: originalLocator.toString(),
          strategy: 'ai',
          status: 'failed',
          details: `AI fill locator failed for ${key}`,
          healedLocator: healedStep
        });
      }
    }

    console.log('⚠️ Using generic fill fallback...');
    await this.fallbackFill(originalLocator, value, elementName, testName);
  }
}