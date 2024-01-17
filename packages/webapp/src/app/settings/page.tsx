import styles from './settingspage.module.css';

export default function SettingsPage() {
  return (
    <>
      <main className={styles.main}>
        <h1>Settings</h1>
        <form>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="title">
              Title
            </label>
            <input type="text" id="title" placeholder="Title" defaultValue="Ask anything or try an example" />
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="theme">
              Theme
            </label>
            <select id="theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="interaction-model">
              Interaction model
            </label>
            <select id="interaction-model">
              <option value="chat">Chat</option>
              <option value="search">Search</option>
            </select>
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="approach">
              Approach
            </label>
            <select id="approach">
              <option value="rrr">RRR</option>
              <option value="rr">RR</option>
              <option value="r">R</option>
            </select>
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="overrides">
              Overrides
            </label>
            <textarea id="overrides" placeholder="Overrides" rows={10} cols={50}></textarea>
          </div>
          <div className={styles.formgroupinline}>
            <label htmlFor="custom-branding">Custom branding</label>
            <input type="checkbox" id="custom-branding" name="custom-branding" value="true" />
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="input-position">
              Input position
            </label>
            <select id="input-position">
              <option value="sticky">Sticky</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="retrieval-mode">
              Retrieval mode
            </label>
            <select id="retrieval-mode">
              <option value="hybrid">Hybrid</option>
              <option value="vectors">Vectors</option>
              <option value="text">Text</option>
            </select>
          </div>
          <div className={styles.formgroup}>
            <label className={styles.label} htmlFor="max-results">
              Max results
            </label>
            <input type="number" placeholder="Max results" min="1" max="20" defaultValue={20} />
          </div>
          <div className={styles.formgroupinline}>
            <label htmlFor="stream-results">Stream results</label>
            <input type="checkbox" id="stream-results" name="stream-results" value="true" />
          </div>
          <div className={styles.buttonwrapper}>
            <button className={styles.button} type="submit">
              Save
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
