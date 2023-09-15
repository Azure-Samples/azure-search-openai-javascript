export const globalConfig = {
  // Is default prompts enabled?
  IS_DEFAULT_PROMPTS_ENABLED: true,
  // Default prompts to display in the chat
  DEFAULT_PROMPTS: [
    'Show me some relevant information',
    'Give me the answer I seek!',
    'Explain me all important details',
  ],
  DEFAULT_PROMPTS_HEADING: 'Start a conversation with our support team.',
  // This are the chat bubbles that will be displayed in the chat
  CHAT_MESSAGES: [],
  // This are the labels for the chat button and input
  CHAT_BUTTON_LABEL_TEXT: 'Ask Support',
  CHAT_INPUT_LABEL_TEXT: 'Ask a question now',
  CHAT_INPUT_PLACEHOLDER: 'Type your question here',
  USER_IS_BOT: 'Support Bot',
  RESET_BUTTON_LABEL_TEXT: 'X',
  // API URL for development purposes
  API_URL_LOCAL: '/api/responses',
  API_CHAT_URL: 'http://localhost:3000/chat',
};
