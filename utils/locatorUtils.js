export function getLocator(page, step) {
  switch (step.locatorType) {
    case 'role':
      return step.name
        ? page.getByRole(step.role, { name: step.name })
        : page.getByRole(step.role);

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