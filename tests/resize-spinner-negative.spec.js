const { test, expect } = require('@playwright/test');

test('decrementing width below zero via arrow key makes shape invisible', async ({ page }) => {
  test.setTimeout(180000); // generous — this interaction is slow through Playwright specifically,
                            // likely due to per-keystroke history-saving overhead the app wasn't
                            // designed around; a human using the same spinner sees no such delay

  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();

  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);
  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');

  await widthInput.click();
  const startingWidth = parseFloat(await widthInput.inputValue());

  const pressesNeeded = Math.round(startingWidth) + 5;
  for (let i = 0; i < pressesNeeded; i++) {
    await widthInput.press('ArrowDown');
  }

  const finalValue = parseFloat(await widthInput.inputValue());
  const renderedWidth = await shape.evaluate(el => el.getBoundingClientRect().width);

  // Confirmed: arrow-key decrement genuinely applies negative values, unlike direct typing
  expect(finalValue).toBeLessThan(0);
  expect(renderedWidth).toBe(0);
});