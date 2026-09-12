const { test } = require('@playwright/test');

test('debug: check starting width value', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  await page.click('button:has-text("Add Square")');
  const shape = page.locator('.furniture').last();

  const shapeId = await shape.getAttribute('data-id');
  const sidebarEntry = page.locator(`.item-entry[data-id="${shapeId}"]`);
  const widthInput = sidebarEntry.locator('.dimension-row .input-row').first().locator('input');

  const rawValue = await widthInput.inputValue();
  console.log('Raw input value:', JSON.stringify(rawValue));
  console.log('Parsed as float:', parseFloat(rawValue));

  await widthInput.click();
  await widthInput.press('ArrowDown');
  const afterOnePress = await widthInput.inputValue();
  console.log('After one ArrowDown press:', JSON.stringify(afterOnePress));
});