import { test, expect } from '@playwright/test';

test('webapp load snapshot', async ({ page }) => {
  // validate the test page loads as expected to the saved snapshot
  await page.goto('/');
  await expect(page).toHaveScreenshot();
});

test('chat interation', async ({ page }) => {
  await page.goto('/');

  // expect there to be at least 3 default question buttons on page load
  const defaultQuestions = page.locator('.defaults__button');

  const chatInput = page.locator('.chatbox__input');
  const firstQuestionButton = defaultQuestions.nth(0);
  const firstQuestionText = ((await firstQuestionButton.textContent()) ?? '').replace('Ask now', '').trim();

  // should not have any text at the start
  await test.step('Use default question', async () => {
    await expect(chatInput).toHaveValue('');

    await firstQuestionButton.click();
    await expect(chatInput).toHaveValue(firstQuestionText);
  });

  const userMessage = page.locator('.chat__txt.user-message');

  // Set to replay the response for a local route (will not be used for the official)
  await page.routeFromHAR('./tests/hars/default-chat-response.har', {
    url: '/chat',
    update: false,
  });

  const showThoughtProcess = page.getByTestId('chat__show-thought-process');
  await test.step('Get answer', async () => {
    await expect(showThoughtProcess).not.toBeVisible();

    await page.locator('.chatbox__button').click();

    await expect(showThoughtProcess).not.toBeEnabled();

    // wait for the thought process button to be enabled.
    await expect(showThoughtProcess).toBeEnabled({ timeout: 30_000 });

    await expect(userMessage).toHaveCount(1);
    await expect(userMessage.nth(0)).toHaveText(firstQuestionText);

    await expect(defaultQuestions).toHaveCount(0);
  });

  await test.step('Reset chat', async () => {
    await page.getByTestId('chat__reset--button').click();
    await expect(userMessage).toHaveCount(0);
    await expect(defaultQuestions).toHaveCount(3);
  });
});

test('show thought process', async ({ page }) => {
  await page.goto('/');

  // expect there to be at least 3 default question buttons on page load
  const defaultQuestions = page.locator('.defaults__button');
  const firstQuestionButton = defaultQuestions.nth(0);
  await firstQuestionButton.click();

  // Set to replay the response for a local route (will not be used for the official)
  await page.routeFromHAR('./tests/hars/default-chat-response.har', {
    url: '/chat',
    update: false,
  });

  const showThoughtProcess = page.getByTestId('chat__show-thought-process');
  await page.locator('.chatbox__button').click();
  // wait for the thought process button to be enabled.
  await expect(showThoughtProcess).toBeEnabled({ timeout: 30_000 });
  const thoughtProcessAside = page.getByTestId('aside-thought-process');

  await test.step('show/hide aside', async () => {
    await expect(thoughtProcessAside).not.toBeVisible();
    await showThoughtProcess.click();
    await expect(thoughtProcessAside).toBeVisible();

    await page.getByTestId('chat__hide-thought-process').click();
    await expect(thoughtProcessAside).not.toBeVisible();
  });

  await test.step('Reset chat', async () => {
    await showThoughtProcess.click();
    await expect(thoughtProcessAside).toBeVisible();
    await page.getByTestId('chat__reset--button').click();
    await expect(thoughtProcessAside).not.toBeVisible();
  });
});
