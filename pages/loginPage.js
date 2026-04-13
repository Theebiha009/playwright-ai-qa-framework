import BasePage from './basePage.js';

export default class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.username = page.getByPlaceholder('Username123'); // intentionally wrong for testing
    this.password = page.getByPlaceholder('Password123'); // intentionally wrong for testing
    this.loginBtn = page.getByRole('button', { name: 'Login123' }); // intentionally wrong for testing
  }

  async login(username, password, testName) {
    await this.safeFill(
      this.username,
      username,
      { name: 'username', semantic: 'input' },
      testName
    );

    await this.safeFill(
      this.password,
      password,
      { name: 'password', semantic: 'input' },
      testName
    );

    await this.safeClick(
      this.loginBtn,
      { name: 'loginButton', semantic: 'button' },
      testName
    );
  }
}