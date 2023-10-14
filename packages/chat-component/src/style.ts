import { css } from 'lit';

export const mainStyle = css`
  :host {
    width: 100vw;
    display: block;
    padding: 16px;
    --secondary-color: #f8fffd;
    --text-color: #123f58;
    --primary-color: rgba(241, 255, 165, 0.6);
    --white: #fff;
    --light-gray: #e3e3e3;
    --dark-gray: #4e5288;
    --accent-high: #8cdef2;
    --accent-dark: #002b23;
    --accent-light: #e6fbf7;
    --accent-lighter: rgba(140, 222, 242, 0.4);
    --error-color: #8a0000;
  }
  :host(.dark) {
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
    --accent-lighter: rgba(140, 222, 242, 0.4);
    --error-color: #8a0000;
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
  @keyframes chatloadinganimation {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
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
    background: var(--accent-dark);
    z-index: 1;
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
  .display-flex {
    display: flex;
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
    font-size: 1.5rem;
    padding: 0;
    margin: 0;
  }
  .subheadline {
    color: var(--text-color);
    font-size: 1.2rem;
    padding: 0;
    margin: 0;
  }
  .subheadline--small {
    font-size: 12px;
    text-transform: uppercase;
    text-decoration: underline;
  }
  .chat__container {
    min-width: 100%;
    transition: width 0.3s ease-in-out;
    max-height: 100vh;
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
      z-index: 2;
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
    background: var(--accent-light);
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
    display: flex;
    justify-content: space-around;
    list-style-type: none;
    padding: 20px 0;
  }
  .aside__link.active {
    border-bottom: 4px solid var(--accent-high);
  }
  .aside__link:not(.active):hover {
    border-bottom: 4px solid var(--accent-light);
    cursor: pointer;
  }
  .aside__link {
    border-bottom: 4px solid transparent;
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
    border: 1px solid var(--accent-light);
    padding: 20px;
    border-radius: 25px;
  }
  .chat__header {
    display: flex;
    justify-content: flex-end;
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
  }
  .chat__header--button:disabled,
  .chatbox__button:disabled,
  .chatbox__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chat__header--span {
    margin-right: 5px;
    text-align: left;
    font-size: smaller;
  }
  .chatbox__container {
    position: relative;
    height: 50px;
  }
  .chatbox__button {
    background: var(--accent-high);
    border: none;
    color: var(--text-color);
    font-weight: bold;
    cursor: pointer;
    border-radius: 4px;
    margin-left: 8px;
    width: 80px;
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
  .chatbox__input {
    border: 1px solid var(--accent-high);
    background: var(--white);
    color: var(--text-color);
    border-radius: 4px;
    padding: 8px;
    flex: 1 1 auto;
    font-size: 1rem;
  }
  .chat__list {
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    padding: 0;
    margin-bottom: 50px;
  }
  .chat__listItem {
    max-width: 80%;
    min-width: 70%;
    display: flex;
    flex-direction: column;
    height: auto;
  }
  .chat__txt {
    animation: chatmessageanimation 0.5s ease-in-out;
    background-color: var(--secondary-color);
    color: var(--text-color);
    border-radius: 10px;
    margin-top: 8px;
    padding: 20px;
    word-wrap: break-word;
    margin-block-end: 0;
    position: relative;
  }
  .chat__txt.error {
    background-color: var(--error-color);
    color: var(--white);
  }
  .chat__txt.user-message {
    background-color: var(--accent-high);
  }
  .chat__listItem.user-message {
    align-self: flex-end;
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
  .items__list.followup {
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
  .items__list.steps {
    display: block;
  }
  .items__listItem--followup {
    cursor: pointer;
    color: var(--dark-gray);
  }
  .items__listItem--citation {
    display: inline-block;
    background-color: var(--accent-lighter);
    border-radius: 5px;
    text-decoration: none;
    padding: 5px;
    font-size: small;
  }
  .items__listItem--citation:not(first-child) {
    margin-left: 5px;
  }
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
  .steps .items__listItem--step {
    padding: 5px 0;
    border-bottom: 1px solid var(--light-gray);
  }
  .followup .items__link {
    color: var(--dark-gray);
    display: block;
    padding: 5px 0;
    border-bottom: 1px solid var(--light-gray);
  }
  .defaults__button {
    text-decoration: none;
    color: var(--text-color);
    display: block;
  }
  .defaults__list {
    list-style-type: none;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
  }
  .defaults__list.always-row {
    text-align: left;
  }
  .defaults__list:not(.always-row) {
    @media (min-width: 1200px) {
      flex-direction: row;
    }
  }
  .defaults__listItem {
    padding: 10px;
    border-radius: 10px;
    border: 1px solid var(--accent-high);
    background: var(--secondary-color);
    margin: 4px;
    color: var(--text-color);
    justify-content: space-evenly;

    @media (min-width: 768px) {
      min-height: 100px;
    }
  }
  .defaults__listItem:hover,
  .defaults__listItem:focus {
    color: var(--accent-dark);
    background: var(--accent-light);
    transition: all 0.3s ease-in-out;
  }
  .defaults__span {
    font-weight: bold;
    display: block;
    margin-top: 20px;
    text-decoration: underline;
  }
  .loading-skeleton {
    display: flex;
    margin-bottom: 50px;
  }
  .dot {
    width: 10px;
    height: 10px;
    margin: 0 5px;
    background-color: var(--accent-high);
    border-radius: 50%;
    animation: chatloadinganimation 1.5s infinite;
  }
  .dot:nth-child(2) {
    animation-delay: 0.5s;
  }
  .dot:nth-child(3) {
    animation-delay: 1s;
  }
`;
