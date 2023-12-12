import { css } from 'lit';

export const styles = css`
  .subheadline--small {
    font-size: 12px;
    display: inline-block;
  }
  .items__list {
    border-top: none;
    padding: 0 var(--d-base);
    margin: var(--d-small) 0;
    display: block;
  }
  .items__listItem {
    display: inline-block;
    background-color: var(--c-accent-light);
    border-radius: var(--radius-small);
    text-decoration: none;
    padding: var(--d-xsmall);
    margin-top: 5px;
    font-size: var(--font-small);
  }
  .items__listItem.active {
    background-color: var(--c-accent-high);
  }
  .items__listItem:not(first-child) {
    margin-left: 5px;
  }
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
  .items__listItem.active .items__link {
    color: var(--c-white);
  }
`;
