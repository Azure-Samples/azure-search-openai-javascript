import { test, expect } from '@playwright/test';

test.describe('default', () => {
  test('chat interation', async ({ page }) => {
    await page.goto('/');

    const defaultQuestions = page.getByTestId('default-question');

    // expect there to be at least 3 default question buttons on page load
    await test.step('Get default questions', async () => {
      await expect(defaultQuestions).toHaveCount(3);
    });

    const chatInput = page.getByTestId('question-input');
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
    await page.routeFromHAR('./tests/e2e/hars/default-chat-response-stream.har', {
      url: '/chat',
      update: false,
      updateContent: 'embed',
    });

    const showThoughtProcess = page.getByTestId('chat-show-thought-process');
    await test.step('Get answer', async () => {
      await expect(showThoughtProcess).not.toBeVisible();

      await page.getByTestId('submit-question-button').click();

      // wait for the thought process button to be enabled.
      await expect(showThoughtProcess).toBeEnabled({ timeout: 30_000 });

      await expect(userMessage).toHaveCount(1);
      await expect(userMessage.nth(0)).toHaveText(firstQuestionText);

      await expect(defaultQuestions).toHaveCount(0);
    });

    // make sure the response is formatted as list items
    await test.step('response formatting', async () => {
      await expect(page.locator('.items__listItem--step')).not.toHaveCount(0);
    });

    await test.step('Reset chat', async () => {
      await page.getByTestId('chat-reset-button').click();
      await expect(userMessage).toHaveCount(0);
      await expect(defaultQuestions).toHaveCount(3);
    });
  });

  test('ask interaction', async ({ page }) => {
    await page.goto('/');
    const chatLink = page.getByRole('link', { name: 'Chat' });
    const askLink = page.getByRole('link', { name: 'Ask a question' });

    await expect(chatLink).toHaveAttribute('aria-current', 'page');
    await expect(askLink).not.toHaveAttribute('aria-current');
    await askLink.click();
    await expect(chatLink).not.toHaveAttribute('aria-current');
    await expect(askLink).toHaveAttribute('aria-current', 'page');

    const defaultQuestions = page.getByTestId('default-question');

    // expect there to be at least 3 default question buttons on page load
    await test.step('Get default questions', async () => {
      await expect(defaultQuestions).toHaveCount(3);
    });

    const chatInput = page.getByTestId('question-input');
    const firstQuestionButton = defaultQuestions.nth(0);
    const firstQuestionText = ((await firstQuestionButton.textContent()) ?? '').replace('Ask now', '').trim();

    // should not have any text at the start
    await test.step('Use default question', async () => {
      await expect(chatInput).toHaveValue('');

      await firstQuestionButton.click();
      await expect(chatInput).toHaveValue(firstQuestionText);
    });

    // Set to replay the response for a local route (will not be used for the official)
    await page.routeFromHAR('./tests/e2e/hars/default-ask-response.har', {
      url: '/ask',
      update: false,
      updateContent: 'embed',
    });

    const showThoughtProcess = page.getByTestId('chat-show-thought-process');
    await test.step('Get answer', async () => {
      await expect(showThoughtProcess).not.toBeVisible();

      await page.getByTestId('submit-question-button').click();

      // wait for the thought process button to be enabled.
      await expect(showThoughtProcess).toBeEnabled({ timeout: 30_000 });

      // expect some response
      await expect(page.locator('.chat__txt--entry')).not.toHaveText('');
      await expect(defaultQuestions).toHaveCount(0);

      // make sure chat history is not available for ask interaction mode
      await expect(page.getByTestId('chat-history-button')).not.toBeVisible();
    });

    await test.step('Reset chat', async () => {
      await page.getByTestId('chat-reset-button').click();
      await expect(page.locator('.chat__txt--entry')).not.toBeVisible();
      await expect(defaultQuestions).toHaveCount(3);
    });
  });

  test('waiting for response', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    await page.route('/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      route.fulfill({
        status: 200,
      });
    });

    await expect(page.getByTestId('loading-indicator')).not.toBeVisible();
    await page.getByTestId('submit-question-button').click();
    await expect(page.getByTestId('loading-indicator')).toBeVisible();
    await expect(page.getByTestId('question-input')).not.toBeEnabled();
  });

  test('chat history', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    await page.routeFromHAR('./tests/e2e/hars/default-chat-response-stream.har', {
      url: '/chat',
      update: false,
      updateContent: 'embed',
    });

    await page.getByTestId('submit-question-button').click();
    // wait for the thought process button to be enabled.
    await expect(page.getByTestId('chat-show-thought-process')).toBeEnabled({ timeout: 30_000 });

    // make sure chat history is available for chat interaction mode
    await expect(page.getByTestId('chat-history-button')).toBeVisible();

    await test.step('new chat history', async () => {
      await expect(page.locator('.chat-history__container')).not.toBeVisible();
      await expect(page.getByTestId('chat-history-button')).toHaveText('Show Chat History');

      await page.getByTestId('chat-history-button').click();

      await expect(page.getByTestId('chat-history-button')).toHaveText('Hide Chat History');
      await expect(page.locator('.chat-history__container')).toBeVisible();

      // no history in the past yet
      const chatHistory = page.locator('.chat-history__container .chat__listItem');
      await expect(chatHistory).toHaveCount(0);
    });

    const currentChat = page.locator('.chat__txt--entry').nth(-1);
    const lastChatText = await currentChat.textContent();

    const currentUserMessage = page.locator('.chat__txt.user-message').nth(-1);
    const lastChatUserMessageText = await currentUserMessage.textContent();

    await test.step('chat history after chat', async () => {
      // ask another question to get a new thread
      await page.goto('/');
      await page.getByTestId('question-input').fill(`testing chat history`);

      await page.getByTestId('submit-question-button').click();
      // wait for the thought process button to be enabled.
      await expect(page.getByTestId('chat-show-thought-process')).toBeEnabled({ timeout: 30_000 });

      await page.getByTestId('chat-history-button').click();

      // should show the last two last conversation
      const chatHistory = page.locator('.chat-history__container .chat__listItem');
      await expect(chatHistory).toHaveCount(2);

      // check that the last session's chat matches in the one in chat history
      // which is different from current session's chat
      const previousChatUserMessage = chatHistory.nth(0).locator('.chat__txt.user-message').nth(-1);
      await expect(currentUserMessage).not.toHaveText(lastChatUserMessageText!);
      await expect(previousChatUserMessage).toHaveText(lastChatUserMessageText!);

      const previousChatLastItem = chatHistory.nth(-1).locator('.chat__txt--entry').nth(-1);
      await expect(currentChat).not.toHaveText(lastChatText!);
      await expect(previousChatLastItem).toHaveText(lastChatText!);
    });
  });
});

test.describe('errors', () => {
  test('stream: on server failure', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    const internalServerError = {
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server error',
      }),
    };

    await page.route('/chat', (route) => route.fulfill(internalServerError));
    await page.route('**/chat', (route) => route.fulfill(internalServerError));

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible();

    // make sure it's the generic message
    await expect(page.locator('.chat__txt.error')).toContainText('Sorry, we are having some problems.');
  });

  test('stream: on bad request', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    const badRequest = {
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        statusCode: 400,
        error: 'Bad request',
        code: 'content_filter',
        message: 'Content filtered',
      }),
    };

    await page.route('/chat', (route) => route.fulfill(badRequest));
    await page.route('**/chat', (route) => route.fulfill(badRequest));

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible();
    // make sure it's the user error message
    await expect(page.locator('.chat__txt.error')).toContainText('Please modify your question and try again');
  });

  test('stream: content filter during stream', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    await page.routeFromHAR('./tests/e2e/hars/error-chat-response-stream.har', {
      url: '/chat',
      update: false,
      updateContent: 'embed',
    });

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.chat__txt.error')).toContainText('Please modify your question and try again');

    // make sure the content is there for all text entries including some of the streamed content
    const chatContent = page.locator('.chat__txt--entry');
    await expect(chatContent).toHaveCount(2);
    await expect(chatContent.nth(0)).not.toHaveText('');
    await expect(chatContent.nth(1)).not.toHaveText('');
  });

  test('no stream: on server failure', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    const internalServerError = {
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server error',
      }),
    };

    await page.route('/chat', (route) => route.fulfill(internalServerError));
    await page.route('**/chat', (route) => route.fulfill(internalServerError));

    await page.getByTestId('button__developer-settings').click();
    const streamSetting = page.locator('label').filter({ hasText: 'Stream chat' }).locator('i');

    await streamSetting.click();
    await expect(streamSetting).not.toBeChecked();

    await page.locator('button').filter({ hasText: 'Close' }).click();

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible();

    // make sure it's the generic message
    await expect(page.locator('.chat__txt.error')).toContainText('Sorry, we are having some problems.');
  });

  test('no stream: on bad request', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    const badRequest = {
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server error',
        code: 'content_filter',
        message: 'Content filtered',
      }),
    };

    await page.route('/chat', (route) => route.fulfill(badRequest));
    await page.route('**/chat', (route) => route.fulfill(badRequest));

    await page.getByTestId('button__developer-settings').click();
    const streamSetting = page.locator('label').filter({ hasText: 'Stream chat' }).locator('i');

    await streamSetting.click();
    await expect(streamSetting).not.toBeChecked();

    await page.locator('button').filter({ hasText: 'Close' }).click();

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible();
    // make sure it's the user error message
    await expect(page.locator('.chat__txt.error')).toContainText('Please modify your question and try again');
  });

  test('ask: on server failure', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Ask a question' }).click();
    await page.getByTestId('default-question').nth(0).click();

    const internalServerError = {
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server error',
      }),
    };

    await page.route('/ask', (route) => route.fulfill(internalServerError));
    await page.route('**/ask', (route) => route.fulfill(internalServerError));

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible();

    // make sure it's the generic message
    await expect(page.locator('.chat__txt.error')).toContainText('Sorry, we are having some problems.');
  });

  test('ask: on bad request', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Ask a question' }).click();

    await page.getByTestId('default-question').nth(0).click();

    const badRequest = {
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server error',
        code: 'content_filter',
        message: 'Content filtered',
      }),
    };

    await page.route('/ask', (route) => route.fulfill(badRequest));
    await page.route('**/ask', (route) => route.fulfill(badRequest));

    await page.getByTestId('submit-question-button').click();
    await expect(page.locator('.chat__txt.error')).toBeVisible();
    // make sure it's the user error message
    await expect(page.locator('.chat__txt.error')).toContainText('Please modify your question and try again');
  });
});

test.describe('generate answer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    await page.routeFromHAR('./tests/e2e/hars/default-chat-response-stream.har', {
      url: '/chat',
      update: false,
    });

    await page.getByTestId('submit-question-button').click();
    // wait for the thought process button to be enabled.
    await expect(page.getByTestId('chat-show-thought-process')).toBeEnabled({ timeout: 30_000 });
  });

  test('show thought process', async ({ page }) => {
    const showThoughtProcess = page.getByTestId('chat-show-thought-process');
    const thoughtProcessAside = page.getByTestId('aside-thought-process');

    await test.step('show/hide aside', async () => {
      await expect(thoughtProcessAside).not.toBeVisible();
      await showThoughtProcess.click();
      await expect(thoughtProcessAside).toBeVisible();

      await page.getByTestId('chat-hide-thought-process').click();
      await expect(thoughtProcessAside).not.toBeVisible();
    });

    await test.step('Reset chat', async () => {
      await showThoughtProcess.click();
      await expect(thoughtProcessAside).toBeVisible();
      await page.getByTestId('chat-reset-button').click();
      await expect(thoughtProcessAside).not.toBeVisible();
    });
  });

  test('citation', async ({ page }) => {
    const citations = page.getByTestId('citation');
    await expect(citations).toHaveCount(1);

    await expect(citations.nth(0)).toBeEnabled();
    await expect(citations.nth(0)).toContainText('support.md');

    await page.routeFromHAR('./tests/e2e/hars/citation-content.har', {
      url: '/content/support.md',
      update: false,
      updateContent: 'embed',
    });

    await citations.nth(0).click();
    // the thought process should be visible on the citation tab with citations visible
    await expect(page.getByTestId('aside-thought-process').getByTestId('citation')).toBeVisible();

    // markdown converted to html
    await expect(page.getByRole('heading', { name: 'Contoso Real Estate Customer Support Guide' })).toBeVisible();
  });

  test('follow up questions', async ({ page }) => {
    const followupQuestions = page.getByTestId('followUpQuestion');

    await expect(followupQuestions).toHaveCount(3);

    const chatInput = page.getByTestId('question-input');
    await expect(chatInput).toHaveValue('');

    for (let index = 0; index < 3; index++) {
      const question = followupQuestions.nth(index);
      await expect(question).toBeEnabled();
      const questionText = await question.textContent();
      expect(questionText).not.toBeNull();
      expect(questionText).not.toBe('');
      expect(questionText?.endsWith('?'), 'follow up question should end with ?').toBe(true);

      await question.click();
      await expect(chatInput).toHaveValue(questionText!);
    }
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
    await expect(page.getByLabel('Retrieval mode')).toContainText('Vectors + Text (Hybrid)');
  });

  test('enable branding toggled', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button__developer-settings').click();
    // toggle enable branding
    await page.locator('label').filter({ hasText: 'Enable branding' }).click();
    await page.waitForTimeout(1000);
    // await for brading to be visible
    await expect(page.getByTestId('chat-branding')).toBeVisible();
  });

  test('select dark theme', async ({ page }) => {
    await page.goto('/');
    expect(await page.getAttribute('html', 'data-theme')).toBe('');
    await page.getByTestId('button__developer-settings').click();
    await page.locator('label').filter({ hasText: 'Select theme' }).click();
    // Wait for the state to update
    await page.waitForFunction(() => {
      return document.querySelector('html')?.dataset.theme === 'dark';
    });
    // Check the updated state
    expect(await page.getAttribute('html', 'data-theme')).toBe('dark');
  });

  test('customize chat styles toggled and check localStorage', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button__developer-settings').click();
    await page.locator('label').filter({ hasText: 'Customize chat styles' }).click();

    await page.waitForTimeout(1000);
    // check if localStorage has an item called 'customStyles' and it's not empty
    const hasCustomStyles = await page.evaluate(() => {
      const customStyles = localStorage.getItem('ms-azoaicc:customStyles');
      return customStyles !== null && customStyles.trim() !== '';
    });

    await expect(hasCustomStyles).toBe(true);
  });

  test('handle no stream parsing', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('default-question').nth(0).click();

    await page.routeFromHAR('./tests/e2e/hars/default-chat-response-nostream.har', {
      url: '/chat',
      update: false,
      updateContent: 'embed',
    });

    await page.getByTestId('button__developer-settings').click();
    const streamSetting = page.locator('label').filter({ hasText: 'Stream chat' }).locator('i');

    await expect(streamSetting).toBeChecked();
    await streamSetting.click();
    await expect(streamSetting).not.toBeChecked();

    await page.locator('button').filter({ hasText: 'Close' }).click();

    await page.getByTestId('submit-question-button').click();
    // wait for the thought process button to be enabled.
    await expect(page.getByTestId('chat-show-thought-process')).toBeEnabled({ timeout: 30_000 });

    await expect(page.locator('.items__listItem--step')).not.toHaveCount(0);
  });
});
