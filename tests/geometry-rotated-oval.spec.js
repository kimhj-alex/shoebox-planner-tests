const { test, expect } = require('@playwright/test');

test('rotated oval (40°) clamps to room wall when dragged past it', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');

  await page.click('button:has-text("Clear")');

  const room = page.locator('#room');

  // Add a circle, resize into an oval, then rotate it
  await page.click('button:has-text("Add Circle")');
  const shape = page.locator('.furniture').last();

  await shape.click();
  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);

  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');
  const heightInput = sidebarEntry.locator('.dimension-row .input-row').nth(1).locator('input');
  const rotateInput = sidebarEntry.locator('.rotate-row input');

  await widthInput.fill('160');
  await widthInput.dispatchEvent('input');
  await heightInput.fill('80');
  await heightInput.dispatchEvent('input');
  await rotateInput.fill('40');
  await rotateInput.dispatchEvent('input');

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

  // Computes the true ellipse bounding box, same formula the app itself uses internally,
  // applied to the shape's actual final rendered center/rotation.
  // (A plain getBoundingClientRect() would measure the invisible rotated rectangular div,
  // not the visible ellipse — that mismatch is exactly what the original ellipse-math
  // case study covers, just showing up here as a testing gap instead of an app bug.)
  async function getEllipseGapFromWall(wall) {
    const roomRect = await room.evaluate(el => el.getBoundingClientRect());

    const state = await shape.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        width: parseFloat(el.dataset.width),
        height: parseFloat(el.dataset.height),
        rotation: parseFloat(el.dataset.rotation),
      };
    });

    const angle = state.rotation * Math.PI / 180;
    const rx = state.width / 2;
    const ry = state.height / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const aabbW = 2 * Math.sqrt((rx * cos) ** 2 + (ry * sin) ** 2);
    const aabbH = 2 * Math.sqrt((rx * sin) ** 2 + (ry * cos) ** 2);

    const minX = state.centerX - aabbW / 2;
    const maxX = state.centerX + aabbW / 2;
    const minY = state.centerY - aabbH / 2;
    const maxY = state.centerY + aabbH / 2;

    switch (wall) {
      case 'top':    return minY - roomRect.top;
      case 'bottom': return roomRect.bottom - maxY;
      case 'left':   return minX - roomRect.left;
      case 'right':  return roomRect.right - maxX;
    }
  }

  // Baseline confirmed via Chromium: top/bottom ~1.83px, left/right ~1.20px
  await dragShapeToWall('top');
  expect(await getEllipseGapFromWall('top')).toBeCloseTo(1.83, 0.3);

  await dragShapeToWall('bottom');
  expect(await getEllipseGapFromWall('bottom')).toBeCloseTo(1.83, 0.3);

  await dragShapeToWall('left');
  expect(await getEllipseGapFromWall('left')).toBeCloseTo(1.20, 0.3);

  await dragShapeToWall('right');
  expect(await getEllipseGapFromWall('right')).toBeCloseTo(1.20, 0.3);
});