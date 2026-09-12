const { test, expect } = require('@playwright/test');

test('furniture can be resized far beyond room size, but stays clamped inside the wall', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();
  await shape.click();

  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);
  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');
  const heightInput = sidebarEntry.locator('.dimension-row .input-row').nth(1).locator('input');

  await widthInput.fill('99999');
  await widthInput.dispatchEvent('input');
  await heightInput.fill('99999');
  await heightInput.dispatchEvent('input');

  // No upper bound on the raw dimension itself
  const storedWidth = await shape.evaluate(el => parseFloat(el.dataset.width));
  expect(storedWidth).toBe(99999);

  // But the shape's actual rendered position should still be clamped inside the room
  const room = page.locator('#room');
  const shapeRect = await shape.evaluate(el => el.getBoundingClientRect());
  const roomRect = await room.evaluate(el => el.getBoundingClientRect());

  // The shape may be far bigger than the room, but its rendered box shouldn't
  // extend meaningfully past the room's own bounds due to the app's clamping logic
  expect(shapeRect.left).toBeGreaterThanOrEqual(roomRect.left - 5);
  expect(shapeRect.top).toBeGreaterThanOrEqual(roomRect.top - 5);
});