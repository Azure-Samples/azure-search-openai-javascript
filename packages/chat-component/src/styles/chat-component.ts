import { css } from 'lit';

export const chatStyle = css`
  :host {
    --c-primary: #123f58;
    --c-secondary: #f5f5f5;
    --c-text: var(--c-primary);
    --c-white: #fff;
    --c-black: #111111;
    --c-red: #ff0000;
    --c-light-gray: #e3e3e3;
    --c-base-gray: var(--c-secondary);
    --c-dark-gray: #4e5288;
    --c-accent-high: #692b61;
    --c-accent-dark: #5e3c7d;
    --c-accent-light: #f6d5f2;
    --c-error: #8a0000;
    --c-error-background: rgb(253, 231, 233);
    --c-success: #26b32b;
    --font-r-small: 1vw;
    --font-r-base: 3vw;
    --font-r-large: 5vw;
    --font-base: 14px;
    --font-rel-base: 1.2rem;
    --font-small: small;
    --font-large: large;
    --font-larger: x-large;
    --border-base: 3px;
    --border-thin: 1px;
    --border-thicker: 8px;
    --radius-small: 5px;
    --radius-base: 10px;
    --radius-large: 25px;
    --radius-none: 0;
    --width-wide: 90%;
    --width-base: 80%;
    --width-narrow: 50%;
    --d-base: 20px;
    --d-small: 10px;
    --d-xsmall: 5px;
    --d-large: 30px;
    --d-xlarge: 50px;
    --shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100vw;
    display: block;
    padding: var(--d-base);
    color: var(--c-text);
  }
  :host([data-theme='dark']) {
    --c-primary: #fdfeff;
    --c-secondary: #32343e;
    --c-text: var(--c-primary);
    --c-white: var(--c-secondary);
    --c-black: var(--c-primary);
    --c-red: #ff0000;
    --c-light-gray: #636d9c;
    --c-dark-gray: #e3e3e3;
    --c-base-gray: var(--c-secondary);
    --c-accent-high: #dcdef8;
    --c-accent-dark: var(--c-primary);
    --c-accent-light: #032219;
    --c-error: #8a0000;
    --c-error-background: rgb(253, 231, 233);
    --c-success: #26b32b;
  }
  html {
    scroll-behavior: smooth;
  }
  ul {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  .button {
    color: var(--c-text);
    border: 0;
    background: none;
    cursor: pointer;
    text-decoration: underline;
  }
  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    width: 100%;
    height: 0;
    background: var(--c-black);
    z-index: 2;
    opacity: 0.8;
    transition: all 0.3s ease-in-out;
  }
  .overlay.active {
    @media (max-width: 1024px) {
      height: 100%;
    }
  }
  .display-none {
    display: none;
    visibility: hidden;
  }
  .display-flex-grow {
    flex-grow: 1;
  }
  .container-col {
    display: flex;
    flex-direction: column;
    gap: var(--d-small);
  }
  .container-row {
    flex-direction: row;
  }
  .chat__header--thread {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .chat__container {
    min-width: 100%;
    transition: width 0.3s ease-in-out;
    max-height: 100vh;
  }
  .chat__containerWrapper.aside-open {
    .chat__listItem {
      max-width: var(--width-wide);
    }
  }
  .chat__containerWrapper {
    display: grid;
    grid-template-columns: 1fr;
    gutter: var(--d-base);
  }
  .chat__containerWrapper.aside-open {
    display: grid;
    grid-template-columns: 1fr;
    grid-column-gap: var(--d-base);
    grid-row-gap: var(--d-base);

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  .chat__containerWrapper.aside-open .aside {
    width: 100%;
    border-left: var(--border-thin) solid var(--c-light-gray);

    @media (max-width: 1024px) {
      width: var(--width-base);
    }
  }
  @media (max-width: 1024px) {
    .aside {
      top: var(-d-large);
      left: auto;
      z-index: 3;
      background: var(--c-white);
      display: block;
      padding: var(--d-base);
      position: absolute;
      width: var(--width-base);
      border-radius: var(--radius-base);
    }
  }
  .form__container {
    margin-top: var(--d-large);
    padding: var(--d-small);
  }
  .form__container-sticky {
    position: sticky;
    bottom: 0;
    z-index: 1;
    border-radius: var(--radius-base);
    background: linear-gradient(0deg, var(--c-base-gray) 0%, var(--c-base-gray) 75%, var(--c-base-gray) 100%);
    box-shadow: var(--shadow);
    padding: var(--d-small) var(--d-small) var(--d-large);
  }
  .form__label {
    display: block;
    padding: var(-d-xsmall) 0;
    font-size: var(--font-small);
  }
  .chatbox__button:disabled,
  .chatbox__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chatbox__button svg {
    fill: var(--c-accent-high);
    width: calc(var(--d-base) + var(--d-xsmall));
  }
  .chatbox__container {
    position: relative;
    height: 50px;
  }
  .chatbox__button {
    background: var(--c-white);
    border: none;
    color: var(--text-color);
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    margin-left: 8px;
    width: calc(var(--d-large) + var(--d-xlarge));
    box-shadow: var(--shadow);
    transition: background 0.3s ease-in-out;
  }
  .chatbox__button:hover,
  .chatbox__button:focus {
    background: var(--c-secondary);
  }
  .chatbox__button:hover svg,
  .chatbox__button:focus svg {
    opacity: 0.8;
  }
  .chatbox__button--reset {
    position: absolute;
    right: 115px;
    top: 15px;
    background: transparent;
    border: none;
    color: gray;
    background: var(--c-accent-dark);
    border-radius: 50%;
    color: var(--c-white);
    font-weight: bold;
    height: 20px;
    width: var(--d-base);
    cursor: pointer;
  }
  .chatbox__input-container {
    display: flex;
    border: var(--border-thin) solid var(--c-black);
    background: var(--c-white);
    border-radius: 4px;
  }
  .chatbox__input-container:focus-within {
    outline: -webkit-focus-ring-color auto 1px;
  }
  .chatbox__input {
    background: transparent;
    color: var(--text-color);
    border: none;
    padding: var(--d-small);
    flex: 1 1 auto;
    font-size: 1rem;
  }
  .chatbox__input:focus-visible {
    outline: none;
  }
  .aside__header {
    display: flex;
    justify-content: end;
  }
  .tab-component__content {
    padding: var(--d-base) var(--d-base) var(--d-base) 0;
  }
  .tab-component__paragraph {
    font-family: monospace;
    font-size: var(--font-large);
    border: var(--border-thin) solid var(--c-light-gray);
    border-radius: var(--radius-large);
    padding: var(--d-base);
  }
  .chat-history__footer {
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    align-self: center;
    padding: 20px;
  }
  .chat-history__container {
    display: flex;
    flex-direction: column;
    border-bottom: 3px solid var(--light-gray);
    margin-bottom: 30px;
  }
`;
