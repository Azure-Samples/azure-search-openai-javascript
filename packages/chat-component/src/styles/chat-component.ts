import { css } from 'lit';

export const chatStyle = css`
  :host {
    width: 100vw;
    display: block;
    padding: 16px;
    --secondary-color: #f5f5f5;
    --text-color: #123f58;
    --primary-color: rgba(241, 255, 165, 0.6);
    --white: #fff;
    --black: #111111;
    --red: #ff0000;
    --light-gray: #e3e3e3;
    --dark-gray: #4e5288;
    --accent-high: #692b61;
    --accent-dark: #002b23;
    --accent-light: #e6fbf7;
    --accent-lighter: #f6d0d0;
    --accent-contrast: #7d3c71;
    --error-color: #8a0000;
    --error-color-background: rgb(253, 231, 233);
  }
  :host([data-theme='dark']) {
    display: block;
    padding: 16px;
    --secondary-color: #1f2e32;
    --text-color: #ffffff;
    --primary-color: rgba(241, 255, 165, 0.6);
    --white: #000000;
    --light-gray: #e3e3e3;
    --dark-gray: #4e5288;
    --accent-high: #005164;
    --accent-dark: #b4e2ee;
    --accent-light: #e6fbf7;
    --accent-lighter: #f6d0d0;
    --accent-contrast: #7d3c71;
    --error-color: rgb(243, 242, 241);
    --error-color-background: rgb(68, 39, 38);
  }
  html {
    scroll-behavior: smooth;
  }
  ul {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  .button {
    color: var(--text-color);
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
    background: var(--black);
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
    gap: 8px;
  }
  .container-row {
    flex-direction: row;
  }
  .headline {
    color: var(--text-color);
    font-size: 5vw;
    padding: 0;
    margin: 10px 0 30px;

    @media (min-width: 1024px) {
      font-size: 3vw;
      text-align: center;
    }
  }
  .subheadline {
    color: var(--text-color);
    font-size: 1.2rem;
    padding: 0;
    margin: 0;
  }
  .chat__container {
    min-width: 100%;
    transition: width 0.3s ease-in-out;
    max-height: 100vh;
  }
  .chat__containerWrapper.aside-open {
    .chat__listItem {
      max-width: 90%;
      min-width: 80%;
    }
  }
  .chat__containerWrapper {
    display: grid;
    grid-template-columns: 1fr;
    gutter: 20px;
  }
  .chat__containerWrapper.aside-open {
    display: grid;
    grid-template-columns: 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  .chat__containerWrapper.aside-open .aside {
    width: 100%;
    border-left: 1px solid #d2d2d2;

    @media (max-width: 1024px) {
      width: 80%;
    }
  }
  @media (max-width: 1024px) {
    .aside {
      top: 30px;
      left: auto;
      z-index: 3;
      background: var(--white);
      display: block;
      padding: 20px;
      position: absolute;
      width: 80%;
      border-radius: 10px;
    }
  }
  .form__container {
    margin-top: 30px;
    padding: 10px;
  }
  .form__container-sticky {
    position: sticky;
    bottom: 0;
    z-index: 1;
    border-radius: 10px;
    background: linear-gradient(
      0deg,
      rgba(245, 245, 245, 1) 0%,
      rgba(245, 245, 245, 0.8) 75%,
      rgba(245, 245, 245, 0.5) 100%
    );
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: 15px 10px 50px;
  }
  .form__label {
    display: block;
    padding: 5px 0;
    font-size: small;
  }
  .chat__header {
    display: flex;
    justify-content: flex-end;
    padding: 20px;
  }
  .chatbox__button:disabled,
  .chatbox__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chatbox__button svg {
    fill: var(--accent-high);
    width: 25px;
  }
  .chatbox__container {
    position: relative;
    height: 50px;
  }
  .chatbox__button {
    background: var(--white);
    border: none;
    color: var(--text-color);
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    margin-left: 8px;
    width: 80px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease-in-out;
  }
  .chatbox__button:hover,
  .chatbox__button:focus {
    background: var(--secondary-color);
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
    background: var(--accent-dark);
    border-radius: 50%;
    color: var(--white);
    font-weight: bold;
    height: 20px;
    width: 20px;
    cursor: pointer;
  }
  .chatbox__input-container {
    display: flex;
    border: 1px solid var(--black);
    background: var(--white);
    border-radius: 4px;
  }
  .chatbox__input-container:focus-within {
    outline: -webkit-focus-ring-color auto 1px;
  }
  .chatbox__input {
    background: transparent;
    color: var(--text-color);
    border: none;
    padding: 8px;
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
    padding: 20px 20px 20px 0px;
  }
  .tab-component__paragraph {
    font-family: monospace;
    font-size: large;
    border: 1px solid var(--light-gray);
    border-radius: 25px;
    padding: 20px;
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
