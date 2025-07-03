// =============================
// API Service para Strapi
// =============================

class StrapiAPI {
  constructor() {
    this.baseURL = STRAPI_CONFIG.API_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Realiza una petición a la API de Strapi con caché
   * @param {string} endpoint - Endpoint específico
   * @param {Object} options - Opciones adicionales para fetch
   * @returns {Promise} Respuesta de la API
   */
  async fetchAPI(endpoint, options = {}) {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Verificar caché
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📦 Usando datos en caché para:', endpoint);
      // Registrar hit de caché
      if (window.PerformanceOptimizer) {
        window.PerformanceOptimizer.recordMetric('cacheHits');
      }
      return cached.data;
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 Llamando a la API:', url);
      
      // Registrar llamada a API
      if (window.PerformanceOptimizer) {
        window.PerformanceOptimizer.recordMetric('apiCalls');
      }
      
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

      const data = await response.json();
      
      // Guardar en caché
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      console.log('✅ Datos obtenidos y guardados en caché:', endpoint);
      return data;
    } catch (error) {
      console.error('Error al conectar con Strapi:', error);
      throw error;
    }
  }

  /**
   * Limpia el caché
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Caché limpiado');
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
      // Filtrar solo las que tengan Objetivo === 'Venta' y Destacado === true
      const propiedades = response.data || [];
      return propiedades.filter(prop => prop.Objetivo === 'Venta' && prop.Destacado === true);
    } catch (error) {
      console.error('Error al obtener propiedades destacadas:', error);
      return [];
    }
  }

  /**
   * Obtiene propiedades destacadas en arriendo
   * @returns {Promise<Array>} Array de propiedades destacadas en arriendo
   */
  async getPropiedadesDestacadasArriendo() {
    try {
      const response = await this.fetchAPI(STRAPI_CONFIG.ENDPOINTS.PROPIEDADES_DESTACADAS_ARRIENDO);
      // Filtrar solo las que tengan Objetivo === 'Arriendo' y Destacado === true
      const propiedades = response.data || [];
      return propiedades.filter(prop => prop.Objetivo === 'Arriendo' && prop.Destacado === true);
    } catch (error) {
      console.error('Error al obtener propiedades destacadas en arriendo:', error);
      return [];
    }
  }

  /**
   * Obtiene todas las propiedades destacadas (venta y arriendo) en una sola llamada
   * @returns {Promise<Object>} Objeto con propiedades de venta y arriendo
   */
  async getTodasPropiedadesDestacadas() {
    try {
      const response = await this.fetchAPI(STRAPI_CONFIG.ENDPOINTS.PROPIEDADES_DESTACADAS);
      const propiedades = response.data || [];
      
      const resultado = {
        venta: propiedades.filter(prop => prop.Objetivo === 'Venta' && prop.Destacado === true),
        arriendo: propiedades.filter(prop => prop.Objetivo === 'Arriendo' && prop.Destacado === true)
      };
      
      // Precargar imágenes de las propiedades destacadas
      this.preloadImages(resultado.venta.concat(resultado.arriendo));
      
      return resultado;
    } catch (error) {
      console.error('Error al obtener todas las propiedades destacadas:', error);
      return { venta: [], arriendo: [] };
    }
  }

  /**
   * Precarga las imágenes de las propiedades para mejorar el rendimiento
   * @param {Array} propiedades - Array de propiedades
   */
  preloadImages(propiedades) {
    const imagesToPreload = [];
    
    propiedades.forEach(propiedad => {
      if (propiedad.attributes && propiedad.attributes.Imagenes && propiedad.attributes.Imagenes.data) {
        propiedad.attributes.Imagenes.data.forEach(imagen => {
          const imageUrl = getStrapiImageUrl(imagen.attributes.url, 'medium');
          imagesToPreload.push(imageUrl);
        });
      }
    });
    
    // Precargar imágenes en segundo plano
    if (imagesToPreload.length > 0) {
      console.log(`🖼️ Precargando ${imagesToPreload.length} imágenes...`);
      
      // Registrar métrica de imágenes precargadas
      if (window.PerformanceOptimizer) {
        window.PerformanceOptimizer.recordMetric('imagePreloads', imagesToPreload.length);
      }
      
      imagesToPreload.forEach(imageUrl => {
        const img = new Image();
        img.src = imageUrl;
        // No necesitamos hacer nada más, solo cargar la imagen en caché del navegador
      });
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
        <a href="/propiedad-dinamica.html?slug=${propiedad.Slug}" class="btn">Ver Propiedad</a>
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

/**
 * Renderiza propiedades según la categoría basada en la URL
 * @param {string} currentPath - Ruta actual de la página
 */
async function cargarPropiedadesPorCategoria(currentPath) {
  try {
    const api = new StrapiAPI();
    let propiedades = await api.getPropiedades();
    
    // Filtrar propiedades según la categoría
    if (currentPath.includes('/en-venta')) {
      propiedades = propiedades.filter(prop => prop.Objetivo === 'Venta');
      actualizarTituloPagina('Propiedades en Venta', 'Elige entre las mejores residencias de lujo en venta en Chile.');
    } else if (currentPath.includes('/en-arriendo')) {
      propiedades = propiedades.filter(prop => prop.Objetivo === 'Arriendo');
      actualizarTituloPagina('Propiedades en Arriendo', 'Elige entre las mejores residencias de lujo en arriendo en Chile.');
    } else if (currentPath.includes('/oportunidades')) {
      propiedades = propiedades.filter(prop => prop.Oportunidades === true);
      actualizarTituloPagina('Oportunidades Inmobiliarias', 'Descubre propiedades con gran potencial de inversión y revalorización.');
    }
    
    renderizarPropiedades(propiedades, '.property-grid');
  } catch (error) {
    console.error('Error al cargar propiedades por categoría:', error);
  }
}

/**
 * Actualiza el título y subtítulo de la página dinámicamente
 * @param {string} titulo - Nuevo título de la página
 * @param {string} subtitulo - Nuevo subtítulo de la página
 */
function actualizarTituloPagina(titulo, subtitulo) {
  const tituloElement = document.querySelector('.section-title');
  const subtituloElement = document.querySelector('.section-subtitle');
  
  if (tituloElement) {
    tituloElement.textContent = titulo;
  }
  
  if (subtituloElement) {
    subtituloElement.textContent = subtitulo;
  }
}

// =============================
// Funciones para página de detalle
// =============================

/**
 * Obtiene la tasa de cambio UF a CLP en tiempo real
 * @returns {Promise<number>} Tasa de cambio UF/CLP
 */
async function obtenerTasaUF() {
  try {
    const response = await fetch('https://mindicador.cl/api/uf');
    const data = await response.json();
    return data.serie[0].valor;
  } catch (error) {
    console.error('Error al obtener tasa UF:', error);
    return 35000; // Valor por defecto si falla la API
  }
}

/**
 * Formatea precio en CLP con separadores de miles
 * @param {number} precio - Precio en CLP
 * @returns {string} Precio formateado
 */
function formatearPrecioCLP(precio) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
}

/**
 * Renderiza la página de detalle de una propiedad con layout profesional y sidebar
 * @param {Object} propiedad - Objeto de propiedad de Strapi
 */
async function renderizarDetallePropiedad(propiedad) {
  const imagenes = getTodasImagenes(propiedad);
  const precioUF = formatearPrecio(propiedad.Precio);
  const tasaUF = await obtenerTasaUF();
  const precioCLP = propiedad.Precio ? formatearPrecioCLP(propiedad.Precio * tasaUF) : '';

  document.title = `${propiedad.Titulo} | PropInvest`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = `${propiedad.Titulo} en ${propiedad.Ubicacion || propiedad.Region || ''}. ${propiedad.Dormitorios ? `${propiedad.Dormitorios} dormitorios` : ''} ${propiedad.Banos ? `${propiedad.Banos} baños` : ''} ${propiedad.Superficie ? `${propiedad.Superficie} m²` : ''}. Vive la exclusividad con PropInvest.`;
  }

  // Generar HTML de Características con estructura de Ficha Técnica
  function getCaracteristicasHTML(tipo) {
    // tipo: 'desktop' o 'mobile'
    const items = [];
    // Características con ticket elegante
    if (propiedad.Piscina) items.push({label: 'Piscina', value: '', tick: true});
    if (propiedad.Quincho) items.push({label: 'Quincho', value: '', tick: true});
    if (propiedad.sala_multiuso) items.push({label: 'Sala Multiuso', value: '', tick: true});
    if (propiedad.Gimnasio) items.push({label: 'Gimnasio', value: '', tick: true});
    if (propiedad.Lavanderia) items.push({label: 'Lavandería', value: '', tick: true});
    if (propiedad.Walk_in_closet) items.push({label: 'Walk-in Closet', value: '', tick: true});
    // Año de construcción: solo mostrar si tiene valor, nunca con ticket
    if (propiedad.ano_construccion) items.push({label: 'Año de construcción', value: propiedad.ano_construccion});
    // Piso y Orientación: solo mostrar si tienen valor
    if (propiedad.Piso) items.push({label: 'Piso', value: propiedad.Piso});
    if (propiedad.Orientacion) items.push({label: 'Orientación', value: propiedad.Orientacion});
    if (items.length === 0) return '';
    return `
      <div class="technical-specs-section caracteristicas-${tipo}" style="display:block; margin-bottom:2rem;">
        <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin-bottom:1rem;">Características</h2>
        <div class="specs-grid">
          ${items.map(item => `<div class="spec-item"><span class="spec-label">${item.label}${item.value ? ':' : ''}</span><span class="spec-value">${item.value ? item.value : ''}</span>${item.tick ? '<span class="carac-tick" title="Incluido"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="10" stroke="#444" stroke-width="2" fill="#f7f7f7"/><path d="M6.5 11.5L10 15L15.5 8.5" stroke="#444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : ''}</div>`).join('')}
        </div>
      </div>
    `;
  }

  const mainContent = document.querySelector('main .container');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="detalle-layout" style="display:flex; flex-wrap:wrap; gap:3rem; align-items:flex-start;">
        <!-- Columna principal -->
        <div class="detalle-main" style="flex:2; min-width:320px;">
          <!-- Encabezado -->
          <div class="property-header" style="border-bottom:1px solid var(--color-border); margin-bottom:2rem; padding-bottom:1.5rem;">
            <div>
              <h1 class="property-main-title">${propiedad.Titulo}</h1>
              ${propiedad.Tipo && propiedad.Objetivo ? `<div class="property-type">${propiedad.Tipo} • ${propiedad.Objetivo}</div>` : ''}
              ${propiedad.Ubicacion ? `<div class="property-location">📍 ${propiedad.Ubicacion}</div>` : ''}
            </div>
            <div class="property-price-section">
              ${propiedad.Precio ? `<div class="property-price"><div class="price-uf">${precioUF}</div>${precioCLP ? `<div class="price-clp">${precioCLP}</div>` : ''}</div>` : ''}
              <div class="property-key-features" style="flex-direction:row; gap:1.5rem; margin-top:0.5rem;">
                ${propiedad.Dormitorios ? `<span class="feature-item">🛏 ${propiedad.Dormitorios}</span>` : ''}
                ${propiedad.Banos ? `<span class="feature-item">🚿 ${propiedad.Banos}</span>` : ''}
                ${propiedad.Superficie ? `<span class="feature-item">🏡 ${propiedad.Superficie} m²</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Galería y ficha técnica en desktop -->
          <div class="detalle-galeria-ficha" style="display:flex; flex-wrap:wrap; gap:2.5rem; align-items:flex-start;">
            <div class="property-gallery" id="gallery" style="flex:2; min-width:320px;">
              ${imagenes.length > 0 ? `
                ${imagenes.length === 1 ? `<div class="single-image"><img src="${imagenes[0]}" alt="${propiedad.Titulo}" class="main-image" style="aspect-ratio:1/1; width:100%; height:auto; object-fit:cover;"></div>` : `
                  <div class="gallery-main">
                    <button class="gallery-arrow left" aria-label="Anterior">‹</button>
                    <img src="${imagenes[0]}" alt="${propiedad.Titulo} - Imagen 1" id="main-image" class="main-image" style="aspect-ratio:1/1; width:100%; height:auto; object-fit:cover;">
                    <button class="gallery-arrow right" aria-label="Siguiente">›</button>
                  </div>
                  <div class="gallery-thumbnails">
                    ${imagenes.map((img, index) => `<img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" style="aspect-ratio:1/1; width:80px; height:80px; object-fit:cover;">`).join('')}
                  </div>`}
                <div class="lightbox-modal" id="lightbox-modal"><button class="lightbox-close" aria-label="Cerrar">×</button><img src="" alt="Imagen ampliada" id="lightbox-img"></div>
              ` : ''}
            </div>
            <!-- Ficha técnica SOLO en desktop -->
            <div class="technical-specs-section ficha-desktop" style="flex:1; min-width:220px; max-width:320px; display:none;">
              <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin-bottom:1rem;">Ficha Técnica</h2>
              <div class="specs-grid" style="display:block;">
                ${propiedad.Dormitorios ? `<div class="spec-item"><span class="spec-label">Dormitorios:</span><span class="spec-value">${propiedad.Dormitorios}</span></div>` : ''}
                ${propiedad.Banos ? `<div class="spec-item"><span class="spec-label">Baños:</span><span class="spec-value">${propiedad.Banos}</span></div>` : ''}
                ${propiedad.Superficie ? `<div class="spec-item"><span class="spec-label">Superficie Total:</span><span class="spec-value">${propiedad.Superficie} m²</span></div>` : ''}
                ${propiedad.M2utiles ? `<div class="spec-item"><span class="spec-label">Superficie Útil:</span><span class="spec-value">${propiedad.M2utiles} m²</span></div>` : ''}
                ${propiedad.suites ? `<div class="spec-item"><span class="spec-label">Suites:</span><span class="spec-value">${propiedad.suites}</span></div>` : ''}
                ${propiedad.Servicio ? `<div class="spec-item"><span class="spec-label">Servicio:</span><span class="spec-value">${propiedad.Servicio}</span></div>` : ''}
                ${propiedad.Estacionamientos ? `<div class="spec-item"><span class="spec-label">Estacionamientos:</span><span class="spec-value">${propiedad.Estacionamientos}</span></div>` : ''}
                ${propiedad.Terrazas ? `<div class="spec-item"><span class="spec-label">Terrazas:</span><span class="spec-value">${propiedad.Terrazas}</span></div>` : ''}
                ${propiedad.Bodega ? `<div class="spec-item"><span class="spec-label">Bodega:</span><span class="spec-value">${propiedad.Bodega}</span></div>` : ''}
              </div>
            </div>
          </div>

          <!-- Descripción -->
          ${propiedad.Descripcion ? `<div class="description-section"><h2 class="section-title">Descripción</h2><div class="description-content">${propiedad.Descripcion}</div></div>` : ''}

          <!-- Ficha técnica en mobile (debajo de la descripción) -->
          <div class="technical-specs-section ficha-mobile" style="display:block;">
            <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin-bottom:1rem;">Ficha Técnica</h2>
            <div class="specs-grid" style="display:block;">
              ${propiedad.Dormitorios ? `<div class="spec-item"><span class="spec-label">Dormitorios:</span><span class="spec-value">${propiedad.Dormitorios}</span></div>` : ''}
              ${propiedad.Banos ? `<div class="spec-item"><span class="spec-label">Baños:</span><span class="spec-value">${propiedad.Banos}</span></div>` : ''}
              ${propiedad.Superficie ? `<div class="spec-item"><span class="spec-label">Superficie Total:</span><span class="spec-value">${propiedad.Superficie} m²</span></div>` : ''}
              ${propiedad.M2utiles ? `<div class="spec-item"><span class="spec-label">Superficie Útil:</span><span class="spec-value">${propiedad.M2utiles} m²</span></div>` : ''}
              ${propiedad.suites ? `<div class="spec-item"><span class="spec-label">Suites:</span><span class="spec-value">${propiedad.suites}</span></div>` : ''}
              ${propiedad.Servicio ? `<div class="spec-item"><span class="spec-label">Servicio:</span><span class="spec-value">${propiedad.Servicio}</span></div>` : ''}
              ${propiedad.Estacionamientos ? `<div class="spec-item"><span class="spec-label">Estacionamientos:</span><span class="spec-value">${propiedad.Estacionamientos}</span></div>` : ''}
              ${propiedad.Terrazas ? `<div class="spec-item"><span class="spec-label">Terrazas:</span><span class="spec-value">${propiedad.Terrazas}</span></div>` : ''}
              ${propiedad.Bodega ? `<div class="spec-item"><span class="spec-label">Bodega:</span><span class="spec-value">${propiedad.Bodega}</span></div>` : ''}
            </div>
          </div>

          <!-- Características SOLO en mobile (en desktop se renderiza en sidebar) -->
          <div class="caracteristicas-mobile" style="display:block;">
            ${getCaracteristicasHTML('mobile')}
          </div>

          <!-- Gastos de mantención -->
          ${(propiedad.Gastos_comunes || propiedad.Contribuciones) ? `<div class="expenses-section"><h2 class="section-title">Gastos de Mantención</h2><div class="expenses-list">${propiedad.Gastos_comunes ? `<div class="expense-item"><span class="expense-label">Gastos Comunes:</span><span class="expense-value">${formatearPrecioCLP(propiedad.Gastos_comunes)}</span></div>` : ''}${propiedad.Contribuciones ? `<div class="expense-item"><span class="expense-label">Contribuciones:</span><span class="expense-value">${formatearPrecioCLP(propiedad.Contribuciones)}</span></div>` : ''}</div></div>` : ''}

          <!-- Mapa de ubicación -->
          ${(propiedad.Region || propiedad.Ubicacion) ? `<div class="location-section"><h2 class="section-title">Ubicación</h2><div class="location-info">${propiedad.Region ? `<div class="location-region">${propiedad.Region}</div>` : ''}${propiedad.Ubicacion ? `<div class="location-area">${propiedad.Ubicacion}</div>` : ''}</div><div class="location-map"><iframe src="https://www.google.com/maps?q=${encodeURIComponent(propiedad.Ubicacion || propiedad.Region)}&z=13&output=embed" width="100%" height="300" style="border:0; border-radius:12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div>` : ''}

          <!-- Botón de contacto -->
          <div class="contact-section"><a id="whatsapp-link" href="#" class="contact-button" target="_blank" rel="noopener"><span class="contact-icon">💬</span><span class="contact-text">Contactar por esta propiedad</span></a></div>
        </div>
        <!-- Sidebar -->
        <aside class="detalle-sidebar" style="flex:1; min-width:320px; max-width:400px; display:flex; flex-direction:column; gap:2.5rem;">
          <div class="info-box" style="background:var(--color-background); border-radius:14px; box-shadow:0 2px 8px var(--color-shadow); padding:1.5rem 1.2rem; display:flex; align-items:flex-start; gap:1.2rem;">
            <div class="info-icon" style="font-size:2rem; color:var(--color-primary-accent);">🔒</div>
            <div class="info-content">
              <div class="info-title" style="font-family:var(--font-primary); font-weight:600; font-size:1.1rem; margin-bottom:0.3rem;">Confidencialidad y seguridad</div>
              <div class="info-text" style="font-family:var(--font-secondary); color:var(--color-text-secondary); font-size:1rem;">Procesos discretos y seguros para proteger tu inversión y privacidad.</div>
            </div>
          </div>
          <!-- Características SOLO en desktop (en mobile se renderiza en main) -->
          <div class="caracteristicas-desktop" style="display:none;">
            ${getCaracteristicasHTML('desktop')}
          </div>
          <div id="sidebar-destacadas"></div>
        </aside>
      </div>
    `;
  }

  configurarWhatsApp(propiedad.Titulo);
  if (imagenes.length > 1) setTimeout(() => { inicializarGaleria(imagenes); }, 100);
  cargarSidebarDestacadas(propiedad);

  // Mostrar ficha técnica y características en desktop/móvil según tamaño de pantalla
  function ajustarFichaTecnicaYCaracteristicas() {
    const fichaDesktop = document.querySelector('.ficha-desktop');
    const fichaMobile = document.querySelector('.ficha-mobile');
    const caracDesktop = document.querySelector('.caracteristicas-desktop');
    const caracMobile = document.querySelector('.caracteristicas-mobile');
    if (window.innerWidth >= 1024) {
      if (fichaDesktop) fichaDesktop.style.display = 'block';
      if (fichaMobile) fichaMobile.style.display = 'none';
      if (caracDesktop) caracDesktop.style.display = 'block';
      if (caracMobile) caracMobile.style.display = 'none';
    } else {
      if (fichaDesktop) fichaDesktop.style.display = 'none';
      if (fichaMobile) fichaMobile.style.display = 'block';
      if (caracDesktop) caracDesktop.style.display = 'none';
      if (caracMobile) caracMobile.style.display = 'block';
    }
  }
  ajustarFichaTecnicaYCaracteristicas();
  window.addEventListener('resize', ajustarFichaTecnicaYCaracteristicas);
}

/**
 * Carga y renderiza las propiedades destacadas en el sidebar
 * @param {Object} propiedadActual - Propiedad actual para filtrar
 */
async function cargarSidebarDestacadas(propiedadActual) {
  const api = new StrapiAPI();
  let todas = await api.getPropiedades();
  // 1. Mismo Objetivo y Tipo, excluyendo la actual
  let filtradas = todas.filter(p =>
    p.id !== propiedadActual.id &&
    p.Objetivo === propiedadActual.Objetivo &&
    p.Tipo === propiedadActual.Tipo
  );
  // 2. Si no hay, solo mismo Objetivo
  if (filtradas.length === 0) {
    filtradas = todas.filter(p =>
      p.id !== propiedadActual.id &&
      p.Objetivo === propiedadActual.Objetivo
    );
  }
  // 3. Si tampoco hay, cualquier otra destacada (excepto la actual)
  if (filtradas.length === 0) {
    filtradas = todas.filter(p =>
      p.id !== propiedadActual.id &&
      p.Destacado === true
    );
  }
  // 4. Si aún no hay, cualquier otra propiedad (excepto la actual)
  if (filtradas.length === 0) {
    filtradas = todas.filter(p => p.id !== propiedadActual.id);
  }
  // Ordenar: primero destacados, luego el resto
  filtradas = filtradas.sort((a, b) => (b.Destacado === true) - (a.Destacado === true));
  // Tomar máximo 3
  filtradas = filtradas.slice(0, 3);
  // Renderizar
  const cont = document.getElementById('sidebar-destacadas');
  if (cont) {
    if (filtradas.length === 0) {
      cont.innerHTML = '';
      return;
    }
    cont.innerHTML = `
      <div class="sidebar-section">
        <hr style="border:none; border-top:1.5px solid var(--color-border); margin:2.2rem 0 1.5rem 0;">
        <div class="section-title" style="font-size:1.3rem; text-align:left; margin-bottom:1rem; color:var(--color-primary-accent); border:none; padding:0;">Propiedades Destacadas</div>
        <div class="sidebar-destacadas-list" style="display:flex; flex-direction:column; gap:1.5rem;">
          ${filtradas.map(prop => `
            <a href="/propiedad-dinamica.html?slug=${prop.Slug}" class="sidebar-destacada-card" style="display:block; background:var(--color-background); border-radius:14px; box-shadow:0 2px 8px var(--color-shadow); text-decoration:none; color:inherit; overflow:hidden; border:1px solid var(--color-border);">
              <div style="width:100%; aspect-ratio:1/1; background:#f5f5f5; display:flex; align-items:center; justify-content:center;">
                <img src="${getPrimeraImagen(prop)}" alt="${prop.Titulo}" style="width:100%; height:100%; object-fit:cover; display:block;">
              </div>
              <div style="padding:1.1rem 1rem 1rem 1rem; display:flex; flex-direction:column; gap:0.3rem; align-items:flex-start;">
                <div style="font-family:var(--font-primary); font-weight:600; font-size:1.08rem; color:var(--color-text-primary); margin-bottom:0.2rem; line-height:1.2;">${prop.Titulo}</div>
                <div style="font-size:1rem; color:var(--color-primary-accent); font-weight:600;">${formatearPrecio(prop.Precio)}</div>
                <div style="font-size:0.95rem; color:var(--color-text-secondary);">${prop.Ubicacion || ''}</div>
                ${prop.Destacado ? `<span style="color:var(--color-primary-accent); font-size:0.85rem; font-weight:700;">★ Destacada</span>` : ''}
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }
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