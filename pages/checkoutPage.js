import BasePage from './basePage.js';

export default class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');

    this.continueBtn = page.getByRole('button', { name: /^continue$/i });
    this.finishBtn = page.getByRole('button', { name: /^finish$/i });

    this.completeMsg = page.locator('.complete-header');
  }

  async enterCheckoutInformation(first, last, zip, testName) {
    await this.safeFill(
      this.firstName,
      first,
      { name: 'firstName', semantic: 'input' },
      testName
    );

    await this.safeFill(
      this.lastName,
      last,
      { name: 'lastName', semantic: 'input' },
      testName
    );

    await this.safeFill(
      this.postalCode,
      zip,
      { name: 'postalCode', semantic: 'input' },
      testName
    );
  }

  async continueCheckout(testName) {
    await this.safeClick(
      this.continueBtn,
      { name: 'continueBtn', semantic: 'button' },
      testName
    );
  }

  async finishCheckout(testName) {
    await this.safeClick(
      this.finishBtn,
      { name: 'finishBtn', semantic: 'button' },
      testName
    );
  }

  async completeCheckout(first, last, zip, testName) {
    await this.enterCheckoutInformation(first, last, zip, testName);
    await this.continueCheckout(testName);
    await this.finishCheckout(testName);
  }

  async verifyOrderComplete() {
    await this.completeMsg.waitFor({ state: 'visible' });
  }
}