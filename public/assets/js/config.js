// =============================
// Configuración y utilidades para sitio estático
// =============================

// =============================
// Funciones de utilidad para imágenes
// =============================

/**
 * Construye la URL completa para una imagen de Strapi (solo para datos ya pre-cargados)
 * @param {string} imageUrl - URL de la imagen desde Strapi
 * @param {string} size - Tamaño de imagen (thumbnail, small, medium, large)
 * @returns {string} URL completa de la imagen
 */
function getStrapiImageUrl(imageUrl, size = 'medium') {
  if (!imageUrl) return '/assets/images/propiedad-default.jpg';
  
  // Si la URL ya es completa, la devolvemos
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Construir URL completa con el dominio de Strapi
  const STRAPI_BASE_URL = 'https://truthful-rhythm-e8bcafa766.strapiapp.com';
  return `${STRAPI_BASE_URL}${imageUrl}?format=${size}`;
}

/**
 * Formatea el precio en UF con separadores de miles
 * @param {number} precio - Precio en UF (número)
 * @returns {string} Precio formateado (ej: "UF 25.000")
 */
function formatearPrecio(precio) {
  if (!precio) return 'UF 0';
  return `UF ${precio.toLocaleString('es-CL')}`;
}

/**
 * Obtiene la URL de la primera imagen de una propiedad
 * @param {Object} propiedad - Objeto de propiedad de Strapi
 * @returns {string} URL de la imagen
 */
function getPrimeraImagen(propiedad) {
  // Manejar formato con attributes (Strapi v4)
  if (propiedad.attributes?.Imagenes?.data?.length > 0) {
    const imagen = propiedad.attributes.Imagenes.data[0];
    return getStrapiImageUrl(imagen.attributes.url);
  }
  
  // Manejar formato simplificado
  if (propiedad.Imagenes?.length > 0) {
    const imagen = propiedad.Imagenes[0];
    return getStrapiImageUrl(imagen.url || imagen);
  }
  
  return '/assets/images/propiedad-default.jpg';
}

/**
 * Obtiene todas las imágenes de una propiedad
 * @param {Object} propiedad - Objeto de propiedad de Strapi
 * @returns {Array} Array de URLs de imágenes
 */
function getTodasImagenes(propiedad) {
  // Manejar formato con attributes (Strapi v4)
  if (propiedad.attributes?.Imagenes?.data) {
    return propiedad.attributes.Imagenes.data.map(imagen => 
      getStrapiImageUrl(imagen.attributes.url, 'large')
    );
  }
  
  // Manejar formato simplificado
  if (propiedad.Imagenes?.length > 0) {
    return propiedad.Imagenes.map(imagen => 
      getStrapiImageUrl(imagen.url || imagen, 'large')
    );
  }
  
  return ['/assets/images/propiedad-default.jpg'];
}

// =============================
// Funciones de utilidad para números y fechas
// =============================

/**
 * Formatea números grandes con separadores de miles
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado
 */
function formatearNumero(numero) {
  if (!numero) return '0';
  return numero.toLocaleString('es-CL');
}

/**
 * Trunca texto a un número determinado de caracteres
 * @param {string} texto - Texto a truncar
 * @param {number} limite - Número máximo de caracteres
 * @returns {string} Texto truncado
 */
function truncarTexto(texto, limite = 100) {
  if (!texto || texto.length <= limite) return texto;
  return texto.substring(0, limite).trim() + '...';
}

// =============================
// Exportar funciones globales
// =============================
window.StrapiUtils = {
  getStrapiImageUrl,
  formatearPrecio,
  getPrimeraImagen,
  getTodasImagenes,
  formatearNumero,
  truncarTexto
};

// También exportar individualmente para compatibilidad
window.getStrapiImageUrl = getStrapiImageUrl;
window.formatearPrecio = formatearPrecio;
window.getPrimeraImagen = getPrimeraImagen;
window.getTodasImagenes = getTodasImagenes;

console.log('✅ Utilidades estáticas cargadas correctamente - Sin configuración de API'); 