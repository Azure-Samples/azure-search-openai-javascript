'use client';
import styles from './page.module.css';
import 'chat-component';
// mport { useState, useRef } from 'react';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'chat-component': {
        title: string;
      };
    }
  }
}

export const enum RetrievalMode {
  Hybrid = 'hybrid',
  Vectors = 'vectors',
  Text = 'text',
}

export default function Home() {
  const ChatComponent = 'chat-component';

  return (
    <>
      <main className={styles.main}>
        <aside>
          <div className={styles.sidebar}>sidebar goes here</div>
        </aside>
        <div className={styles.description}>menu bar goes here</div>
        <ChatComponent
          title="Ask anything or try an example"
          data-input-position="sticky"
          data-interaction-model="chat"
          data-use-stream="true"
          data-approach="rrr"
          data-overrides=""
          data-custom-styles=""
          data-custom-branding="true"
          data-theme="light"
        ></ChatComponent>
      </main>
    </>
  );
}
