/**
 * @param {string} elementId
 * @param {string} filePath
 */
import { loadSection } from "./utils/fragments.js";

async function buildOnePage() {
  await Promise.all([
    loadSection("navbar-container", "pages/navbar.html"),
    loadSection("gaming-container", "pages/carousel.html"),
    loadSection("pro-container", "pages/carousel.html"),
    loadSection("footer-container", "pages/footer.html"),
    loadSection("product-detail-container", "pages/detail_modal.html"),
    loadSection("cart-container", "pages/cart_modal.html"),
  ]);

  document.dispatchEvent(new CustomEvent("onLayoutLoaded"));
}

document.addEventListener("DOMContentLoaded", buildOnePage);
