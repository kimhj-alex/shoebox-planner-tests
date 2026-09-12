const { test, expect } = require('@playwright/test');

test('square clamps to room wall when dragged past it', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  // Add a square
  await page.click('button:has-text("Add Square")');

  const shape = page.locator('.furniture').last();
  const shapeBox = await shape.boundingBox();

  const room = page.locator('#room');
  const roomBox = await room.boundingBox();

  // Drag the shape from its center to well beyond the room's bottom-right corner
  await page.mouse.move(shapeBox.x + shapeBox.width / 2, shapeBox.y + shapeBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(roomBox.x + roomBox.width + 500, roomBox.y + roomBox.height + 500, { steps: 10 });
  await page.mouse.up();

  // Read the room's actual cm dimensions from the page's JS variables
  const roomWidthCm = await page.evaluate(() => roomWidthCm);
  const roomHeightCm = await page.evaluate(() => roomHeightCm);

  // Read the shape's final position/size (in the same cm-based units the app uses internally)
  const finalPos = await shape.evaluate(el => ({
    left: parseFloat(el.style.left),
    top: parseFloat(el.style.top),
    width: parseFloat(el.dataset.width),
    height: parseFloat(el.dataset.height),
  }));

  const buffer = 4; // matches the app's own clamping buffer we saw in the source

  // The shape's right/bottom edge should never exceed the room wall minus buffer
  expect(finalPos.left + finalPos.width).toBeLessThanOrEqual(roomWidthCm - buffer + 1);
  expect(finalPos.top + finalPos.height).toBeLessThanOrEqual(roomHeightCm - buffer + 1);

  // And it shouldn't have been pushed to a negative position either
  expect(finalPos.left).toBeGreaterThanOrEqual(0);
  expect(finalPos.top).toBeGreaterThanOrEqual(0);
});