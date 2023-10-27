/// <reference types="vite/client" />

import { type DOMAttributes } from 'react';
import { type ChatComponent } from '@azure/chat';

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any } & HTMLElement & HTMLAttributes<HTMLElement>>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['azc-chat']: CustomElement<ChatComponent>;
    }
  }
}
