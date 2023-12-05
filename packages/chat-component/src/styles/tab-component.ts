import { css } from 'lit';

export const styles = css`
  .tab-component__list {
    list-style-type: none;
    display: flex;
    box-shadow: var(--shadow);
    border-radius: var(--radius-base);
    padding: var(--d-xsmall);
    width: 450px;
    margin: 0 auto;
    justify-content: space-evenly;
  }
  .tab-component__listItem {
    width: 33%;
    text-align: center;
  }
  .tab-component__link.active {
    background: linear-gradient(to left, var(--c-accent-light), var(--c-accent-high));
    color: var(--c-white);
  }
  .tab-component__link:not(.active):hover {
    background: var(--c-light-gray);
    cursor: pointer;
  }
  .tab-component__link {
    border-bottom: 4px solid transparent;
    border-radius: var(--radius-small);
    text-decoration: none;
    color: var(--text-color);
    font-weight: bold;
    font-size: var(--font-small);
    cursor: pointer;
    display: block;
    padding: var(--d-small);
  }
  .tab-component__content {
    position: relative;
  }
  .tab-component__tab {
    position: absolute;
    top: 0;
    left: 30px;
    display: none;
    width: 100%;
    @media (max-width: 1024px) {
      position: relative;
      left: 0;
    }
  }
  .tab-component__tab.active {
    display: block;
  }
`;
