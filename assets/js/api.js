// =============================
// API Service para Strapi
// =============================

class StrapiAPI {
  constructor() {
    this.baseURL = STRAPI_CONFIG.API_BASE_URL;
  }

  /**
   * Realiza una petición a la API de Strapi
   * @param {string} endpoint - Endpoint específico
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise} Respuesta de la API
   */
  async fetchAPI(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al conectar con Strapi:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las propiedades publicadas
   * @returns {Promise<Array>} Array de propiedades
   */
  async getPropiedades() {
    try {
      const response = await this.fetchAPI(STRAPI_CONFIG.ENDPOINTS.PROPIEDADES_PUBLICADAS);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      return [];
    }
  }

  /**
   * Obtiene propiedades destacadas
   * @returns {Promise<Array>} Array de propiedades destacadas
   */
  async getPropiedadesDestacadas() {
    try {
      const response = await this.fetchAPI(STRAPI_CONFIG.ENDPOINTS.PROPIEDADES_DESTACADAS);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener propiedades destacadas:', error);
      return [];
    }
  }

  /**
   * Obtiene una propiedad específica por slug
   * @param {string} slug - Slug de la propiedad
   * @returns {Promise<Object|null>} Propiedad encontrada o null
   */
  async getPropiedadBySlug(slug) {
    try {
      const response = await this.fetchAPI(`${STRAPI_CONFIG.ENDPOINTS.PROPIEDAD_BY_SLUG}${slug}`);
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error al obtener propiedad por slug:', error);
      return null;
    }
  }

  /**
   * Obtiene una propiedad por ID
   * @param {number} id - ID de la propiedad
   * @returns {Promise<Object|null>} Propiedad encontrada o null
   */
  async getPropiedadById(id) {
    try {
      const response = await this.fetchAPI(`${STRAPI_CONFIG.ENDPOINTS.PROPIEDADES}/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('Error al obtener propiedad por ID:', error);
      return null;
    }
  }
}

// =============================
// Funciones para renderizar propiedades
// =============================

/**
 * Crea el HTML de una tarjeta de propiedad
 * @param {Object} propiedad - Objeto de propiedad de Strapi
 * @returns {string} HTML de la tarjeta
 */
function crearTarjetaPropiedad(propiedad) {
  const imagen = getPrimeraImagen(propiedad);
  const precio = formatearPrecio(propiedad.Precio);
  // Aseguramos que el slug no tenga espacios ni caracteres extraños
  const slug = propiedad.Slug ? propiedad.Slug.replace(/\s+/g, '-').toLowerCase() : 'sin-slug';
  return `
    <article class="property-card">
      <img src="${imagen}" alt="${propiedad.Titulo}" />
      <div class="property-card-content">
        <h2 class="property-title">${propiedad.Titulo}</h2>
        <div class="property-location">${propiedad.Ubicacion}</div>
        <div class="property-price">${precio}</div>
        <div class="property-features">
          <span>🛏 ${propiedad.Dormitorios}</span>
          <span>🚿 ${propiedad.Banos}</span>
          <span>🏡 ${propiedad.Superficie} m²</span>
        </div>
        <a href="/propiedades/${slug}.html" class="btn">Ver Propiedad</a>
      </div>
    </article>
  `;
}

/**
 * Renderiza una lista de propiedades en un contenedor
 * @param {Array} propiedades - Array de propiedades
 * @param {string} containerSelector - Selector del contenedor
 */
function renderizarPropiedades(propiedades, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`Contenedor no encontrado: ${containerSelector}`);
    return;
  }

  if (propiedades.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">
        <p>No hay propiedades disponibles en este momento.</p>
      </div>
    `;
    return;
  }

  const html = propiedades.map(propiedad => crearTarjetaPropiedad(propiedad)).join('');
  container.innerHTML = html;
}

/**
 * Renderiza propiedades destacadas en la página principal
 */
async function cargarPropiedadesDestacadas() {
  try {
    const api = new StrapiAPI();
    const propiedades = await api.getPropiedadesDestacadas();
    renderizarPropiedades(propiedades, '.property-grid');
  } catch (error) {
    console.error('Error al cargar propiedades destacadas:', error);
  }
}

/**
 * Renderiza todas las propiedades en la página de propiedades
 */
async function cargarTodasPropiedades() {
  try {
    const api = new StrapiAPI();
    const propiedades = await api.getPropiedades();
    renderizarPropiedades(propiedades, '.property-grid');
  } catch (error) {
    console.error('Error al cargar todas las propiedades:', error);
  }
}

// =============================
// Funciones para página de detalle
// =============================

/**
 * Renderiza la página de detalle de una propiedad
 * @param {Object} propiedad - Objeto de propiedad de Strapi
 */
function renderizarDetallePropiedad(propiedad) {
  const imagenes = getTodasImagenes(propiedad);
  const precio = formatearPrecio(propiedad.Precio);
  
  // Actualizar título de la página
  document.title = `${propiedad.Titulo} | PropInvest`;
  
  // Actualizar meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = `Descubre ${propiedad.Titulo}: ${propiedad.Dormitorios} dormitorios, ${propiedad.Banos} baños, ${propiedad.Superficie} m² de lujo y diseño. Vive la exclusividad con PropInvest.`;
  }

  // Renderizar galería de imágenes
  renderizarGaleria(imagenes);

  // Actualizar contenido principal
  const mainContent = document.querySelector('main .container');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="section-title">${propiedad.Titulo}</div>
      <div class="section-subtitle">${propiedad.Ubicacion}</div>
      
      <!-- Galería de imágenes -->
      <div class="property-gallery" id="gallery">
        <div class="gallery-main">
          <button class="gallery-arrow left" aria-label="Anterior">&#8592;</button>
          <img src="${imagenes[0]}" alt="${propiedad.Titulo} - Imagen 1" id="main-image">
          <button class="gallery-arrow right" aria-label="Siguiente">&#8594;</button>
        </div>
        <div class="gallery-thumbnails">
          ${imagenes.map((img, index) => `
            <img src="${img}" alt="Thumbnail ${index + 1}" class="${index === 0 ? 'active' : ''}">
          `).join('')}
        </div>
      </div>

      <!-- Modal Lightbox -->
      <div class="lightbox-modal" id="lightbox-modal">
        <button class="lightbox-close" aria-label="Cerrar">&times;</button>
        <img src="" alt="Imagen ampliada" id="lightbox-img">
      </div>

      <!-- Descripción y datos clave -->
      <div style="margin-top:2.5rem; display:flex; flex-wrap:wrap; gap:2.5rem; align-items:flex-start;">
        <div style="flex:2; min-width:300px;">
          <h2 class="property-title" style="font-size:1.5rem;">${precio}</h2>
          <div class="property-features" style="margin-bottom:1.2rem;">
            <span>🛏 ${propiedad.Dormitorios} Dormitorios</span>
            <span>🚿 ${propiedad.Banos} Baños</span>
            <span>🏡 ${propiedad.Superficie} m²</span>
          </div>
          <div style="font-family:var(--font-secondary); color:var(--color-text-secondary);">
            ${propiedad.Descripcion || 'Descripción no disponible.'}
          </div>
          <a id="whatsapp-link" href="#" class="cta" target="_blank" rel="noopener">Contactar por esta propiedad</a>
        </div>
        <div style="flex:1; min-width:280px;">
          <div class="info-box">
            <div class="info-icon">📍</div>
            <div class="info-content">
              <div class="info-title">Ubicación</div>
              <div class="info-text">${propiedad.Direccion || propiedad.Ubicacion}</div>
            </div>
          </div>
          <iframe src="https://www.google.com/maps?q=${propiedad.Ubicacion}&z=15&output=embed" 
                  width="100%" height="220" 
                  style="border:0; border-radius:12px; box-shadow:0 2px 8px var(--color-shadow);" 
                  allowfullscreen="" loading="lazy" 
                  referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    `;
  }

  // Configurar botón de WhatsApp
  configurarWhatsApp(propiedad.Titulo);
}

/**
 * Renderiza la galería de imágenes
 * @param {Array} imagenes - Array de URLs de imágenes
 */
function renderizarGaleria(imagenes) {
  // La galería se renderiza en el HTML principal
  // Aquí solo configuramos la funcionalidad
  setTimeout(() => {
    inicializarGaleria(imagenes);
  }, 100);
}

/**
 * Inicializa la funcionalidad de la galería
 * @param {Array} imagenes - Array de URLs de imágenes
 */
function inicializarGaleria(imagenes) {
  let current = 0;
  const mainImg = document.getElementById('main-image');
  const thumbs = document.querySelectorAll('.gallery-thumbnails img');
  const left = document.querySelector('.gallery-arrow.left');
  const right = document.querySelector('.gallery-arrow.right');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightbox = document.querySelector('.lightbox-close');

  if (!mainImg || !thumbs.length) return;

  function showImage(idx) {
    current = idx;
    mainImg.src = imagenes[current];
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
  }

  if (left) left.addEventListener('click', () => showImage((current - 1 + imagenes.length) % imagenes.length));
  if (right) right.addEventListener('click', () => showImage((current + 1) % imagenes.length));
  
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => showImage(i));
  });

  // Lightbox
  if (mainImg && lightbox && lightboxImg) {
    mainImg.addEventListener('click', () => {
      lightbox.classList.add('active');
      lightboxImg.src = imagenes[current];
    });

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('dblclick', () => {
        lightbox.classList.add('active');
        lightboxImg.src = imagenes[i];
      });
    });

    if (closeLightbox) {
      closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
      });
    }

    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          lightbox.classList.remove('active');
          lightboxImg.src = '';
        }
      });
    }
  }

  // Inicializar
  showImage(0);
}

/**
 * Configura el botón de WhatsApp con la información de la propiedad
 * @param {string} nombrePropiedad - Nombre de la propiedad
 */
function configurarWhatsApp(nombrePropiedad) {
  const whatsappLink = document.getElementById('whatsapp-link');
  if (whatsappLink) {
    const link = `https://wa.me/56912345678?text=Hola,%20me%20interesa%20la%20propiedad%20${encodeURIComponent(nombrePropiedad)}%20que%20vi%20en%20su%20sitio%20web.`;
    whatsappLink.href = link;
  }
}

function getPrimeraImagen(propiedad) {
  if (!propiedad.Imagenes || !Array.isArray(propiedad.Imagenes) || propiedad.Imagenes.length === 0) {
    return '/assets/images/propiedad-default.jpg';
  }
  const primeraImagen = propiedad.Imagenes[0];
  if (!primeraImagen || !primeraImagen.url) {
    return '/assets/images/propiedad-default.jpg';
  }
  return primeraImagen.url.startsWith('http') ? primeraImagen.url : `${STRAPI_CONFIG.IMAGE_CONFIG.BASE_URL}${primeraImagen.url}`;
}

function getTodasImagenes(propiedad) {
  if (!propiedad.Imagenes || !Array.isArray(propiedad.Imagenes) || propiedad.Imagenes.length === 0) {
    return ['/assets/images/propiedad-default.jpg'];
  }
  return propiedad.Imagenes.map(imagen =>
    imagen && imagen.url
      ? (imagen.url.startsWith('http') ? imagen.url : `${STRAPI_CONFIG.IMAGE_CONFIG.BASE_URL}${imagen.url}`)
      : '/assets/images/propiedad-default.jpg'
  );
}

// Exportar funciones y clase
window.StrapiAPI = StrapiAPI;
window.PropiedadUtils = {
  crearTarjetaPropiedad,
  renderizarPropiedades,
  cargarPropiedadesDestacadas,
  cargarTodasPropiedades,
  renderizarDetallePropiedad,
  inicializarGaleria,
  configurarWhatsApp
}; 