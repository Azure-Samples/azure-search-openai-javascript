import { test } from 'node:test';
import { MessageBuilder } from '../../src/lib/message-builder.js';

test('MessageBuilder', async (t) => {
  const systemContent = 'Welcome to the chat!';
  const chatgptModel = 'gpt-4o-mini';
  const messageBuilder = new MessageBuilder(systemContent, chatgptModel);

  await t.test('constructor', (t) => {
    t.assert.equal(messageBuilder.messages.length, 1, 'should have one message');
    t.assert.equal(messageBuilder.messages[0].role, 'system', 'should have a system message');
    t.assert.equal(messageBuilder.messages[0].content, systemContent, 'should have the correct system message content');
    t.assert.equal(messageBuilder.model, chatgptModel, 'should have the correct ChatGPT model');
    t.assert.equal(messageBuilder.tokens, 8, 'should have correct number of tokens');
  });

  await t.test('appendMessage', (t) => {
    const role = 'user';
    const content = 'Hello, how are you?';
    messageBuilder.appendMessage(role, content);

    t.assert.equal(messageBuilder.messages.length, 2, 'should have two messages');
    t.assert.equal(messageBuilder.messages[1].role, role, 'should have the correct message role');
    t.assert.equal(messageBuilder.messages[1].content, content, 'should have the correct message content');
    t.assert.equal(messageBuilder.tokens, 17, 'should have correct number of tokens');
  });
});
