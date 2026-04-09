import { test, expect } from '@playwright/test';
import LoginPage from '../../pages/loginPage.js';
import InventoryPage from '../../pages/inventoryPage.js';
import CartPage from '../../pages/cartPage.js';
import CheckoutPage from '../../pages/checkoutPage.js';

test('User can login and complete a purchase', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    const testName = 'User can login and complete a purchase';

    await loginPage.login('standard_user', 'secret_sauce', testName);

    await inventoryPage.verifyInventoryVisible();
    await inventoryPage.addFirstItemToCart(testName);
    await inventoryPage.goToCart(testName);

    await cartPage.verifyCartItemVisible();
    await cartPage.proceedToCheckout(testName);

    await checkoutPage.enterCheckoutInformation('John', 'Doe', '12345', testName);
    await checkoutPage.continueCheckout(testName);
    await checkoutPage.finishCheckout(testName);
    await checkoutPage.verifyOrderComplete();
});