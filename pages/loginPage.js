import BasePage from './basePage.js';

export default class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password123');

    // intentionally wrong to test AI
    this.loginBtn = page.getByRole('button', { name: 'Login123' });
  }

  async login(username, password, testName) {
    await this.safeFill(this.username, username, 'username', testName);
    await this.safeFill(this.password, password, 'password', testName);

    await this.safeClick(this.loginBtn, 'loginButton', testName);
  }
}