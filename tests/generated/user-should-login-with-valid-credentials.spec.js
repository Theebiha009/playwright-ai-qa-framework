import { test, expect } from '@playwright/test';
import LoginPage from '../../../pages/loginPage.js';
import InventoryPage from '../../../pages/inventoryPage.js';
import CartPage from '../../../pages/cartPage.js';
import CheckoutPage from '../../../pages/checkoutPage.js';

const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const firstName = 'John';
const lastName = 'Doe';
const postalCode = '12345';

test('User can login, add item to cart, and complete checkout', async ({ page }) => {

  await loginPage.login(validUsername, validPassword, 'Login with valid credentials');
  await inventoryPage.verifyInventoryVisible();
  await inventoryPage.addFirstItemToCart('Add first item to cart');
  await inventoryPage.goToCart('Go to cart');
  await cartPage.verifyCartItemVisible();
  await cartPage.proceedToCheckout('Proceed to checkout');
  await checkoutPage.enterCheckoutInformation(firstName, lastName, postalCode, 'Enter checkout information');
  await checkoutPage.continueCheckout('Continue to checkout');
  await checkoutPage.completeCheckout(firstName, lastName, postalCode, 'Complete checkout');
  await checkoutPage.verifyOrderComplete();
});