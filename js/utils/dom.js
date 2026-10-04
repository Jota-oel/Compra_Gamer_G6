/**
 * Resolves with the first element matching `selector`, even if it is injected later
 * (e.g. by loader.js). Makes page scripts independent of the loader's timing.
 */
export function when_ready(selector, root = document) {
  return new Promise((resolve) => {
    const found = root.querySelector(selector);
    if (found) return resolve(found);
    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (!el) return;
      observer.disconnect();
      resolve(el);
    });
    observer.observe(root.documentElement ?? root, { childList: true, subtree: true });
  });
}