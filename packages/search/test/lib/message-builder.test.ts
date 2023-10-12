import t from 'tap';
import { MessageBuilder } from '../../src/lib/message-builder.js';

t.test('MessageBuilder', (t) => {
  const systemContent = 'Welcome to the chat!';
  const chatgptModel = 'gpt-3.5-turbo';
  const messageBuilder = new MessageBuilder(systemContent, chatgptModel);

  t.test('constructor', (t) => {
    t.equal(messageBuilder.messages.length, 1, 'should have one message');
    t.equal(messageBuilder.messages[0].role, 'system', 'should have a system message');
    t.equal(messageBuilder.messages[0].content, systemContent, 'should have the correct system message content');
    t.equal(messageBuilder.model, chatgptModel, 'should have the correct ChatGPT model');
    t.equal(messageBuilder.tokens, 8, 'should have correct number of tokens');
    t.end();
  });

  t.test('appendMessage', (t) => {
    const role = 'user';
    const content = 'Hello, how are you?';
    messageBuilder.appendMessage(role, content);

    t.equal(messageBuilder.messages.length, 2, 'should have two messages');
    t.equal(messageBuilder.messages[1].role, role, 'should have the correct message role');
    t.equal(messageBuilder.messages[1].content, content, 'should have the correct message content');
    t.equal(messageBuilder.tokens, 17, 'should have correct number of tokens');
    t.end();
  });

  t.end();
});
