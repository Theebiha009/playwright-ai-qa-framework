import BasePage from './basePage.js';

export default class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.cartItem = page.locator('.cart_item');
    this.checkoutBtn = page.getByRole('button', { name: 'Checkout' });
    this.removeBtn = page.getByRole('button', { name: /remove/i }).first();
  }

  async verifyCartItemVisible() {
    await this.cartItem.first().waitFor({ state: 'visible' });
  }

  async proceedToCheckout(testName) {
    await this.safeClick(
      this.checkoutBtn,
      { name: 'checkoutBtn', semantic: 'button' },
      testName
    );
  }

  async removeFirstItem(testName) {
    await this.safeClick(
      this.removeBtn,
      { name: 'removeBtn', semantic: 'button' },
      testName
    );
  }
}