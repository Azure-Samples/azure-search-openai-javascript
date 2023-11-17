import { css } from 'lit';

export const styles = css`
  button {
    color: var(--text-color);
    font-weight: bold;
    margin-left: 8px;
    background: transparent;
    transition: background 0.3s ease-in-out;
    box-shadow: none;
    border: none;
    cursor: pointer;
    width: 50px;
    height: 100%;
  }
  button:hover,
  button:focus {
    background: var(--secondary-color);
  }
  button:hover svg,
  button:focus svg {
    opacity: 0.8;
  }
  .not-recording svg {
    fill: var(--black);
  }
  .recording svg {
    fill: var(--red);
  }
`;
