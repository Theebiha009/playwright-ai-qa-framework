import BasePage from './basePage.js';

export default class InventoryPage extends BasePage {
  constructor(page) {
    super(page);

    this.inventoryList = page.locator('.inventory_list');
    this.addToCartBtn = page.locator('.inventory_item button').first();
    this.cartIcon = page.locator('.shopping_cart_link');
  }

  async verifyInventoryVisible() {
    await this.inventoryList.waitFor({ state: 'visible' });
  }

  async addFirstItemToCart(testName) {
    await this.safeClick(
      this.addToCartBtn,
      { name: 'addToCart', semantic: 'button' },
      testName
    );
  }

  async goToCart(testName) {
    await this.safeClick(
      this.cartIcon,
      { name: 'cartIcon', semantic: 'link' },
      testName
    );
  }
}