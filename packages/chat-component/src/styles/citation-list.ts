import { css } from 'lit';

export const styles = css`
  .subheadline--small {
    font-size: 12px;
    display: inline-block;
  }
  .items__list {
    border-top: none;
    padding: 0px 20px;
    margin: 10px 0;
    display: block;
  }
  .items__listItem {
    display: inline-block;
    background-color: var(--accent-lighter);
    border-radius: 5px;
    text-decoration: none;
    padding: 5px;
    margin-top: 5px;
    font-size: small;
  }
  .items__listItem.active {
    background-color: var(--accent-high);
  }
  .items__listItem:not(first-child) {
    margin-left: 5px;
  }
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
  .items__listItem.active .items__link {
    color: var(--white);
  }
`;
