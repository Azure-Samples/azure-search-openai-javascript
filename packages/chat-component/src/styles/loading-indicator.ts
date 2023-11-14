import { css } from 'lit';

export const loadingIndicatorStyles = css`
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
