import { css } from 'lit';

export const styles = css`
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
    cursor: pointer;
  }
  .chat__header--button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    word-wrap: nowrap;
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
`;
