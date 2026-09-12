const { test, expect } = require('@playwright/test');

test('RP-002: clicking sidebar item does not highlight furniture on desktop (known bug)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  await page.click('button:has-text("Clear")');

  // Add a square so we have something to click
  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  // Click the sidebar item (not the furniture itself)
  await sidebarEntry.click();

  // RP-002: furniture should NOT get the "selected" class — this documents the known bug
  await expect(shape).not.toHaveClass(/selected/);
});

test('canvas → sidebar highlight works correctly (confirms working direction)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  // Click the furniture on canvas
  await shape.click();

  // This direction is confirmed working — sidebar entry should get "selected"
  await expect(sidebarEntry).toHaveClass(/selected/);
});