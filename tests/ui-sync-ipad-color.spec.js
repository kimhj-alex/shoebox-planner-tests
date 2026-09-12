const { test, expect, devices } = require('@playwright/test');

test.use({ ...devices['iPad Pro'], hasTouch: true });

test('RP-007: tapping a color swatch does not change furniture color on iPad (known bug)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  const colorBefore = await shape.evaluate(el => el.dataset.color);

  // Tap the first color swatch in this item's panel
  const swatch = sidebarEntry.locator('.color-swatch').first();
  await swatch.tap();

  const colorAfter = await shape.evaluate(el => el.dataset.color);

  // RP-007: color should NOT have changed — this documents the known bug
  expect(colorAfter).toBe(colorBefore);
});