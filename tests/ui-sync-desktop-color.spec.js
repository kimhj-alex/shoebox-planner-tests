const { test, expect } = require('@playwright/test');

test('desktop: clicking a color swatch changes furniture color (confirms working)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  const colorBefore = await shape.evaluate(el => el.dataset.color);

  const swatch = sidebarEntry.locator('.color-swatch').first();
  await swatch.click();

  const colorAfter = await shape.evaluate(el => el.dataset.color);

  expect(colorAfter).not.toBe(colorBefore);
});