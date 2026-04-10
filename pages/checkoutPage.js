import BasePage from './basePage.js';

export default class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    this.firstName = page.getByPlaceholder('First Name1');//intentionally wrong password
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueBtn = page.getByRole('button', { name: /^continue$/i });
    this.finishBtn = page.getByRole('button', { name: /^finish$/i });
    this.cancelBtn = page.getByRole('button', { name: /^cancel$/i });
    this.completeHeader = page.locator('.complete-header');
  }

  async enterCheckoutInformation(firstName, lastName, postalCode, testName) {
    await this.safeFill(this.firstName, firstName, 'firstName', testName);
    await this.safeFill(this.lastName, lastName, 'lastName', testName);
    await this.safeFill(this.postalCode, postalCode, 'postalCode', testName);
  }

  async continueCheckout(testName) {
    await this.safeClick(this.continueBtn, 'continueBtn', testName);
  }

  async finishCheckout(testName) {
    await this.safeClick(this.finishBtn, 'finishBtn', testName);
  }

  async cancelCheckout(testName) {
    await this.safeClick(this.cancelBtn, 'cancelBtn', testName);
  }

  async completeCheckout(firstName, lastName, postalCode, testName) {
    await this.enterCheckoutInformation(firstName, lastName, postalCode, testName);
    await this.continueCheckout(testName);
    await this.finishCheckout(testName);
  }

  async verifyOrderComplete() {
    await this.completeHeader.waitFor({ timeout: 5000 });
  }
}