import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>here goes the menu bar</p>
      </div>

      <div className={styles.center}>here goes the component</div>
    </main>
  );
}
