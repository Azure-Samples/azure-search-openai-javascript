import { css } from 'lit';

export const tabStyle = css`
  .tab-component__header {
    display: flex;
    justify-content: end;
  }
  .tab-component__list {
    list-style-type: none;
    display: flex;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 10px;
    border-radius: 10px;
    padding: 3px;
    width: 450px;
    margin: 0 auto;
    justify-content: space-evenly;
  }
  .tab-component__listItem {
    width: 33%;
    text-align: center;
  }
  .tab-component__link.active {
    background: linear-gradient(to left, var(--accent-contrast), var(--accent-high));
    color: var(--white);
  }
  .tab-component__link:not(.active):hover {
    background: var(--light-gray);
    cursor: pointer;
  }
  .tab-component__link {
    border-bottom: 4px solid transparent;
    border-radius: 5px;
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
  .tab-component__content .items__list.citations {
    border-top: 0;
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
  .tab-component__paragraph {
    font-family: monospace;
    font-size: large;
    border: 1px solid var(--light-gray);
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
  .defaults__list {
    list-style-type: none;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .defaults__list.always-row {
    text-align: left;
  }
  .defaults__list:not(.always-row) {
    @media (min-width: 1024px) {
      flex-direction: row;
    }
  }
  .defaults__listItem {
    padding: 10px;
    border-radius: 10px;
    background: var(--white);
    margin: 4px;
    color: var(--text-color);
    justify-content: space-evenly;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border: 3px solid transparent;

    @media (min-width: 768px) {
      min-height: 100px;
    }
  }
  .defaults__listItem:hover,
  .defaults__listItem:focus {
    color: var(--accent-dark);
    background: var(--secondary-color);
    transition: all 0.3s ease-in-out;
    border-color: var(--accent-high);
  }
`;
