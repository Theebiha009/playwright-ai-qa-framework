import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';
import InventoryPage from '../pages/inventoryPage.js';
import CartPage from '../pages/cartPage.js';

test('user can navigate to cart', async ({ page }) => {
  const testName = 'user can navigate to cart';

  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await page.goto('https://www.saucedemo.com');
  await loginPage.login('standard_user', 'secret_sauce', testName);

  await inventoryPage.addFirstItemToCart(testName);
  await inventoryPage.goToCart(testName);

  await cartPage.verifyCartItemVisible();
  await expect(page.locator('.cart_item')).toBeVisible();
});

test('user can remove item from cart', async ({ page }) => {
  const testName = 'user can remove item from cart';

  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await page.goto('https://www.saucedemo.com');
  await loginPage.login('standard_user', 'secret_sauce', testName);

  await inventoryPage.addFirstItemToCart(testName);
  await inventoryPage.goToCart(testName);
  await cartPage.removeFirstItem(testName);

  await expect(page.locator('.cart_item')).toHaveCount(0);
});