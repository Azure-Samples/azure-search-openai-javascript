import { css } from 'lit';

export const loadingIndicatorStyles = css`
  @keyframes spinneranimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .loading-text {
    display: flex;
    align-items: center;
  }
  .loading-icon svg {
    width: 30px;
    height: 30px;
    fill: var(--accent-lighter);
    animation: spinneranimation 1s linear infinite;
    margin-right: 10px;
  }
`;
