import { test, expect } from '@playwright/test';
import LoginPage from '../pages/loginPage.js';
import InventoryPage from '../pages/inventoryPage.js';
import CartPage from '../pages/cartPage.js';
import CheckoutPage from '../pages/checkoutPage.js';

test('user can complete checkout successfully', async ({ page }) => {
  const testName = 'user can complete checkout successfully';

  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await page.goto('https://www.saucedemo.com');
  await loginPage.login('standard_user', 'secret_sauce', testName);

  await inventoryPage.addFirstItemToCart(testName);
  await inventoryPage.goToCart(testName);
  await cartPage.proceedToCheckout(testName);

  await checkoutPage.completeCheckout('John', 'Doe', '3000', testName);

  await checkoutPage.verifyOrderComplete();
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});

test('user can continue checkout after entering information', async ({ page }) => {
  const testName = 'user can continue checkout after entering information';

  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await page.goto('https://www.saucedemo.com');
  await loginPage.login('standard_user', 'secret_sauce', testName);

  await inventoryPage.addFirstItemToCart(testName);
  await inventoryPage.goToCart(testName);
  await cartPage.proceedToCheckout(testName);

  await checkoutPage.enterCheckoutInformation('Jane', 'Smith', '3001', testName);
  await checkoutPage.continueCheckout(testName);

  await expect(page.locator('.cart_list')).toBeVisible();
});