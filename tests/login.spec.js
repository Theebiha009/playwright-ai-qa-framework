import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';

test('valid login', async ({ page }) => {
  const testName = 'valid login';

  const loginPage = new LoginPage(page);
  await page.goto('https://www.saucedemo.com');

  await loginPage.login('standard_user', 'secret_sauce', testName);

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list1')).toBeVisible();

  console.log('Success for valid login');
});

test('invalid login', async ({ page }) => {
  const testName = 'invalid login';

  const loginPage = new LoginPage(page);
  await page.goto('https://www.saucedemo.com');

  await loginPage.login('locked_out_user', 'secret_sauce', testName);

  await expect(page.locator('[data-test="error"]')).toBeVisible();
  await expect(page).not.toHaveURL(/inventory/);

  console.log('Success for invalid login');
});