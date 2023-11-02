import { css } from 'lit';

export const teaserListStyle = css`
  .teaser-list__button {
    text-decoration: none;
    color: var(--text-color);
    display: block;
    font-size: 1.2rem;
  }
  .teaser-list__list {
    list-style-type: none;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .teaser-list__list.always-row {
    text-align: left;
  }
  .teaser-list__list:not(.always-row) {
    @media (min-width: 1200px) {
      flex-direction: row;
    }
  }
  .teaser-list__listItem {
    padding: 10px;
    border-radius: 10px;
    background: var(--white);
    margin: 4px;
    color: var(--text-color);
    justify-content: space-evenly;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    @media (min-width: 768px) {
      min-height: 100px;
    }
  }
  .teaser-list__listItem:hover,
  .teaser-list__listItem:focus {
    color: var(--accent-dark);
    background: var(--secondary-color);
    transition: all 0.3s ease-in-out;
  }
  .teaser-list__span {
    color: var(--accent-high);
    font-weight: bold;
    display: block;
    margin-top: 20px;
    text-decoration: underline;
  }
`;
