const globalConfig = {
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
  CHAT_INPUT_PLACEHOLDER: 'Type your question, eg. "How to search and book rentals?"',
  USER_IS_BOT: 'Support Bot',
  RESET_BUTTON_LABEL_TEXT: 'X',
  RESET_BUTTON_TITLE_TEXT: 'Reset current question',
  RESET_CHAT_BUTTON_TITLE: 'Reset chat',
  // Copy response to clipboard
  COPY_RESPONSE_BUTTON_LABEL_TEXT: 'Copy Response',
  COPIED_SUCCESSFULLY_MESSAGE: 'Response copied!',
  LOADING_INDICATOR_TEXT: 'Please wait. We are searching for an answer...',
  // API URL for development purposes
  API_URL: 'http://localhost:3000/',
  // API ERROR HANDLING IN UI
  API_ERROR_MESSAGE: 'Sorry, we are having some problems. Please try again later.',
  // Config pertaining the response format
};

const NEXT_QUESTION_INDICATOR = 'Next Questions:';

const requestOptions = {
  method: 'POST',
  approach: 'rrr',
  stream: false,
  overrides: {
    retrieval_mode: 'hybrid',
    semantic_ranker: true,
    semantic_captions: false,
    suggest_followup_questions: true,
  },
};

export { globalConfig, requestOptions, NEXT_QUESTION_INDICATOR };
