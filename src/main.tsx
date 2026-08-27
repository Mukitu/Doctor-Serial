// Patch window.fetch descriptor to allow re-assignment if the environment has a getter-only fetch property.
try {
  const target = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  if (target) {
    const descriptor = Object.getOwnPropertyDescriptor(target, 'fetch');
    if (descriptor && !descriptor.set) {
      let customFetch = target.fetch;
      const originalGet = descriptor.get;
      Object.defineProperty(target, 'fetch', {
        get() {
          return customFetch || (originalGet ? originalGet.call(target) : undefined);
        },
        set(val) {
          customFetch = val;
        },
        configurable: true,
        enumerable: true
      });
    }
  }
} catch (err) {
  console.warn('Failed to patch fetch descriptor:', err);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
