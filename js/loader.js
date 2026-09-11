/**
 * @param {string} elementId
 * @param {string} filePath
 */
async function loadSection(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Error al cargar ${filePath}: ${response.status}`);
        }
        const html = await response.text();
        const container = document.getElementById(elementId);

        if (container) {
            container.innerHTML = html;
        } else {
            console.warn(`El contenedor #${elementId} no existe en el DOM.`);
        }
    } catch (error) {
        console.error('Error de inyección:', error);
    }
}

async function buildOnePage() {
    await Promise.all([
        loadSection('navbar-container', 'pages/navbar.html'),
        loadSection('gaming-container', 'pages/gaming.html'),
        loadSection('pro-container', 'pages/office.html'),
        loadSection('footer-container', 'pages/footer.html')
    ]);

    document.dispatchEvent(new CustomEvent('onLayoutLoaded'));
}

document.addEventListener('DOMContentLoaded', buildOnePage);