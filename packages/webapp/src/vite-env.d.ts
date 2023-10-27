/// <reference types="vite/client" />

import type React, { type DOMAttributes } from 'react';
import { type ChatComponent } from '@azure/chat';

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any } & HTMLElement & HTMLAttributes<HTMLElement>>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['azc-chat']: CustomElement<ChatComponent>;
      ['chat-component']: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
