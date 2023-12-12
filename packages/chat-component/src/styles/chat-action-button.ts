import { css } from 'lit';

export const styles = css`
  button {
    color: var(--text-color);
    text-decoration: underline;
    border: var(--border-thin) solid var(--c-accent-dark);
    text-decoration: none;
    border-radius: var(--radius-small);
    background: var(--c-white);
    display: flex;
    align-items: center;
    margin-left: 5px;
    opacity: 1;
    padding: var(--d-xsmall);
    transition: all 0.3s ease-in-out;
    position: relative;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  span {
    font-size: smaller;
    transition: all 0.3s ease-out 0s;
    position: absolute;
    text-align: right;
    top: -80%;
    background: var(--c-accent-dark);
    color: var(--c-white);
    opacity: 0;
    right: 0;
    padding: var(--d-xsmall) var(--d-small);
    border-radius: var(--radius-small);
    font-weight: bold;
    word-wrap: nowrap;
  }
  span::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: var(--border-thick) solid var(--c-accent-dark);
    bottom: -8px;
    right: 5px;
  }
  svg {
    fill: currentColor;
    padding: var(--d-xsmall);
    width: var(--d-base);
    height: var(--d-base);
  }
  button:hover > span,
  button:focus > span {
    display: inline-block;
    opacity: 1;
  }
  button:hover,
  button:focus,
  button:hover > svg,
  button:focus > svg {
    background-color: var(--c-light-gray);
    border-radius: var(--radius-small);
    transition: background 0.3s ease-in-out;
  }
`;
