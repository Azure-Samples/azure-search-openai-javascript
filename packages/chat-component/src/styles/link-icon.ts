import { css } from 'lit';

export const styles = css`
  a svg {
    width: calc(var(--width-base) - var(--d-small));
    height: calc(var(--width-base) - var(--d-small));
    position: relative;
    z-index: 1;
  }
  a {
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
  a::after {
    content: '';
    border-radius: calc(var(--radius-large) * 3);
    width: calc(var(--width-base) - var(--d-small));
    height: calc(var(--width-base) - var(--d-small));
    position: absolute;
    background-color: var(--c-secondary);
  }
`;
