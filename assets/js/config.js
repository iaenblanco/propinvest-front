// =============================
// Configuración de la API de Strapi
// =============================

const STRAPI_CONFIG = {
  // URL base de la API de Strapi
  API_BASE_URL: 'https://truthful-rhythm-e8bcafa766.strapiapp.com/api',
  
  // Endpoints específicos (usando mayúscula en los campos)
  ENDPOINTS: {
    PROPIEDADES: '/propiedads',
    PROPIEDAD_BY_SLUG: '/propiedads?filters[Slug][$eq]=',
    PROPIEDADES_DESTACADAS: '/propiedads?filters[Destacado][$eq]=true&filters[Publicado][$eq]=true',
    PROPIEDADES_PUBLICADAS: '/propiedads?filters[Publicado][$eq]=true'
  },
  
  // Configuración de imágenes
  IMAGE_CONFIG: {
    // URL base para las imágenes de Strapi
    BASE_URL: 'https://truthful-rhythm-e8bcafa766.strapiapp.com',
    // Tamaños de imagen disponibles
    SIZES: {
      thumbnail: 'thumbnail',
      small: 'small',
      medium: 'medium',
      large: 'large'
    }
  }
};

// =============================
// Funciones de utilidad para la API
// =============================

/**
 * Construye la URL completa para una imagen de Strapi
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
  
  // Construir URL completa con el tamaño especificado
  return `${STRAPI_CONFIG.IMAGE_CONFIG.BASE_URL}${imageUrl}?format=${size}`;
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
  if (!propiedad.attributes.Imagenes || !propiedad.attributes.Imagenes.data || propiedad.attributes.Imagenes.data.length === 0) {
    return '/assets/images/propiedad-default.jpg';
  }
  
  const primeraImagen = propiedad.attributes.Imagenes.data[0];
  return getStrapiImageUrl(primeraImagen.attributes.url);
}

/**
 * Obtiene todas las imágenes de una propiedad
 * @param {Object} propiedad - Objeto de propiedad de Strapi
 * @returns {Array} Array de URLs de imágenes
 */
function getTodasImagenes(propiedad) {
  if (!propiedad.attributes.Imagenes || !propiedad.attributes.Imagenes.data) {
    return ['/assets/images/propiedad-default.jpg'];
  }
  
  return propiedad.attributes.Imagenes.data.map(imagen => 
    getStrapiImageUrl(imagen.attributes.url, 'large')
  );
}

// =============================
// Validación de configuración
// =============================

// Verificar que las URLs estén configuradas correctamente
console.log('✅ Configuración de Strapi cargada correctamente');
console.log('🌐 API URL:', STRAPI_CONFIG.API_BASE_URL);
console.log('🖼️ Imágenes URL:', STRAPI_CONFIG.IMAGE_CONFIG.BASE_URL);

// Exportar configuración y funciones
window.STRAPI_CONFIG = STRAPI_CONFIG;
window.StrapiUtils = {
  getStrapiImageUrl,
  formatearPrecio,
  getPrimeraImagen,
  getTodasImagenes
}; 