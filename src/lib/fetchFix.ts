// Fix for "Uncaught TypeError: Cannot set property fetch of #<Window> which has only a getter"
// In certain browser environments / sandboxed frames, window.fetch is configured as a getter-only property on Window.
// When third-party libraries (e.g. formdata-polyfill, gaxios, node-fetch polyfills) attempt to assign window.fetch or globalThis.fetch,
// JavaScript throws a TypeError. Defining a getter and setter on window directly safely intercepts assignments.

(function () {
  try {
    if (typeof window !== 'undefined' && window.fetch) {
      let activeFetch = window.fetch.bind(window);
      Object.defineProperty(window, 'fetch', {
        get() {
          return activeFetch;
        },
        set(newFetch) {
          if (typeof newFetch === 'function') {
            activeFetch = newFetch;
          }
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (err) {
    console.warn('Fetch property setter patch notice:', err);
  }
})();

export {};
