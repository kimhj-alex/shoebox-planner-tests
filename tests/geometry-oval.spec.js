const { test, expect } = require('@playwright/test');

test('oval clamps to room wall when dragged past it', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  await page.click('button:has-text("Clear")');

  const room = page.locator('#room');

  // Add a circle, then resize it into an oval (160 wide x 80 tall)
  await page.click('button:has-text("Add Circle")');
  const shape = page.locator('.furniture').last();

  await shape.click();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');
  const heightInput = sidebarEntry.locator('.dimension-row .input-row').nth(1).locator('input');

  await widthInput.fill('160');
  await widthInput.dispatchEvent('input');
  await heightInput.fill('80');
  await heightInput.dispatchEvent('input');

  async function dragShapeToWall(wall) {
    const shapeBox = await shape.boundingBox();
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

  async function getGapFromWall(wall) {
    const shapeRect = await shape.evaluate(el => el.getBoundingClientRect());
    const roomRect = await room.evaluate(el => el.getBoundingClientRect());

    switch (wall) {
      case 'top':    return shapeRect.top - roomRect.top;
      case 'bottom': return roomRect.bottom - shapeRect.bottom;
      case 'left':   return shapeRect.left - roomRect.left;
      case 'right':  return roomRect.right - shapeRect.right;
    }
  }

  // Baseline confirmed via Chromium: ~1.99px on all four edges
  // Same as rectangle — with rotation at 0°, this shape doesn't trigger the app's
  // ellipse-specific math (isOval requires angle !== 0), so it shares rectangle's code path
  await dragShapeToWall('top');
  expect(await getGapFromWall('top')).toBeCloseTo(2, 0.3);

  await dragShapeToWall('bottom');
  expect(await getGapFromWall('bottom')).toBeCloseTo(2, 0.3);

  await dragShapeToWall('left');
  expect(await getGapFromWall('left')).toBeCloseTo(2, 0.3);

  await dragShapeToWall('right');
  expect(await getGapFromWall('right')).toBeCloseTo(2, 0.3);
});