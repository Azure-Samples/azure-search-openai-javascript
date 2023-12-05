const globalConfig = {
  BOT_TYPING_EFFECT_INTERVAL: 50, // in ms

  // Is default prompts enabled?
  IS_DEFAULT_PROMPTS_ENABLED: true,
  // Default prompts to display in the chat
  DISPLAY_DEFAULT_PROMPTS_BUTTON: 'Not sure what to ask? Try our suggestions!',
  // This are the chat bubbles that will be displayed in the chat
  CHAT_MESSAGES: [],
  // This are the labels for the chat button and input
  CHAT_BUTTON_LABEL_TEXT: 'Ask Support',
  CHAT_CANCEL_BUTTON_LABEL_TEXT: 'Cancel Generation',
  CHAT_VOICE_BUTTON_LABEL_TEXT: 'Voice input',
  CHAT_VOICE_REC_BUTTON_LABEL_TEXT: 'Listening to voice input',
  CHAT_INPUT_PLACEHOLDER: 'Type your question, eg. "How to search and book rentals?"',
  USER_IS_BOT: 'Support Assistant',
  RESET_BUTTON_LABEL_TEXT: 'X',
  RESET_BUTTON_TITLE_TEXT: 'Reset current question',
  RESET_CHAT_BUTTON_TITLE: 'Reset chat',
  // Copy response to clipboard
  COPY_RESPONSE_BUTTON_LABEL_TEXT: 'Copy Response',
  COPIED_SUCCESSFULLY_MESSAGE: 'Response copied!',
  // Follow up questions text
  FOLLOW_UP_QUESTIONS_LABEL_TEXT: 'You can also ask...',
  SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT: 'Show thought process',
  HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT: 'Hide thought process',
  LOADING_INDICATOR_TEXT: 'Please wait. We are searching and generating an answer...',
  LOADING_TEXT: 'Loading...',
  // API ERROR HANDLING IN UI
  API_ERROR_MESSAGE: 'Sorry, we are having some problems. Please try again later.',
  INVALID_REQUEST_ERROR: 'Unable to generate answer for this query. Please modify your question and try again.',
  // Config pertaining the response format
  THOUGHT_PROCESS_LABEL: 'Thought Process',
  SUPPORT_CONTEXT_LABEL: 'Support Context',
  CITATIONS_LABEL: 'Learn More:',
  CITATIONS_TAB_LABEL: 'Citations',
  // Custom Branding
  IS_CUSTOM_BRANDING: true,
  // Custom Branding details
  // All these should come from persistence config
  BRANDING_URL: '#',
  BRANDING_LOGO_ALT: 'Brand Logo',
  BRANDING_HEADLINE: 'Welcome to the Support Assistant of our Brand',
  SHOW_CHAT_HISTORY_LABEL: 'Show Chat History',
  HIDE_CHAT_HISTORY_LABEL: 'Hide Chat History',
  CHAT_MAX_COUNT_TAG: '{MAX_CHAT_HISTORY}',
  CHAT_HISTORY_FOOTER_TEXT: 'Showing past {MAX_CHAT_HISTORY} conversations',
};

const teaserListTexts = {
  TEASER_CTA_LABEL: 'Ask now',
  HEADING_CHAT: 'Chat with our support team',
  HEADING_ASK: 'Ask a question',
  DEFAULT_PROMPTS: [
    {
      description: 'How to search and book rentals?',
    },
    {
      description: 'What is the refund policy?',
    },
    {
      description: 'How to contact a representative?',
    },
  ],
};

const NEXT_QUESTION_INDICATOR = 'Next Questions:';

const requestOptions = {
  approach: 'rrr',
  overrides: {
    retrieval_mode: 'hybrid',
    semantic_ranker: true,
    semantic_captions: false,
    suggest_followup_questions: true,
  },
};

const chatHttpOptions = {
  // API URL for development purposes
  url: 'http://localhost:3000',
  method: 'POST',
  stream: true,
};

const MAX_CHAT_HISTORY = 5;

const APPROACH_MODEL = ['rrr', 'rtr'];

export {
  globalConfig,
  requestOptions,
  chatHttpOptions,
  NEXT_QUESTION_INDICATOR,
  APPROACH_MODEL,
  teaserListTexts,
  MAX_CHAT_HISTORY,
};
