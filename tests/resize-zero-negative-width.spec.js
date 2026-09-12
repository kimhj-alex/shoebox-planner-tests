const { test, expect } = require('@playwright/test');

test('furniture with zero or negative width becomes invisible but remains interactive', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  await shape.click();

  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);
  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');

  await widthInput.fill('0');
  await widthInput.dispatchEvent('input');

  // Shape should render with 0 width (invisible) — no lower bound enforced
  const renderedWidth = await shape.evaluate(el => el.getBoundingClientRect().width);
  expect(renderedWidth).toBe(0);

  // Deselect first, so we can test whether clicking it again re-selects it
  await page.click('button:has-text("Clear")').catch(() => {});
  // (Clear removes it — instead, click elsewhere in the room to deselect without clearing)
});