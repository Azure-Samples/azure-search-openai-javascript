import { test, expect } from '@playwright/test';

test('default questions', async ({ page }) => {
  await page.goto('/');

  // expect there to be at least 3 default question buttons on page load
  const defaultQuestions = page.locator('.defaults__button');
  await test.step('Has default questions', async () => {
    await expect(defaultQuestions).toHaveCount(3);
  });

  const chatInput = page.locator('.chatbox__input');
  const firstQuestionButton = defaultQuestions.nth(0);
  const firstQuestionText = ((await firstQuestionButton.textContent()) ?? '').replace('Ask now', '').trim();

  // should not have any text at the start
  await test.step('Populate chat input with default question', async () => {
    await expect(chatInput).toHaveValue('');

    await firstQuestionButton.click();
    await expect(chatInput).toHaveValue(firstQuestionText);
  });

  const userMessage = page.locator('.chat__txt.user-message');

  await test.step('Chat interaction', async () => {
    await page.locator('.chatbox__button').click();

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
