export function getLocator(page, step) {
  switch (step.locatorType) {
    case 'role':
      return page.getByRole(step.role, { name: step.name });

    case 'label':
      return page.getByLabel(step.label);

    case 'placeholder':
      return page.getByPlaceholder(step.placeholder);

    case 'text':
      return page.getByText(step.text);

    case 'css':
      return page.locator(step.selector);

    default:
      throw new Error(`Unknown locator type: ${step.locatorType}`);
  }
}

export function buildLocatorKey(pageName, elementName, actionType = 'action') {
  return `${pageName}_${elementName}_${actionType}`;
}