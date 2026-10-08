/**
 * Fetches an HTML fragment and injects it into #elementId.
 * Shared by loader.js (index.html) and catalog.page.js (pages/catalog.html).
 *
 * Paths are relative to the PAGE that is open, not to this file:
 *   from index.html         -> 'pages/cart_modal.html'
 *   from pages/catalog.html -> 'product_modal.html'
 *
 * @param {string} elementId
 * @param {string} filePath
 */
export async function loadSection(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Could not load ${filePath}: ${response.status}`);
        }
        const html = await response.text();
        const container = document.getElementById(elementId);

        if (container) {
            container.innerHTML = html;
        } else {
            console.warn(`Container #${elementId} does not exist in the DOM.`);
        }
    } catch (error) {
        console.error('Fragment injection failed:', error);
    }
}
