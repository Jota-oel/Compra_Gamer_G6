export async function loadSection(elementId, filePath) {
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
    console.error("Error de inyección:", error);
  }
}
