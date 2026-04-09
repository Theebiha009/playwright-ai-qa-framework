import BasePage from './basePage.js';

export default class InventoryPage extends BasePage {
  constructor(page) {
    super(page);

    this.inventoryList = page.locator('.inventory_list');
    this.firstAddToCartBtn = page.getByRole('button', { name: /add to cart/i }).first();
    this.cartIcon = page.locator('.shopping_cart_link');
    this.menuButton = page.getByRole('button', { name: /open menu/i });
    this.logoutLink = page.getByRole('link', { name: /logout/i });
  }

  async verifyInventoryVisible() {
    await this.inventoryList.waitFor({ timeout: 5000 });
  }

  async addFirstItemToCart(testName) {
    await this.safeClick(this.firstAddToCartBtn, 'firstAddToCartBtn', testName);
  }

  async goToCart(testName) {
    await this.safeClick(this.cartIcon, 'cartIcon', testName);
  }

  async logout(testName) {
    await this.safeClick(this.menuButton, 'menuButton', testName);
    await this.safeClick(this.logoutLink, 'logoutLink', testName);
  }
}