import { css } from 'lit';

export const mainStyle = css`
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
  :host([data-theme='dark']]) {
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
  @keyframes chatmessageanimation {
    0% {
      opacity: 0.5;
      top: 150px;
    }
    100% {
      opacity: 1;
      top: 0px;
    }
  }
  @keyframes spinneranimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
  .subheadline--small {
    font-size: 12px;
    display: inline-block;
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
  .aside__header {
    display: flex;
    justify-content: end;
  }
  .aside__list {
    list-style-type: none;
    display: flex;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 10px;
    border-radius: 10px;
    padding: 3px;
    width: 450px;
    margin: 0 auto;
    justify-content: space-evenly;
  }
  .aside__listItem {
    width: 33%;
    text-align: center;
  }
  .aside__link.active {
    background: linear-gradient(to left, var(--accent-contrast), var(--accent-high));
    color: var(--white);
  }
  .aside__link:not(.active):hover {
    background: var(--light-gray);
    cursor: pointer;
  }
  .aside__link {
    border-bottom: 4px solid transparent;
    border-radius: 5px;
    text-decoration: none;
    color: var(--text-color);
    font-weight: bold;
    font-size: small;
    cursor: pointer;
    display: block;
    padding: 10px;
  }
  .aside__content {
    position: relative;
  }
  .aside__content .items__list.citations {
    border-top: 0;
  }
  .aside__tab {
    position: absolute;
    top: 0;
    left: 30px;
    display: none;

    @media (max-width: 1024px) {
      position: relative;
      left: 0;
    }
  }
  .aside__tab.active {
    display: block;
  }
  .aside__paragraph {
    font-family: monospace;
    font-size: large;
    border: 1px solid var(--light-gray);
    padding: 20px;
    border-radius: 25px;
  }
  .chat__header {
    display: flex;
    justify-content: flex-end;
    padding: 20px;
  }
  .chat__header--button {
    border: 1px solid var(--accent-dark);
    text-decoration: none;
    border-radius: 5px;
    background: var(--white);
    display: flex;
    align-items: center;
    margin-left: 5px;
    opacity: 1;
    padding: 5px;
    transition: all 0.3s ease-in-out;
    height: 40px;
    position: relative;
  }
  .chat__header--button:disabled,
  .chatbox__button:disabled,
  .chatbox__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chatbox__button svg {
    fill: var(--accent-high);
    width: 25px;
  }
  .chat__header--span {
    font-size: smaller;
    transition: all 0.3s ease-out 0s;
    position: absolute;
    text-align: right;
    top: -80%;
    background: var(--accent-dark);
    color: white;
    opacity: 0;
    right: 0px;
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: bold;
    text-wrap: nowrap;
  }
  .chat__header--span::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid var(--accent-dark);
    bottom: -8px;
    right: 5px;
  }
  .chat__header--button svg {
    fill: currentColor;
    width: 25px;
    padding: 3px;
  }
  .chat__header--button:hover > span,
  .chat__header--button:focus > span {
    display: inline-block;
    opacity: 1;
  }
  .chat__header--button:hover > svg,
  .chat__header--button:focus > svg {
    background-color: var(--light-gray);
    border-radius: 5px;
    transition: background 0.3s ease-in-out;
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
  .voice__input {
    box-shadow: none;
    background: transparent;
    border: none;
    cursor: pointer;
    width: 50px;
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
  .chat__list {
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    list-style-position: inside;
    padding-inline-start: 0;
  }
  .chat__footer {
    width: 100%;
    height: 70px;
  }
  .chat__listItem {
    max-width: 90%;
    min-width: 80%;
    display: flex;
    flex-direction: column;
    height: auto;

    @media (min-width: 768px) {
      max-width: 55%;
      min-width: 50%;
    }
  }
  .chat__txt {
    animation: chatmessageanimation 0.5s ease-in-out;
    background-color: var(--secondary-color);
    color: var(--text-color);
    border-radius: 10px;
    margin-top: 8px;
    word-wrap: break-word;
    margin-block-end: 0;
    position: relative;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--light-gray);
  }
  .chat__txt.error {
    border: 3px solid var(--error-color);
    color: var(--error-color);
    padding: 20px;
    background: var(--error-color-background);
  }
  .chat__txt.user-message {
    background: linear-gradient(to left, var(--accent-contrast), var(--accent-high));
    color: var(--white);
    border: 1px solid var(--accent-lighter);
  }
  .chat__listItem.user-message {
    align-self: flex-end;
  }
  .chat__txt--entry {
    padding: 0 20px;
  }
  .chat__txt--info {
    font-size: smaller;
    font-style: italic;
    margin: 0;
    margin-top: 1px;
  }
  .user-message .chat__txt--info {
    text-align: right;
  }
  .items__listWrapper {
    border-top: 1px solid var(--light-gray);
    display: grid;
    padding: 0 20px;
    grid-template-columns: 1fr 18fr;
  }
  .items__listWrapper svg {
    fill: var(--accent-high);
    width: 30px;
    margin: 32px auto;
  }
  svg {
    height: auto;
  }
  .items__list.followup {
    display: flex;
    flex-direction: row;
    padding: 20px;
    list-style-type: none;
    flex-wrap: wrap;
  }
  .items__list.steps {
    padding: 0 20px 0 40px;
    list-style-type: disc;
  }
  .items__list.citations {
    border-top: 1px solid var(--light-gray);
    padding: 10px 20px 0;
  }
  .items__list {
    margin: 10px 0;
    display: block;
    padding: 0 20px;
  }
  svg {
    fill: var(--text-color);
  }
  .items__listItem--followup {
    cursor: pointer;
    padding: 0 5px;
    border-radius: 10px;
    border: 1px solid var(--accent-high);
    margin: 5px;
    transition: background-color 0.3s ease-in-out;
  }
  .items__listItem--followup:hover,
  .items__listItem--followup:focus {
    background-color: var(--accent-lighter);
    cursor: pointer;
  }
  .items__listItem--citation {
    display: inline-block;
    background-color: var(--accent-lighter);
    border-radius: 5px;
    text-decoration: none;
    padding: 5px;
    margin-top: 5px;
    font-size: small;
  }
  .items__listItem--citation.active {
    background-color: var(--accent-high);
  }
  .items__listItem--citation:not(first-child) {
    margin-left: 5px;
  }
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
  .items__listItem--citation.active .items__link {
    color: var(--white);
  }
  .steps .items__listItem--step {
    padding: 5px 0;
    font-size: 14px;
    line-heigth: 1;
  }
  .followup .items__link {
    color: var(--accent-high);
    display: block;
    padding: 5px 0;
    border-bottom: 1px solid var(--light-gray);
    font-size: small;
  }
  .defaults__button {
    text-decoration: none;
    color: var(--text-color);
    display: block;
    font-size: 1.2rem;
  }
  .defaults__list {
    list-style-type: none;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .defaults__list.always-row {
    text-align: left;
  }
  .defaults__list:not(.always-row) {
    @media (min-width: 1024px) {
      flex-direction: row;
    }
  }
  .defaults__listItem {
    padding: 10px;
    border-radius: 10px;
    background: var(--white);
    margin: 4px;
    color: var(--text-color);
    justify-content: space-evenly;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 3px solid transparent;

    @media (min-width: 768px) {
      min-height: 100px;
    }
  }
  .defaults__listItem:hover,
  .defaults__listItem:focus {
    color: var(--accent-dark);
    background: var(--secondary-color);
    transition: all 0.3s ease-in-out;
    border-color: var(--accent-high);
  }
  .defaults__span {
    color: var(--accent-high);
    font-weight: bold;
    display: block;
    margin-top: 20px;
    text-decoration: underline;
  }
  .citation {
    background-color: var(--accent-lighter);
    border-radius: 3px;
    padding: 3px;
    margin-left: 3px;
  }
  .loading-text {
    display: flex;
    align-items: center;
  }
  .loading-skeleton {
    display: flex;
    margin-bottom: 50px;
  }
  .loading-icon svg {
    width: 30px;
    height: 30px;
    fill: var(--accent-lighter);
    animation: spinneranimation 1s linear infinite;
    margin-right: 10px;
  }
  .not-recording svg {
    fill: var(--black);
  }
  .recording svg {
    fill: var(--red);
  }
`;
