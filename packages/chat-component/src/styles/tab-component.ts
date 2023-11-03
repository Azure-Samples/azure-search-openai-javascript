import { css } from 'lit';

export const tabStyle = css`
  .tab-component__header {
    display: flex;
    justify-content: end;
  }
  .tab-component__list {
    display: flex;
    justify-content: space-around;
    list-style-type: none;
    padding: 20px 0;
  }
  .tab-component__link.active {
    border-bottom: 4px solid var(--accent-high);
  }
  .tab-component__link:not(.active):hover {
    border-bottom: 4px solid var(--accent-lighter);
    cursor: pointer;
  }
  .tab-component__link {
    border-bottom: 4px solid transparent;
    text-decoration: none;
    color: var(--text-color);
    font-weight: bold;
    font-size: small;
    cursor: pointer;
    display: block;
    padding: 10px;
  }
  .tab-component__content {
    position: relative;
  }
  .tab-component__tab {
    position: absolute;
    top: 0;
    left: 30px;
    display: none;

    @media (max-width: 1024px) {
      position: relative;
      left: 0;
    }
  }
  .tab-component__tab.active {
    display: block;
  }
  .tab-component__paragraph {
    font-family: monospace;
    font-size: large;
    border: 1px solid var(--accent-light);
    padding: 20px;
    border-radius: 25px;
  }
  .citation {
    background-color: var(--accent-lighter);
    border-radius: 3px;
    padding: 3px;
    margin-left: 3px;
  }
  .items__listItem--citation {
    display: inline-block;
    background-color: var(--accent-lighter);
    border-radius: 5px;
    text-decoration: none;
    padding: 5px;
    margin-top: 5px;
    font-size: small;
  }
  .items__listItem--citation:not(first-child) {
    margin-left: 5px;
  }
  .items__link {
    text-decoration: none;
    color: var(--text-color);
  }
`;
