import { Example } from './Example.jsx';

import styles from './Example.module.css';

export type ExampleModel = {
  text: string;
  value: string;
};

const EXAMPLES: ExampleModel[] = [
  {
    text: "What happens if the rental doesn't fit the description?",
    value: "What happens if the rental doesn't fit the description?",
  },
  { text: 'What is the refund policy?', value: 'What is the refund policy?' },
  { text: 'How to contact a representative?', value: 'How to contact a representative?' },
];

interface Props {
  onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
  return (
    <ul className={styles.examplesNavList}>
      {EXAMPLES.map((x, i) => (
        <li key={i}>
          <Example text={x.text} value={x.value} onClick={onExampleClicked} />
        </li>
      ))}
    </ul>
  );
};
