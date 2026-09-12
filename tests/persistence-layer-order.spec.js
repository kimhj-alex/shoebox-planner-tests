const { test, expect } = require('@playwright/test');

test('RP-004: layer order reverses on save/reload', async ({ page }) => {
  await page.goto('https://shoebox-planner.web.app/planner.html');
  await page.click('button:has-text("Clear")');

  // Add three squares — sidebar order = layer order
  await page.click('button:has-text("Add Square")');
  await page.click('button:has-text("Add Square")');
  await page.click('button:has-text("Add Square")');

  const namesBefore = await page.locator('.item-entry .name-input').evaluateAll(
    inputs => inputs.map(el => el.value)
  );

  // Save the room
  page.once('dialog', dialog => dialog.accept()); // handles the alert("Room saved...")
  await page.click('button:has-text("Save")');

  // Navigate to saved rooms list, reopen the most recent room
  await page.goto('https://shoebox-planner.web.app/saved.html');
  const roomCard = page.locator('.room-card').first();
  await roomCard.click();

  await page.waitForSelector('.item-entry');

  const namesAfter = await page.locator('.item-entry .name-input').evaluateAll(
    inputs => inputs.map(el => el.value)
  );

  // RP-004: order should be reversed, not preserved
  expect(namesAfter).toEqual([...namesBefore].reverse());
});