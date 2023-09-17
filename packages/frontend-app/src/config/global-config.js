export const globalConfig = {
  // Is default prompts enabled?
  IS_DEFAULT_PROMPTS_ENABLED: true,
  // Default prompts to display in the chat
  DISPLAY_DEFAULT_PROMPTS_BUTTON: 'Not sure what to ask? Try our suggestions!',
  DEFAULT_PROMPTS: [
    'How to search and book rentals',
    'How to cancel a confirmed booking',
    'How to report a payment or refund issue, for example if a guest or host is asking to pay or be paid outside of the Contoso Real Estate platform',
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
  LOADING_INDICATOR_TEXT: 'Please wait. We are searching for an answer...',
  // API URL for development purposes
  API_CHAT_URL: 'http://localhost:3000/chat',
  // API ERROR HANDLING IN UI
  API_ERROR_MESSAGE: 'Sorry, we are having some problems. Please try again later.',
};
