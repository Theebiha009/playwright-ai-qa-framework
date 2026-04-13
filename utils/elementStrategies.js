export const ELEMENT_STRATEGIES = {
  username: {
    semantic: 'input',
    fallback: [
      { locatorType: 'placeholder', placeholder: 'Username' },
      { locatorType: 'css', selector: "input[name='user-name']" }
    ]
  },

  password: {
    semantic: 'input',
    fallback: [
      { locatorType: 'placeholder', placeholder: 'Password' },
      { locatorType: 'css', selector: "input[type='password']" }
    ]
  },

  loginButton: {
    semantic: 'button',
    fallback: [
      { locatorType: 'role', role: 'button', name: 'Login' },
      { locatorType: 'text', text: 'Login' },
      { locatorType: 'css', selector: "input[type='submit']" }
    ]
  },

  firstName: {
    semantic: 'input',
    fallback: [
      { locatorType: 'placeholder', placeholder: 'First Name' }
    ]
  },

  lastName: {
    semantic: 'input',
    fallback: [
      { locatorType: 'placeholder', placeholder: 'Last Name' }
    ]
  },

  postalCode: {
    semantic: 'input',
    fallback: [
      { locatorType: 'placeholder', placeholder: 'Zip/Postal Code' }
    ]
  },

  continueBtn: {
    semantic: 'button',
    fallback: [
      { locatorType: 'role', role: 'button', name: 'Continue' },
      { locatorType: 'text', text: 'Continue' }
    ]
  },

  finishBtn: {
    semantic: 'button',
    fallback: [
      { locatorType: 'role', role: 'button', name: 'Finish' },
      { locatorType: 'text', text: 'Finish' }
    ]
  },

  checkoutBtn: {
    semantic: 'button',
    fallback: [
      { locatorType: 'role', role: 'button', name: 'Checkout' },
      { locatorType: 'text', text: 'Checkout' }
    ]
  }
};