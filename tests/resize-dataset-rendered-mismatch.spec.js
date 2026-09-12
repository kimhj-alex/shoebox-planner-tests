const { test, expect } = require('@playwright/test');

test('negative width: dataset value and rendered width diverge', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  await shape.click();

  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);
  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');

  await widthInput.fill('-20');
  await widthInput.dispatchEvent('input');

  const state = await shape.evaluate(el => ({
    datasetWidth: parseFloat(el.dataset.width),
    renderedWidth: el.getBoundingClientRect().width,
  }));

  // dataset.width should still literally store -20 (no validation applied)
  expect(state.datasetWidth).toBe(-20);

  // but the actual rendered width should be 0, since CSS can't render a negative width
  expect(state.renderedWidth).toBe(0);
});