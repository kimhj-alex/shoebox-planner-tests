const { test, expect, devices } = require('@playwright/test');

test.use({ ...devices['iPad Pro'], hasTouch: true });

test('iPad: tapping furniture highlights sidebar item (confirms working)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  await shape.tap();

  await expect(sidebarEntry).toHaveClass(/selected/);
});

test('iPad: tapping sidebar item highlights furniture (confirms working)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  await sidebarEntry.tap();

  await expect(shape).toHaveClass(/selected/);
});