import BasePage from './basePage.js';

export default class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password123'); // intentionally wrong for testing
    this.loginBtn = page.getByRole('button', { name: 'Login123' }); // intentionally wrong for testing

    this.inventoryList = page.locator('.inventory_list');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async login(username, password, testName) {
    await this.safeFill(this.username, username, 'username', testName);
    await this.safeFill(this.password, password, 'password', testName);
    await this.safeClick(this.loginBtn, 'loginButton', testName);
  }

  async verifyValidLogin() {
    await this.inventoryList.waitFor({ timeout: 8000 });
  }

  async verifyInvalidLogin() {
    await this.errorMessage.waitFor({ timeout: 8000 });
  }
}