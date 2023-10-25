import { test, expect } from '@playwright/test';

test.describe('default', () => {
  test('webapp load snapshot', async ({ page }) => {
    // validate the test page loads as expected to the saved snapshot
    await page.goto('/');
    await expect(page).toHaveScreenshot();
  });

  test('chat interation', async ({ page }) => {
    await page.goto('/');

    const defaultQuestions = page.locator('.defaults__button');

    // expect there to be at least 3 default question buttons on page load
    await test.step('Get default questions', async () => {
      await expect(defaultQuestions).toHaveCount(3);
    });

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
    await page.routeFromHAR('./tests/hars/default-chat-response-stream.har', {
      url: '/chat',
      update: false,
    });

    const showThoughtProcess = page.getByTestId('chat__show-thought-process');
    await test.step('Get answer', async () => {
      await expect(showThoughtProcess).not.toBeVisible();

      await page.locator('.chatbox__button').click();

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

  test('waiting for response', async ({ page }) => {
    await page.goto('/');
    await page.locator('.defaults__button').nth(0).click();

    await page.route('/chat', (route) =>
      route.fulfill({
        status: -1,
      }),
    );

    await expect(page.locator('.loading-skeleton')).not.toBeVisible();
    await page.locator('.chatbox__button').click();
    await expect(page.locator('.loading-skeleton')).toBeVisible();
    await expect(page.locator('.chatbox__input')).not.toBeEnabled();
  });
});

test.describe('generate answer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.defaults__button').nth(0).click();

    await page.routeFromHAR('./tests/hars/default-chat-response-stream.har', {
      url: '/chat',
      update: false,
    });

    await page.locator('.chatbox__button').click();
    // wait for the thought process button to be enabled.
    await expect(page.getByTestId('chat__show-thought-process')).toBeEnabled({ timeout: 30_000 });
  });

  test('show thought process', async ({ page }) => {
    const showThoughtProcess = page.getByTestId('chat__show-thought-process');
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

  test('response formatting', async ({ page }) => {
    await expect(page.locator('.items__listItem--step')).not.toHaveCount(0);
    await expect(page).toHaveScreenshot({ clip: { x: 0, y: 0, width: 1000, height: 1000 } });
  });

  test('citation', async ({ page }) => {
    const citations = page.getByTestId('citation');
    await expect(citations).toHaveCount(1);

    await expect(citations.nth(0)).toBeEnabled();
    await expect(citations.nth(0)).toContainText('support.md');
    expect(await citations.nth(0).getAttribute('href')).toContain('/content/support.md');
  });
});

test.describe('developer settings', () => {
  test('default settings', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button__developer-settings').click();

    await expect(page.getByLabel('Override prompt template')).toBeVisible();
    await expect(page.getByLabel('Retrieve this many search results:')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Use semantic ranker' }).locator('i')).toBeChecked();
    await expect(page.locator('label').filter({ hasText: 'contextual summaries' }).locator('i')).not.toBeChecked();
    await expect(page.locator('label').filter({ hasText: 'follow-up questions' }).locator('i')).toBeChecked();
    await expect(page.locator('label').filter({ hasText: 'Stream chat' }).locator('i')).toBeChecked();
    await expect(page.getByText('Vectors + Text (Hybrid)')).toBeVisible();
  });

  test('handle no stream parsing', async ({ page }) => {
    await page.goto('/');
    await page.locator('.defaults__button').nth(0).click();

    await page.routeFromHAR('./tests/hars/default-chat-response-nostream.har', {
      url: '/chat',
      update: false,
    });

    await page.getByTestId('button__developer-settings').click();
    const streamSetting = page.locator('label').filter({ hasText: 'Stream chat' }).locator('i');

    await expect(streamSetting).toBeChecked();
    await streamSetting.click();
    await expect(streamSetting).not.toBeChecked();

    await page.locator('button').filter({ hasText: 'Close' }).click();

    await page.locator('.chatbox__button').click();
    // wait for the thought process button to be enabled.
    await expect(page.getByTestId('chat__show-thought-process')).toBeEnabled({ timeout: 30_000 });

    await expect(page.locator('.items__listItem--step')).not.toHaveCount(0);
  });
});
