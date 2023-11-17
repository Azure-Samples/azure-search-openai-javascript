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
      top: 0px;
    }
  }
  .chat__header {
    display: flex;
    justify-content: flex-end;
    padding: 20px;
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
    fill: var(--text-color);
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
  .chat__citations {
    border-top: 1px solid var(--light-gray);
  }
  .items__list {
    margin: 10px 0;
    display: block;
    padding: 0 20px;
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
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
  .steps .items__listItem--step {
    padding: 5px 0;
    font-size: 14px;
    line-height: 1;
  }
  .followup .items__link {
    color: var(--accent-high);
    display: block;
    padding: 5px 0;
    border-bottom: 1px solid var(--light-gray);
    font-size: small;
  }
  .citation {
    background-color: var(--accent-lighter);
    border-radius: 3px;
    padding: 2px;
    margin-left: 3px;
  }
`;
