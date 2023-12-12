import { css } from 'lit';

export const styles = css`
  @keyframes spinneranimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  p {
    display: flex;
    align-items: center;
  }
  svg {
    width: var(--d-large);
    height: 30px;
    fill: var(--c-accent-light);
    animation: spinneranimation 1s linear infinite;
    margin-right: 10px;
  }
`;
