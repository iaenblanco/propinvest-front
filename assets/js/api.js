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
  const formatted = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
  
  // Reemplazar el "$" al inicio con "CLP $"
  return formatted.replace(/^\$/, 'CLP $');
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

  function getCaracteristicasHTML(tipo) {
    // Definir las características y sus íconos, usando los nombres originales
    const caracteristicas = [
      { key: 'Piscina', label: 'Piscina', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><path d='M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2'/><path d='M2 21c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2'/></svg>` },
      { key: 'Quincho', label: 'Quincho', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='10' width='18' height='8' rx='2'/><path d='M7 10V7a5 5 0 0 1 10 0v3'/></svg>` },
      { key: 'sala_multiuso', label: 'Sala Multiuso', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 4v16'/></svg>` },
      { key: 'Gimnasio', label: 'Gimnasio', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M8 12h8'/></svg>` },
      { key: 'Lavanderia', label: 'Lavandería', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='12' cy='12' r='5'/></svg>` },
      { key: 'Walk_in_closet', label: 'Walk-in Closet', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 4v16'/></svg>` },
      { key: 'ano_construccion', label: 'Año de construcción', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 9h18'/></svg>` },
      { key: 'Piso', label: 'Piso', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 12h18'/></svg>` },
      { key: 'Orientacion', label: 'Orientación', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>` },
    ];
    // Solo mostrar las que están presentes o marcadas como true/Sí
    const items = caracteristicas.map(carac => {
      let valor = propiedad[carac.key];
      // Mostrar solo si es true, 'Sí', o tiene valor (para año, piso, orientación)
      if (
        valor === true || valor === 'Sí' ||
        (carac.key === 'ano_construccion' && valor) ||
        (carac.key === 'Piso' && valor) ||
        (carac.key === 'Orientacion' && valor)
      ) {
        let valorHtml = '';
        if (carac.key === 'ano_construccion' || carac.key === 'Piso' || carac.key === 'Orientacion') {
          valorHtml = `<span style=\"color:#888; font-weight:500; float:right;\">${valor}</span>`;
        }
        return `
          <div class=\"carac-item\" style=\"display:flex; align-items:center; justify-content:space-between; background:#fff; border:1.5px solid #ececec; border-radius:10px; padding:0.9rem 1.2rem; margin-bottom:0.8rem; font-size:1.08rem; font-family:inherit;\">
            <span style=\"font-weight:500; color:#222;\">${carac.label}${carac.key === 'ano_construccion' || carac.key === 'Piso' || carac.key === 'Orientacion' ? ':' : ''}</span>
            <span style=\"display:flex; align-items:center; gap:0.5rem;\">
              ${valorHtml}
              ${(valor === true || valor === 'Sí') ? `<span style=\"display:inline-flex; align-items:center; justify-content:center; border-radius:50%; border:1.5px solid #bbb; width:28px; height:28px;\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 22 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"11\" cy=\"11\" r=\"10\" stroke=\"#444\" stroke-width=\"2\" fill=\"#f7f7f7\"/><path d=\"M6.5 11.5L10 15L15.5 8.5\" stroke=\"#444\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></span>` : ''}
            </span>
          </div>
        `;
      }
      return '';
    }).filter(Boolean);
    if (items.length === 0) return '';
    return `
      <div class=\"caracteristicas-lista\" style=\"display:flex; flex-direction:column; gap:0;\">
        ${items.join('')}
      </div>
    `;
  }

  const mainContent = document.querySelector('main .container');
  if (mainContent) {
    mainContent.innerHTML = `
      <!-- Cuadro informativo móvil (arriba de todo, solo visible en móvil) -->
      <div class="info-box-mobile" style="background:var(--color-background); border:1px solid var(--color-text-primary); border-radius:12px; box-shadow:0 2px 8px var(--color-shadow); padding:1.2rem; display:none; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
        <!-- Fila 1: Tipo y Precio UF -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
          ${propiedad.Tipo && propiedad.Objetivo ? `<div class="property-type-mobile" style="font-size:0.8rem; color:var(--color-text-secondary); font-weight:500; text-transform:capitalize; flex-shrink:0;">${propiedad.Tipo} en ${propiedad.Objetivo}</div>` : ''}
          ${propiedad.Precio ? `<div class="price-uf-mobile" style="font-size:1.4rem; font-weight:700; color:var(--color-primary-accent); text-align:right; flex-shrink:0;">${precioUF}</div>` : ''}
        </div>
        
        <!-- Fila 2: Título -->
        <h1 class="property-main-title-mobile" style="font-size:1.2rem; margin:0; line-height:1.2; color:var(--color-text-primary); font-weight:600;">${propiedad.Titulo}</h1>
        
        <!-- Fila 3: Ubicación y Precio CLP -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem;">
          ${propiedad.Ubicacion ? `<div class="property-location-mobile" style="font-size:0.85rem; color:var(--color-text-secondary); flex:1;">📍 ${propiedad.Ubicacion}</div>` : ''}
          ${precioCLP ? `<div class="price-clp-mobile" style="font-size:0.9rem; color:var(--color-text-secondary); text-align:right; flex-shrink:0;">${precioCLP}</div>` : ''}
        </div>
        
        <!-- Fila 4: Características en grid compacto -->
        <div class="property-key-features-mobile" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.5rem; margin-top:0.5rem;">
          ${propiedad.Dormitorios ? `<span class="feature-item-mobile" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem; font-size:0.75rem; color:var(--color-text-primary); font-weight:500; text-align:center;">
            <span style="font-size:1rem;">🛏</span>
            <span>${propiedad.Dormitorios}</span>
          </span>` : ''}
          ${propiedad.Banos ? `<span class="feature-item-mobile" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem; font-size:0.75rem; color:var(--color-text-primary); font-weight:500; text-align:center;">
            <span style="font-size:1rem;">🚿</span>
            <span>${propiedad.Banos}</span>
          </span>` : ''}
          ${propiedad.Superficie ? `<span class="feature-item-mobile" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem; font-size:0.75rem; color:var(--color-text-primary); font-weight:500; text-align:center;">
            <span style="font-size:1rem;">🏡</span>
            <span>${propiedad.Superficie}m²</span>
          </span>` : ''}
          ${propiedad.M2utiles ? `<span class="feature-item-mobile" style="display:flex; flex-direction:column; align-items:center; gap:0.2rem; font-size:0.75rem; color:var(--color-text-primary); font-weight:500; text-align:center;">
            <span style="font-size:1rem;">📏</span>
            <span>${propiedad.M2utiles}m²</span>
          </span>` : ''}
        </div>
      </div>

      <div class="detalle-layout" style="display:flex; flex-wrap:wrap; gap:3rem; align-items:flex-start;">
        <!-- Columna principal (izquierda) -->
        <div class="detalle-main" style="flex:2; min-width:320px;">
          <!-- Galería principal -->
          <div class="property-gallery" id="gallery" style="width:100%; margin-top:0;">
            ${imagenes.length > 0 ? `
              <div class="gallery-main" style="width:100%; max-width:772px; height:470px; max-height:70vw; min-width:220px; margin-left:auto; margin-right:auto; display:flex; align-items:center; justify-content:center; background:#f7f7f7; position:relative;">
                <button class="carousel-arrow prev" aria-label="Imagen anterior" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); z-index:2; background:rgba(255,255,255,0.7); border:none; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                  <svg width="20" height="20" viewBox="0 0 20 20" style="display:block; margin:auto; transform:rotate(180deg);" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="7,5 13,10 7,15" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <img src="${imagenes[0]}" alt="${propiedad.Titulo} - Imagen 1" id="main-image" class="main-image" style="width:100%; height:470px; max-width:772px; max-height:70vw; min-width:220px; object-fit:cover; border-radius:14px; box-shadow:0 2px 8px var(--color-shadow); display:block; background:#f7f7f7;">
                <button class="carousel-arrow next" aria-label="Siguiente imagen" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); z-index:2; background:rgba(255,255,255,0.7); border:none; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                  <svg width="20" height="20" viewBox="0 0 20 20" style="display:block; margin:auto;" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="7,5 13,10 7,15" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div class="gallery-thumbnails" style="display:flex; gap:0.5rem; margin-top:1rem; justify-content:center;">
                ${imagenes.map((img, index) => `<img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" style="aspect-ratio:1/1; width:80px; height:80px; object-fit:cover; border-radius:8px; cursor:pointer;">`).join('')}
              </div>
              <div class="lightbox-modal" id="lightbox-modal"><button class="lightbox-close" aria-label="Cerrar">×</button><img src="" alt="Imagen ampliada" id="lightbox-img"></div>
            ` : ''}
          </div>
          <!-- Ficha técnica y características debajo de la galería -->
          <div class="ficha-caracteristicas-desktop" style="margin-top:2.5rem;">
            <div class="technical-specs-section ficha-desktop" style="display:block;">
              <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin-bottom:1rem;">Ficha Técnica</h2>
              <div class="specs-list" style="width:100%; display:grid; grid-template-columns:repeat(3, 1fr); gap:0.7rem 2.5rem; margin-bottom:0.5rem;">
                ${propiedad.Dormitorios ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><path d='M3 10h18M6 10V7a3 3 0 0 1 6 0v3m-6 0v7m12-7v7m-6 0v-4a2 2 0 0 1 4 0v4'/></svg></span> Dormitorios: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Dormitorios}</span></div>` : ''}
                ${propiedad.Banos ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><path d='M7 10v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6'/><circle cx='12' cy='7' r='3'/></svg></span> Baños: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Banos}</span></div>` : ''}
                ${propiedad.Superficie ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/></svg></span> Superficie Total: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Superficie} m²</span></div>` : ''}
                ${propiedad.M2utiles ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 9h18'/></svg></span> Superficie Útil: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.M2utiles} m²</span></div>` : ''}
                ${propiedad.suites ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><circle cx='12' cy='8' r='4'/><path d='M2 20c0-4 8-6 10-6s10 2 10 6'/></svg></span> Suites: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.suites}</span></div>` : ''}
                ${propiedad.Servicio ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 4v16'/></svg></span> Servicio: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Servicio}</span></div>` : ''}
                ${propiedad.Estacionamientos ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='2' y='7' width='20' height='10' rx='2'/><circle cx='7' cy='17' r='2'/><circle cx='17' cy='17' r='2'/></svg></span> Estacionamientos: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Estacionamientos}</span></div>` : ''}
                ${propiedad.Terrazas ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 12h18'/></svg></span> Terrazas: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Terrazas}</span></div>` : ''}
                ${propiedad.Bodega ? `<div class="spec-row" style="display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);"><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'><svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M9 3v18'/></svg></span> Bodega: <span style='font-weight:700; margin-left:0.3rem;'>${propiedad.Bodega}</span></div>` : ''}
              </div>
            </div>
            
            <!-- Características expandibles -->
            <div class="caracteristicas-desktop" style="display:block; margin-top:2rem;">
              <div class="caracteristicas-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin:0;">Características destacadas</h2>
                <a href="#" class="ver-mas-caracteristicas" style="color:#1976d2; font-size:1rem; text-decoration:none; display:flex; align-items:center; gap:0.3rem; font-weight:500; background:none; border:none; cursor:pointer; padding:0;">
                  Revisar todas las características
                  <svg class="flecha-carac" style="transition:transform 0.3s;" width="18" height="18" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" fill="none" stroke="#1976d2" stroke-width="2"/></svg>
                </a>
              </div>
              <div class="caracteristicas-lista" style="width:100%; display:grid; grid-template-columns:repeat(3, 1fr); gap:0.7rem 2.5rem; margin-bottom:0.5rem;">
                ${[
                  { key: 'Piscina', label: 'Piscina', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><path d='M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2'/><path d='M2 21c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2'/></svg>` },
                  { key: 'Quincho', label: 'Quincho', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='10' width='18' height='8' rx='2'/><path d='M7 10V7a5 5 0 0 1 10 0v3'/></svg>` },
                  { key: 'sala_multiuso', label: 'Sala Multiuso', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 4v16'/></svg>` },
                  { key: 'Gimnasio', label: 'Gimnasio', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M8 12h8'/></svg>` },
                  { key: 'Lavanderia', label: 'Lavandería', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='12' cy='12' r='5'/></svg>` },
                  { key: 'Walk_in_closet', label: 'Walk-in Closet', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='4' y='4' width='16' height='16' rx='2'/><path d='M8 4v16'/></svg>` },
                  { key: 'ano_construccion', label: 'Año de construcción', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 9h18'/></svg>` },
                  { key: 'Piso', label: 'Piso', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2'/><path d='M3 12h18'/></svg>` },
                  { key: 'Orientacion', label: 'Orientación', icon: `<svg width='20' height='20' fill='none' stroke='#222' stroke-width='1.7' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>` },
                ].map(carac => {
                  let valor = propiedad[carac.key];
                  if (valor === true || valor === 'Sí') {
                    return `<div class='carac-row' style='display:flex; align-items:center; gap:0.7rem; font-size:1.08rem; color:var(--color-text-primary);'><span style='display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; background:#f5f5f5; border-radius:50%;'>${carac.icon}</span> ${carac.label}: <span style='font-weight:700; margin-left:0.3rem;'>Sí</span></div>`;
                  }
                  return '';
                }).filter(Boolean).join('')}
              </div>
            </div>
          </div>
        </div>
        <!-- Columna derecha -->
        <aside class="detalle-sidebar" style="flex:1; min-width:320px; max-width:400px; display:flex; flex-direction:column; gap:2.5rem; margin-top:0;">
          <!-- Cuadro informativo -->
          <div class="info-box" style="background:var(--color-background); border:1px solid var(--color-text-primary); border-radius:14px; box-shadow:0 2px 8px var(--color-shadow); padding:2rem; display:flex; flex-direction:column; gap:1.5rem; height:fit-content; margin-top:0;">
            ${propiedad.Tipo && propiedad.Objetivo ? `<div class="property-type" style="font-size:0.9rem; color:var(--color-text-secondary); font-weight:500; margin:0; text-transform:capitalize;">${propiedad.Tipo} en ${propiedad.Objetivo}</div>` : ''}
            <h1 class="property-main-title" style="font-size:1.6rem; margin:0; line-height:1.2; color:var(--color-text-primary);">${propiedad.Titulo}</h1>
            ${propiedad.Ubicacion ? `<div class="property-location" style="font-size:1rem; color:var(--color-text-secondary); margin:0;">📍 ${propiedad.Ubicacion}</div>` : ''}
            ${propiedad.Precio ? `<div class="property-price" style="margin:0.5rem 0;">
              <div class="price-uf" style="font-size:2rem; font-weight:700; color:var(--color-primary-accent); margin:0;">${precioUF}</div>
              ${precioCLP ? `<div class="price-clp" style="font-size:1.1rem; color:var(--color-text-secondary); margin-top:0.2rem;">${precioCLP}</div>` : ''}
            </div>` : ''}
            <div class="property-key-features" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:0.5rem;">
              ${propiedad.Dormitorios ? `<span class="feature-item" style="display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; color:var(--color-text-primary); font-weight:500;">🛏 ${propiedad.Dormitorios}</span>` : ''}
              ${propiedad.Banos ? `<span class="feature-item" style="display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; color:var(--color-text-primary); font-weight:500;">🚿 ${propiedad.Banos}</span>` : ''}
              ${propiedad.Superficie ? `<span class="feature-item" style="display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; color:var(--color-text-primary); font-weight:500; grid-column:1/-1;">🏡 ${propiedad.Superficie} m² totales</span>` : ''}
              ${propiedad.M2utiles ? `<span class="feature-item" style="display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; color:var(--color-text-primary); font-weight:500; grid-column:1/-1;">📏 ${propiedad.M2utiles} m² útiles</span>` : ''}
            </div>
          </div>
          
          <!-- Propiedades destacadas -->
          <div id="sidebar-destacadas"></div>
        </aside>
      </div>
      <!-- Sección inferior: descripción, gastos, mapa, contacto, solo debajo de ambas columnas -->
      <div class="detalle-inferior" style="margin-top:3rem;">
        ${propiedad.Descripcion ? `<div class="description-section"><h2 class="section-title">Descripción</h2><div class="description-content">${propiedad.Descripcion}</div></div>` : ''}
        ${(propiedad.Gastos_comunes || propiedad.Contribuciones) ? `<div class="expenses-section"><h2 class="section-title">Gastos de Mantención</h2><div class="expenses-list">${propiedad.Gastos_comunes ? `<div class="expense-item"><span class="expense-label">Gastos Comunes:</span><span class="expense-value">${formatearPrecioCLP(propiedad.Gastos_comunes)}</span></div>` : ''}${propiedad.Contribuciones ? `<div class="expense-item"><span class="expense-label">Contribuciones:</span><span class="expense-value">${formatearPrecioCLP(propiedad.Contribuciones)}</span></div>` : ''}</div></div>` : ''}
        ${(propiedad.Region || propiedad.Ubicacion) ? `<div class="location-section"><h2 class="section-title">Ubicación</h2><div class="location-info">${propiedad.Region ? `<div class="location-region">${propiedad.Region}</div>` : ''}${propiedad.Ubicacion ? `<div class="location-area">${propiedad.Ubicacion}</div>` : ''}</div><div class="location-map"><iframe src="https://www.google.com/maps?q=${encodeURIComponent(propiedad.Ubicacion || propiedad.Region)}&z=13&output=embed" width="100%" height="300" style="border:0; border-radius:12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div>` : ''}
        <div class="contact-section"><a id="whatsapp-link" href="#" class="contact-button" target="_blank" rel="noopener"><span class="contact-icon">💬</span><span class="contact-text">Contactar por esta propiedad</span></a></div>
      </div>
      <!-- Mobile: ficha técnica y características debajo de la descripción -->
      <div class="technical-specs-section ficha-mobile" style="display:block;">
        <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin-bottom:1rem;">Ficha Técnica</h2>
        <div class="specs-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:0.75rem;">
          ${propiedad.Dormitorios ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Dormitorios</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Dormitorios}</span>
          </div>` : ''}
          ${propiedad.Banos ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Baños</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Banos}</span>
          </div>` : ''}
          ${propiedad.Superficie ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Superficie Total</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Superficie} m²</span>
          </div>` : ''}
          ${propiedad.M2utiles ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Superficie Útil</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.M2utiles} m²</span>
          </div>` : ''}
          ${propiedad.suites ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Suites</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.suites}</span>
          </div>` : ''}
          ${propiedad.Servicio ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Servicio</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Servicio}</span>
          </div>` : ''}
          ${propiedad.Estacionamientos ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Estacionamientos</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Estacionamientos}</span>
          </div>` : ''}
          ${propiedad.Terrazas ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Terrazas</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Terrazas}</span>
          </div>` : ''}
          ${propiedad.Bodega ? `<div class="spec-item" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:#f8f8f8; border-radius:8px;">
            <span class="spec-label" style="font-weight:600; color:var(--color-text-primary); font-size:0.9rem;">Bodega</span>
            <span class="spec-value" style="font-weight:700; color:var(--color-primary-accent);">${propiedad.Bodega}</span>
          </div>` : ''}
        </div>
      </div>
      
      <!-- Características móviles expandibles -->
      <div class="caracteristicas-mobile" style="display:block; margin-top:2rem;">
        <div class="caracteristicas-header-mobile" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 class="section-title" style="font-size:1.2rem; text-align:left; margin:0;">Características destacadas</h2>
          <a href="#" class="ver-mas-caracteristicas-mobile" style="color:#1976d2; font-size:1rem; text-decoration:none; display:flex; align-items:center; gap:0.3rem; font-weight:500; background:none; border:none; cursor:pointer; padding:0;">
            Revisar todas las características
            <svg class="flecha-carac-mobile" style="transition:transform 0.3s;" width="18" height="18" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" fill="none" stroke="#1976d2" stroke-width="2"/></svg>
          </a>
        </div>
        <div class="caracteristicas-content-mobile" style="display:none;">
          ${getCaracteristicasHTML('mobile')}
        </div>
      </div>
    `;
  }

  configurarWhatsApp(propiedad.Titulo);
  cargarSidebarDestacadas(propiedad);
  
  // Inicializar galería si hay más de una imagen
  if (imagenes.length > 1) {
    setTimeout(() => { inicializarGaleria(imagenes); }, 100);
  }

  // Mostrar ficha técnica y características en desktop/móvil según tamaño de pantalla
  function ajustarFichaTecnicaYCaracteristicas() {
    const fichaDesktop = document.querySelector('.ficha-desktop');
    const fichaMobile = document.querySelector('.ficha-mobile');
    const caracDesktop = document.querySelector('.caracteristicas-desktop');
    const caracMobile = document.querySelector('.caracteristicas-mobile');
    const infoBoxDesktop = document.querySelector('.info-box');
    const infoBoxMobile = document.querySelector('.info-box-mobile');
    
    if (window.innerWidth >= 1024) {
      // Desktop
      if (fichaDesktop) fichaDesktop.style.display = 'block';
      if (fichaMobile) fichaMobile.style.display = 'none';
      if (caracDesktop) caracDesktop.style.display = 'block';
      if (caracMobile) caracMobile.style.display = 'none';
      if (infoBoxDesktop) infoBoxDesktop.style.display = 'flex';
      if (infoBoxMobile) infoBoxMobile.style.display = 'none';
    } else {
      // Móvil
      if (fichaDesktop) fichaDesktop.style.display = 'none';
      if (fichaMobile) fichaMobile.style.display = 'block';
      if (caracDesktop) caracDesktop.style.display = 'none';
      if (caracMobile) caracMobile.style.display = 'block';
      if (infoBoxDesktop) infoBoxDesktop.style.display = 'none';
      if (infoBoxMobile) infoBoxMobile.style.display = 'flex';
    }
  }
  ajustarFichaTecnicaYCaracteristicas();
  window.addEventListener('resize', ajustarFichaTecnicaYCaracteristicas);

  // Funcionalidad para el botón "Ver más características" (Desktop)
  const verMasBtn = document.querySelector('.ver-mas-caracteristicas');
  const caracteristicasContent = document.querySelector('.caracteristicas-content');
  const flechaCarac = document.querySelector('.flecha-carac');
  
  if (verMasBtn && caracteristicasContent) {
    verMasBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const isVisible = caracteristicasContent.style.display !== 'none';
      if (isVisible) {
        caracteristicasContent.style.display = 'none';
        verMasBtn.querySelector('span').textContent = 'Revisar todas las características';
        if (flechaCarac) flechaCarac.style.transform = 'rotate(0deg)';
      } else {
        caracteristicasContent.style.display = 'block';
        verMasBtn.querySelector('span').textContent = 'Ocultar características';
        if (flechaCarac) flechaCarac.style.transform = 'rotate(180deg)';
      }
    });
  }

  // Funcionalidad para el botón "Ver más características" (Móvil)
  const verMasBtnMobile = document.querySelector('.ver-mas-caracteristicas-mobile');
  const caracteristicasContentMobile = document.querySelector('.caracteristicas-content-mobile');
  const flechaCaracMobile = document.querySelector('.flecha-carac-mobile');
  
  if (verMasBtnMobile && caracteristicasContentMobile) {
    verMasBtnMobile.addEventListener('click', function(e) {
      e.preventDefault();
      const isVisible = caracteristicasContentMobile.style.display !== 'none';
      if (isVisible) {
        caracteristicasContentMobile.style.display = 'none';
        verMasBtnMobile.querySelector('span').textContent = 'Revisar todas las características';
        if (flechaCaracMobile) flechaCaracMobile.style.transform = 'rotate(0deg)';
      } else {
        caracteristicasContentMobile.style.display = 'block';
        verMasBtnMobile.querySelector('span').textContent = 'Ocultar características';
        if (flechaCaracMobile) flechaCaracMobile.style.transform = 'rotate(180deg)';
      }
    });
  }

  // La funcionalidad de la galería se maneja completamente en inicializarGaleria()
  // No necesitamos código adicional aquí
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
 * Inicializa la funcionalidad de la galería
 * @param {Array} imagenes - Array de URLs de imágenes
 */
function inicializarGaleria(imagenes) {
  console.log('🖼️ Inicializando galería con', imagenes.length, 'imágenes');
  
  let current = 0;
  const mainImg = document.getElementById('main-image');
  const thumbs = document.querySelectorAll('.gallery-thumbnails img');
  // Usar los selectores correctos para las flechas (los que se generan en el HTML dinámico)
  const left = document.querySelector('.gallery-main .carousel-arrow.prev');
  const right = document.querySelector('.gallery-main .carousel-arrow.next');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeLightbox = document.querySelector('.lightbox-close');

  console.log('🔍 Elementos encontrados:', {
    mainImg: !!mainImg,
    thumbs: thumbs.length,
    left: !!left,
    right: !!right
  });

  if (!mainImg || !thumbs.length) {
    console.log('❌ No se encontraron elementos necesarios para la galería');
    return;
  }

  function showImage(idx) {
    current = idx;
    console.log('🖼️ Mostrando imagen', current + 1, 'de', imagenes.length);
    mainImg.src = imagenes[current];
    // Actualizar la clase 'active' en los thumbnails
    thumbs.forEach((t, i) => {
      const isActive = i === current;
      t.classList.toggle('active', isActive);
      console.log(`  Thumbnail ${i + 1}: ${isActive ? 'ACTIVO' : 'inactivo'}`);
    });
  }

  // Agregar event listeners para las flechas
  if (left) {
    console.log('⬅️ Agregando event listener a flecha izquierda');
    left.addEventListener('click', () => {
      console.log('⬅️ Flecha izquierda clickeada');
      showImage((current - 1 + imagenes.length) % imagenes.length);
    });
  }
  if (right) {
    console.log('➡️ Agregando event listener a flecha derecha');
    right.addEventListener('click', () => {
      console.log('➡️ Flecha derecha clickeada');
      showImage((current + 1) % imagenes.length);
    });
  }
  
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
  console.log('✅ Galería inicializada correctamente');
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