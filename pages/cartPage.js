import BasePage from './basePage.js';

export default class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.cartItem = page.locator('.cart_item');
    this.checkoutBtn = page.getByRole('button', { name: /checkout/i });
    this.continueShoppingBtn = page.getByRole('button', { name: /continue shopping/i });
    this.removeBtn = page.getByRole('button', { name: /remove/i }).first();
  }

  async verifyCartItemVisible() {
    await this.cartItem.first().waitFor({ timeout: 5000 });
  }

  async proceedToCheckout(testName) {
    await this.safeClick(this.checkoutBtn, 'checkoutBtn', testName);
  }

  async continueShopping(testName) {
    await this.safeClick(this.continueShoppingBtn, 'continueShoppingBtn', testName);
  }

  async removeFirstItem(testName) {
    await this.safeClick(this.removeBtn, 'removeBtn', testName);
  }
}