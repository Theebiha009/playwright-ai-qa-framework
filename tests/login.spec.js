import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';
import { baseURL } from '../config/env.js';
import { testData } from '../utils/testData.js';

test('valid login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const testName = 'valid login'
  await page.goto(baseURL);
  await loginPage.login(
    testData.validUser.username,
    testData.validUser.password,
    testName
  );

  await expect(page.locator('.inventory_list')).toBeVisible();
  console.log("Sucess for valid login")
});

test('invalid login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const testName = 'Invalid login'
  await page.goto(baseURL);
  await loginPage.login(
    testData.invalidUser.username,
    testData.invalidUser.password,
    testName
  );

  await expect(page.locator('.error-message-container')).toBeVisible();
  console.log("Sucess for Invalid login")
});