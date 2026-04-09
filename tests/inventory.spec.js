import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';
import InventoryPage from '../pages/inventoryPage.js';

test('inventory page loads after valid login', async ({ page }) => {
  const testName = 'inventory page loads after valid login';

  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await page.goto('https://www.saucedemo.com');
  await loginPage.login('standard_user', 'secret_sauce', testName);

  await inventoryPage.verifyInventoryVisible();
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('user can add first item to cart from inventory', async ({ page }) => {
  const testName = 'user can add first item to cart from inventory';

  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await page.goto('https://www.saucedemo.com');
  await loginPage.login('standard_user', 'secret_sauce', testName);

  await inventoryPage.addFirstItemToCart(testName);
  await expect(page.locator('.shopping_cart_badge')).toBeVisible();
});