import { css } from 'lit';

export const styles = css`
  .headline {
    color: var(--text-color);
    font-size: var(--font-r-large);
    padding: 0;
    margin: var(--d-small) 0 var(--d-large);

    @media (min-width: 1024px) {
      font-size: var(--font-r-base);
      text-align: center;
    }
  }
  [role='button'] {
    text-decoration: none;
    color: var(--text-color);
    display: block;
    font-size: var(--font-rel-base);
  }
  .teaser-list {
    list-style-type: none;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .teaser-list.always-row {
    text-align: left;
  }
  .teaser-list:not(.always-row) {
    @media (min-width: 1024px) {
      flex-direction: row;
    }
  }
  .teaser-list-item {
    padding: var(--d-small);
    border-radius: var(--radius-base);
    background: var(--c-white);
    margin: var(--d-xsmall);
    color: var(--text-color);
    justify-content: space-evenly;
    box-shadow: var(--shadow);
    border: var(--border-base) solid transparent;

    @media (min-width: 768px) {
      min-height: 100px;
    }
  }
  .teaser-list-item:hover,
  .teaser-list-item:focus {
    color: var(--c-accent-dark);
    background: var(--c-secondary);
    transition: all 0.3s ease-in-out;
    border-color: var(--c-accent-high);
  }
  .teaser-list-item .teaser-click-label {
    color: var(--c-accent-high);
    font-weight: bold;
    display: block;
    margin-top: 20px;
    text-decoration: underline;
  }
`;
