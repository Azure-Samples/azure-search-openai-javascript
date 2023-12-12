import { css } from 'lit';

export const styles = css`
  ul {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  @keyframes chatmessageanimation {
    0% {
      opacity: 0.5;
      top: 150px;
    }
    100% {
      opacity: 1;
      top: 0;
    }
  }
  .chat__header--button {
    display: flex;
    align-items: center;
  }
  .chat__header {
    display: flex;
    align-items: top;
    justify-content: flex-end;
    padding: var(--d-base);
  }
  .chat__header--button {
    margin-right: var(--d-base);
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
    height: calc(var(--d-large) + var(--d-base));
  }
  .chat__listItem {
    max-width: var(--width-wide);
    min-width: var(--width-base);
    display: flex;
    flex-direction: column;
    height: auto;

    @media (min-width: 768px) {
      max-width: 55%;
      min-width: var(--width-narrow);
    }
  }
  .chat__txt {
    animation: chatmessageanimation 0.5s ease-in-out;
    background-color: var(--c-secondary);
    color: var(--text-color);
    border-radius: var(--radius-base);
    margin-top: 8px;
    word-wrap: break-word;
    margin-block-end: 0;
    position: relative;
    box-shadow: var(--shadow);
    border: var(--border-thin) solid var(--c-light-gray);
  }
  .chat__txt.error {
    border: var(--border-base) solid var(--error-color);
    color: var(--error-color);
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
    padding: 0 var(--d-base);
  }
  .chat__txt--info {
    font-size: smaller;
    font-style: italic;
    margin: 0;
    margin-top: var(--border-thin);
  }
  .user-message .chat__txt--info {
    text-align: right;
  }
  .items__listWrapper {
    border-top: var(--border-thin) solid var(--c-light-gray);
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
    fill: var(--text-color);
  }
  .items__list.followup {
    display: flex;
    flex-direction: row;
    padding: var(--d-base);
    list-style-type: none;
    flex-wrap: wrap;
  }
  .items__list.steps {
    padding: 0 var(--d-base) 0 var(--d-xlarge);
    list-style-type: disc;
  }
  .chat__citations {
    border-top: var(--border-thin) solid var(--c-light-gray);
  }
  .items__list {
    margin: var(--d-small) 0;
    display: block;
    padding: 0 var(--d-base);
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
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
  .steps .items__listItem--step {
    padding: var(--d-xsmall) 0;
    font-size: var(--font-base);
    line-height: 1;
  }
  .followup .items__link {
    color: var(--c-accent-high);
    display: block;
    padding: var(--d-xsmall) 0;
    border-bottom: var(--border-thin) solid var(--c-light-gray);
    font-size: var(--font-small);
  }
  .citation {
    background-color: var(--c-accent-light);
    border-radius: 3px;
    padding: calc(var(--d-small) / 5);
    margin-left: 3px;
  }
`;
