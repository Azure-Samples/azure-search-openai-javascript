import { css } from 'lit';

export const styles = css`
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
