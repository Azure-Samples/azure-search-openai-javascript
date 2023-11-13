import { css } from 'lit';

export const mainStyle = css`
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
    width: 100vw;
    display: block;
    padding: var(--d-base);
    color: var(--c-text);
  }
  :host([data-theme='dark']]) {
    --c-primary: #123f58;
    --c-secondary: #f5f5f5;
    --c-text: var(--c-primary);
    --c-white: #fff;
    --c-black: #111111;
    --c-red: #ff0000;
    --c-light-gray: #e3e3e3;
    --c-dark-gray: #4e5288;
    --c-accent-high: #692b61;
    --c-accent-dark: #5e3c7d;
    --c-accent-light: #f6d5f2;
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
  @keyframes chatmessageanimation {
    0% {
      opacity: 0.5;
      top: calc(--var(--d-xlarge) * 3);
    }
    100% {
      opacity: 1;
      top: 0;
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
  .headline {
    color: var(--c-text);
    font-size: var(--font-r-large);
    padding: 0;
    margin: var(--d-small) 0 var(--d-large);

    @media (min-width: 1024px) {
      font-size: var(--font-r-base);
      text-align: center;
    }
  }
  .subheadline {
    color: var(--c-text);
    font-size: var(--font-r-base);
    padding: 0;
    margin: 0;
  }
  .subheadline--small {
    font-size: var(--font-small);
    display: inline-block;
  }
  .branding__banner {
    display: flex;
    width: var(--width-base);
    margin: 0 auto var(--d-large);
    justify-content: center;
    align-items: center;

    @media (min-width: 1024px) {
      width: var(--width-narrow);
    }
  }
  .branding__link svg {
    width: calc(var(--width-base) - var(--d-small));
    height: calc(var(--width-base) - var(--d-small));
    position: relative;
    z-index: 1;
  }
  .branding__link {
    flex-shrink: 0;
    border-radius: calc(var(--radius-large) * 3);
    border: var(--border-thicker) solid transparent;
    background-origin: border-box;
    background-clip: content-box, border-box;
    background-size: cover;
    background-image: linear-gradient(to right, var(--c-accent-light), var(--c-accent-high));
    width: calc(var(--d-xlarge) * 2);
    height: calc(var(--d-xlarge) * 2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--d-large);
    overflow: hidden;
    padding: var(--d-small);
    position: relative;
  }
  .branding__link::after {
    content: '';
    border-radius: calc(var(--radius-large) * 3);
    width: calc(var(--width-base) - var(--d-small));
    height: calc(var(--width-base) - var(--d-small));
    position: absolute;
    background-color: var(--c-secondary);
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
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: var(--d-small) var(--d-small) var(--d-large);
  }
  .form__label {
    display: block;
    padding: var(-d-xsmall) 0;
    font-size: var(--font-small);
  }
  .aside__header {
    display: flex;
    justify-content: end;
  }
  .aside__list {
    list-style-type: none;
    display: flex;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 10px;
    border-radius: var(--radius-base);
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
    background: linear-gradient(to left, var(--c-accent-dark), var(--c-accent-high));
    color: var(--c-white);
  }
  .aside__link:not(.active):hover {
    background: var(--c-light-gray);
    cursor: pointer;
  }
  .aside__link {
    border-bottom: 4px solid transparent;
    border-radius: var(--radius-small);
    text-decoration: none;
    color: var(--c-text);
    font-weight: bold;
    font-size: var(--font-small);
    cursor: pointer;
    display: block;
    padding: var(--d-small);
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
    left: var(--d-large);
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
    font-size: var(--font-large);
    border: var(--border-thin) solid var(--c-light-gray);
    padding: var(--d-base);
    border-radius: var(--radius-large);
  }
  .chat__header {
    display: flex;
    justify-content: flex-end;
  }
  .chat__txt .chat__header {
    display: flex;
    justify-content: space-between;
    padding: var(--d-base);
  }
  .chat__header .branding__link {
    width: calc(var(--d-base) + var(--d-xlarge));
    height: calc(var(--d-base) + var(--d-xlarge));
    padding: calc(var(--d-small) + var(--d-xsmall));
  }
  .chat__header .branding__link::after {
    width: calc(var(--width-base) - var(--d-base));
    height: calc(var(--width-base) - var(--d-base));
  }
  .chat__header--buttons {
    display: flex;
    align-items: center;
  }
  .chat__header--button {
    border: 1px solid var(--c-accent-dark);
    text-decoration: none;
    border-radius: var(--radius-small);
    background: var(--c-white);
    display: flex;
    align-items: center;
    margin-left: var(--d-xsmall);
    opacity: 1;
    padding: var(--d-xsmall);
    transition: all 0.3s ease-in-out;
    height: calc(var(--d-base) + var(--d-large));
    position: relative;
  }
  .chat__header--button:disabled,
  .chatbox__button:disabled,
  .chatbox__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chatbox__button svg {
    fill: var(--c-accent-high);
    width: var(--d-large);
  }
  .chat__header--span {
    font-size: var(--font-small);
    transition: all 0.3s ease-out 0s;
    position: absolute;
    text-align: right;
    top: -80%;
    background: var(--c-accent-dark);
    color: white;
    opacity: 0;
    right: 0px;
    padding: var(--d-xsmall) var(--d-small);
    border-radius: var(--radius-small);
    font-weight: bold;
    text-wrap: nowrap;
  }
  .chat__header--span::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: var(--d-xsmall) solid transparent;
    border-right: var(--d-xsmall) solid transparent;
    border-top: 8px solid var(--c-accent-dark);
    bottom: -8px;
    right: var(--d-xsmall);
  }
  .chat__header--button svg {
    fill: currentColor;
    width: var(--d-large);
    padding: var(--d-xmsall);
  }
  .chat__header--button:hover > span,
  .chat__header--button:focus > span {
    display: inline-block;
    opacity: 1;
  }
  .chat__header--button:hover > svg,
  .chat__header--button:focus > svg {
    background-color: var(--c-light-gray);
    border-radius: var(--radius-small);
    transition: background 0.3s ease-in-out;
  }
  .chatbox__container {
    position: relative;
    height: var(--d-xlarge);
  }
  .chatbox__button {
    background: var(--c-white);
    border: none;
    color: var(--c-text);
    font-weight: bold;
    cursor: pointer;
    border-radius: var(--radius-small);
    margin-left: var(--d-small);
    width: calc(var(--d-large) + var(--d-xlarge));
    box-shadow: 0 0 var(--d-small) rgba(0, 0, 0, 0.1);
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
    right: calc(var(--d-xlarge) * 2);
    top: var(--d-base);
    background: transparent;
    border: none;
    color: gray;
    background: var(--c-accent-dark);
    border-radius: 50%;
    color: var(--c-white);
    font-weight: bold;
    height: var(--d-base);
    width: var(--d-base);
    cursor: pointer;
  }
  .voice__input {
    box-shadow: none;
    background: transparent;
    border: none;
    cursor: pointer;
    width: var(--d-xlarge);
  }
  .chatbox__input-container {
    display: flex;
    border: var(--border-thin) solid var(--c-black);
    background: var(--c-white);
    border-radius: var(--radius-small);
  }
  .chatbox__input-container:focus-within {
    outline: -webkit-focus-ring-color auto var(--border-thin);
  }
  .chatbox__input {
    background: transparent;
    color: var(--c-text);
    border: none;
    padding: var(--d-small);
    flex: 1 1 auto;
    font-size: var(--font-rel-base);
  }
  .chatbox__input:focus-visible {
    outline: none;
  }
  .chat__list {
    color: var(--c-text);
    display: flex;
    flex-direction: column;
    list-style-position: inside;
    padding-inline-start: 0;
  }
  .chat__footer {
    width: 100%;
    height: calc(var(--d-base) + var(--d-xlarge));
  }
  .chat__listItem {
    max-width: var(--width-wide);
    min-width: var(--width-base);
    display: flex;
    flex-direction: column;
    height: auto;

    @media (min-width: 768px) {
      min-width: var(--width-narrow);
      max-width: var(--width-base);
    }
  }
  .chat__txt {
    animation: chatmessageanimation 0.5s ease-in-out;
    background-color: var(--c-secondary);
    color: var(--c-text);
    border-radius: var(--radius-base);
    margin-top: var(--d-small);
    word-wrap: break-word;
    margin-block-end: 0;
    position: relative;
    box-shadow: 0 0 var(--d-small) rgba(0, 0, 0, 0.1);
    border: 1px solid var(--c-light-gray);
  }
  .chat__txt.error {
    border: var(--border-base) solid var(--c-error);
    color: var(--c-error);
    padding: var(--d-base);
    background: var(--c-error-background);
  }
  .chat__txt.user-message {
    background: linear-gradient(to left, var(--c-accent-dark), var(--c-accent-high));
    color: var(--c-white);
    border: var(--border-thin) solid var(--c-accent-light);
  }
  .chat__listItem.user-message {
    align-self: flex-end;
  }
  .chat__txt--entry {
    padding: var(--d-small) var(--d-base);
  }
  .chat__txt--info {
    font-size: var(--font-small);
    font-style: italic;
    margin: 0;
    margin-top: 1px;
  }
  .user-message .chat__txt--info {
    text-align: right;
  }
  .items__listWrapper {
    border-top: 1px solid var(--c-light-gray);
    display: grid;
    padding: 0 var(--d-base);
    grid-template-columns: 1fr 18fr;
  }
  .items__listWrapper svg {
    fill: var(--c-accent-high);
    width: var(--d-large);
    margin: var(--d-large) auto;
  }
  svg {
    height: auto;
  }
  .items__list.followup {
    display: flex;
    flex-direction: row;
    padding: var(--d-base);
    list-style-type: none;
    flex-wrap: wrap;
  }
  .items__list.steps {
    padding: 0 var(--d-base) 0 calc(var(--d-base) * 2);
    list-style-type: disc;
  }
  .items__list.citations {
    border-top: var(--border-thin) solid var(--c-light-gray);
    padding: var(--d-small) var(--d-base) 0;
  }
  .items__list {
    margin: var(--d-small) 0;
    display: block;
    padding: 0 var(--d-base);
  }
  svg {
    fill: var(--c-text);
  }
  .items__listItem--followup {
    cursor: pointer;
    padding: 0 var(--d-xsmall);
    border-radius: var(--radius-base);
    border: var(--border-thin) solid var(--c-accent-high);
    margin: var(--d-xsmall);
    transition: background-color 0.3s ease-in-out;
  }
  .items__listItem--followup:hover,
  .items__listItem--followup:focus {
    background-color: var(--c-accent-light);
    cursor: pointer;
  }
  .items__listItem--citation {
    display: inline-block;
    background-color: var(--c-accent-light);
    border-radius: var(--radius-small);
    text-decoration: none;
    padding: var(--d-xsmall);
    margin-top: var(--d-xsmall);
    font-size: var(--font-small);
  }
  .items__listItem--citation.active {
    background-color: var(--c-accent-high);
  }
  .items__listItem--citation:not(first-child) {
    margin-left: var(--d-xsmall);
  }
  .items__link {
    text-decoration: none;
    color: var(--c-text);
  }
  .items__listItem--citation.active .items__link {
    color: var(--c-white);
  }
  .steps .items__listItem--step {
    padding: var(--d-xsmall) 0;
    font-size: var(--font-base);
    line-heigth: 1;
  }
  .followup .items__link {
    color: var(--c-accent-high);
    display: block;
    padding: var(--d-xsmall) 0;
    border-bottom: 1px solid var(--c-light-gray);
    font-size: var(--font-small);
  }
  .defaults__button {
    text-decoration: none;
    color: var(--c-text);
    display: block;
    font-size: var(--font-larger);
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
    padding: var(--d-small);
    border-radius: var(--radius-base);
    background: var(--c-white);
    margin: var(--d-xsmall);
    color: var(--c-text);
    justify-content: space-evenly;
    box-shadow: 0 0 var(--d-small) rgba(0, 0, 0, 0.1);
    border: var(--border-base) solid transparent;

    @media (min-width: 768px) {
      min-height: calc(var(--d-xlarge) * 2);
    }
  }
  .defaults__listItem:hover,
  .defaults__listItem:focus {
    color: var(--c-accent-dark);
    background: var(--c-secondary);
    transition: all 0.3s ease-in-out;
    border-color: var(--c-accent-high);
  }
  .defaults__span {
    color: var(--c-accent-high);
    font-weight: bold;
    display: block;
    margin-top: var(--d-base);
    text-decoration: underline;
  }
  .citation {
    background-color: var(--c-accent-light);
    border-radius: var(--radius-small);
    padding: var(--d-xsmall);
    margin-left: var(--d-xsmall);
  }
  .loading-text {
    display: flex;
    align-items: center;
  }
  .loading-skeleton {
    display: flex;
    margin-bottom: var(--d-xlarge);
  }
  .loading-icon svg {
    width: var(--d-large);
    height: var(--d-large);
    fill: var(--c-accent-light);
    animation: spinneranimation 1s linear infinite;
    margin-right: var(--d-small);
  }
  .not-recording svg {
    fill: var(--c-black);
  }
  .recording svg {
    fill: var(--c-red);
  }
`;
