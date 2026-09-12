const { test, expect } = require('@playwright/test');

test('square vs oval wall behavior matches known baseline (2px offset pattern)', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  // Ensure a clean, known starting state across all browsers
  await page.click('button:has-text("Clear")');

  const room = page.locator('#room');

  async function dragShapeToWall(shapeLocator, wall) {
    const shapeBox = await shapeLocator.boundingBox();
    const roomBox = await room.boundingBox();

    const targets = {
      top:    { x: roomBox.x + roomBox.width / 2, y: roomBox.y - 500 },
      bottom: { x: roomBox.x + roomBox.width / 2, y: roomBox.y + roomBox.height + 500 },
      left:   { x: roomBox.x - 500, y: roomBox.y + roomBox.height / 2 },
      right:  { x: roomBox.x + roomBox.width + 500, y: roomBox.y + roomBox.height / 2 },
    };

    await page.mouse.move(shapeBox.x + shapeBox.width / 2, shapeBox.y + shapeBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targets[wall].x, targets[wall].y, { steps: 10 });
    await page.mouse.up();
  }

  async function getGapFromWall(shapeLocator, wall) {
    const shapeRect = await shapeLocator.evaluate(el => el.getBoundingClientRect());
    const roomRect = await room.evaluate(el => el.getBoundingClientRect());

    switch (wall) {
      case 'top':    return shapeRect.top - roomRect.top;
      case 'bottom': return roomRect.bottom - shapeRect.bottom;
      case 'left':   return shapeRect.left - roomRect.left;
      case 'right':  return roomRect.right - shapeRect.right;
    }
  }

  // Square: known baseline is ~2px off top, ~2px off bottom — left/right still unconfirmed
  await page.click('button:has-text("Add Square")');
  const square = page.locator('.furniture').last();

  await dragShapeToWall(square, 'top');
  expect(await getGapFromWall(square, 'top')).toBeCloseTo(2, 0.5);

  await dragShapeToWall(square, 'bottom');
  expect(await getGapFromWall(square, 'bottom')).toBeCloseTo(2, 0.5);

  await dragShapeToWall(square, 'left');
  expect(await getGapFromWall(square, 'left')).toBeCloseTo(2, 0.5);

  await dragShapeToWall(square, 'right');
  expect(await getGapFromWall(square, 'right')).toBeCloseTo(2, 0.5);
});
