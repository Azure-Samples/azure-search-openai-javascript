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
    width: 30px;
    height: 30px;
    fill: var(--accent-lighter);
    animation: spinneranimation 1s linear infinite;
    margin-right: 10px;
  }
`;
