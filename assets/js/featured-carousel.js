// =============================
// CARRUSEL DE PROPIEDADES DESTACADAS
// Componente modular y reutilizable
// =============================

class FeaturedPropertiesCarousel {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.options = {
      autoPlay: options.autoPlay !== false, // Por defecto activado
      autoPlayInterval: options.autoPlayInterval || 5000, // 5 segundos
      showIndicators: options.showIndicators !== false, // Por defecto activado
      showArrows: options.showArrows !== false, // Por defecto activado
      itemsPerView: options.itemsPerView || this.getItemsPerView(), // Detectar automáticamente
      propertyType: options.propertyType || 'venta', // Tipo de propiedades: 'venta' o 'arriendo'
      ...options
    };
    
    this.currentIndex = 0;
    this.totalItems = 0;
    this.autoPlayTimer = null;
    this.isAnimating = false;
    
    if (this.container) {
      this.init();
    } else {
      console.error(`Contenedor no encontrado: ${containerSelector}`);
    }
  }

  async init() {
    try {
      // Mostrar estado de carga
      this.showLoading();
      
      // Cargar propiedades destacadas
      const propiedades = await this.loadFeaturedProperties();
      
      if (propiedades.length === 0) {
        this.showEmptyState();
        return;
      }
      
      // Renderizar el carrusel
      this.renderCarousel(propiedades);
      
      // Inicializar controles
      this.initControls();
      
      // Iniciar autoplay si está habilitado
      if (this.options.autoPlay) {
        this.startAutoPlay();
      }
      
    } catch (error) {
      console.error('Error al inicializar el carrusel:', error);
      this.showErrorState();
    }
  }

  async loadFeaturedProperties() {
    try {
      const api = new StrapiAPI();
      
      // Cargar propiedades según el tipo especificado
      if (this.options.propertyType === 'arriendo') {
        return await api.getPropiedadesDestacadasArriendo();
      } else {
        return await api.getPropiedadesDestacadas();
      }
    } catch (error) {
      console.error('Error al cargar propiedades destacadas:', error);
      return [];
    }
  }

  /**
   * Carga propiedades destacadas con datos pre-cargados opcionales
   * @param {Array} propiedadesPreCargadas - Propiedades ya cargadas (opcional)
   */
  async loadFeaturedPropertiesOptimized(propiedadesPreCargadas = null) {
    if (propiedadesPreCargadas && propiedadesPreCargadas.length > 0) {
      console.log('📦 Usando propiedades pre-cargadas:', propiedadesPreCargadas.length);
      return propiedadesPreCargadas;
    }
    
    return await this.loadFeaturedProperties();
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="featured-loading">
        Cargando propiedades destacadas...
      </div>
    `;
  }

  showEmptyState() {
    this.container.innerHTML = `
      <div class="featured-loading">
        No hay propiedades destacadas disponibles en este momento.
      </div>
    `;
  }

  showErrorState() {
    this.container.innerHTML = `
      <div class="featured-loading">
        Error al cargar las propiedades destacadas. Por favor, intenta de nuevo.
      </div>
    `;
  }

  renderCarousel(propiedades) {
    this.totalItems = propiedades.length;
    
    const html = `
      <div class="featured-properties-section">
        <div class="featured-properties-container">
          ${this.options.showArrows ? this.createArrows() : ''}
          
          <div class="featured-carousel">
            <div class="featured-carousel-track">
              ${propiedades.map(propiedad => this.createPropertyCard(propiedad)).join('')}
            </div>
          </div>
          
          ${this.options.showIndicators ? this.createIndicators() : ''}
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    // Obtener referencias a los elementos del carrusel
    this.track = this.container.querySelector('.featured-carousel-track');
    this.indicators = this.container.querySelectorAll('.carousel-indicator');
    this.prevArrow = this.container.querySelector('.carousel-arrow.prev');
    this.nextArrow = this.container.querySelector('.carousel-arrow.next');
    
    // Actualizar estado inicial
    this.updateControls();
  }

  createArrows() {
    return `
      <button class="carousel-arrow prev" aria-label="Propiedad anterior">
        <span>‹</span>
      </button>
      <button class="carousel-arrow next" aria-label="Siguiente propiedad">
        <span>›</span>
      </button>
    `;
  }

  createIndicators() {
    const indicators = [];
    const totalIndicators = Math.ceil(this.totalItems / this.options.itemsPerView);
    
    for (let i = 0; i < totalIndicators; i++) {
      indicators.push(`
        <button class="carousel-indicator ${i === 0 ? 'active' : ''}" 
                data-index="${i}" 
                aria-label="Ir a slide ${i + 1}">
        </button>
      `);
    }
    
    return `<div class="carousel-indicators">${indicators.join('')}</div>`;
  }

  createPropertyCard(propiedad) {
    const imagen = this.getPrimeraImagen(propiedad);
    const precio = this.formatearPrecio(propiedad.Precio);
    
    return `
      <div class="featured-property-card">
        <img src="${imagen}" alt="${propiedad.Titulo}" class="featured-property-image" />
        <div class="featured-property-content">
          <h3 class="featured-property-title">${propiedad.Titulo}</h3>
          <div class="featured-property-location">${propiedad.Ubicacion}</div>
          <div class="featured-property-price">${precio}</div>
          <div class="featured-property-features">
            <span>🛏 ${propiedad.Dormitorios}</span>
            <span>🚿 ${propiedad.Banos}</span>
            <span>🏡 ${propiedad.Superficie} m²</span>
          </div>
          <a href="/propiedad-dinamica.html?slug=${propiedad.Slug}" class="featured-property-btn">
            Ver Propiedad
          </a>
        </div>
      </div>
    `;
  }

  initControls() {
    // Event listeners para flechas
    if (this.prevArrow) {
      this.prevArrow.addEventListener('click', () => this.prev());
    }
    
    if (this.nextArrow) {
      this.nextArrow.addEventListener('click', () => this.next());
    }
    
    // Event listeners para indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Event listeners para teclado
    document.addEventListener('keydown', (e) => {
      if (this.container.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        }
      }
    });
    
    // Pausar autoplay al hacer hover
    if (this.options.autoPlay) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
    }
    
    // Event listener para cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      // Debounce para evitar demasiadas actualizaciones
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.updateItemsPerView();
      }, 250);
    });
  }

  prev() {
    if (this.isAnimating) return;
    
    const maxIndex = Math.ceil(this.totalItems / this.options.itemsPerView) - 1;
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : maxIndex;
    this.updateCarousel();
  }

  next() {
    if (this.isAnimating) return;
    
    const maxIndex = Math.ceil(this.totalItems / this.options.itemsPerView) - 1;
    this.currentIndex = this.currentIndex < maxIndex ? this.currentIndex + 1 : 0;
    this.updateCarousel();
  }

  goToSlide(index) {
    if (this.isAnimating) return;
    
    this.currentIndex = index;
    this.updateCarousel();
  }

  updateCarousel() {
    this.isAnimating = true;
    
    // Calcular el desplazamiento
    const cardWidth = this.track.querySelector('.featured-property-card').offsetWidth;
    const gap = 32; // 2rem en píxeles
    const translateX = -(this.currentIndex * (cardWidth + gap) * this.options.itemsPerView);
    
    // Aplicar transformación
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Actualizar controles
    this.updateControls();
    
    // Resetear autoplay
    if (this.options.autoPlay) {
      this.resetAutoPlay();
    }
    
    // Marcar animación como completada
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  updateControls() {
    const maxIndex = Math.ceil(this.totalItems / this.options.itemsPerView) - 1;
    
    // Actualizar flechas
    if (this.prevArrow) {
      this.prevArrow.disabled = this.currentIndex === 0;
    }
    
    if (this.nextArrow) {
      this.nextArrow.disabled = this.currentIndex === maxIndex;
    }
    
    // Actualizar indicadores
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentIndex);
    });
  }

  startAutoPlay() {
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.options.autoPlayInterval);
  }

  pauseAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resumeAutoPlay() {
    if (this.options.autoPlay && !this.autoPlayTimer) {
      this.startAutoPlay();
    }
  }

  resetAutoPlay() {
    this.pauseAutoPlay();
    this.resumeAutoPlay();
  }

  // Métodos de utilidad
  getPrimeraImagen(propiedad) {
    if (propiedad.Imagenes && propiedad.Imagenes.length > 0) {
      return propiedad.Imagenes[0].url;
    }
    return '/assets/images/propiedad-default.jpg';
  }

  formatearPrecio(precio) {
    if (!precio) return 'Consultar';
    
    // Usar la función global que formatea en UF
    if (typeof window.StrapiUtils !== 'undefined' && window.StrapiUtils.formatearPrecio) {
      return window.StrapiUtils.formatearPrecio(precio);
    }
    
    // Fallback: formateo básico en UF
    return `UF ${precio.toLocaleString('es-CL')}`;
  }

  // Método público para destruir el carrusel
  destroy() {
    this.pauseAutoPlay();
    
    if (this.prevArrow) {
      this.prevArrow.removeEventListener('click', this.prev);
    }
    
    if (this.nextArrow) {
      this.nextArrow.removeEventListener('click', this.next);
    }
    
    this.indicators.forEach(indicator => {
      indicator.removeEventListener('click', this.goToSlide);
    });
  }

  // Método para detectar automáticamente el número de elementos por vista
  getItemsPerView() {
    const width = window.innerWidth;
    if (width <= 480) return 2; // Móvil pequeño: 2 elementos
    if (width <= 768) return 2; // Móvil: 2 elementos
    if (width <= 1024) return 2; // Tablet: 2 elementos
    return 3; // Desktop: 3 elementos
  }

  // Método para actualizar la configuración cuando cambia el tamaño de pantalla
  updateItemsPerView() {
    const newItemsPerView = this.getItemsPerView();
    if (newItemsPerView !== this.options.itemsPerView) {
      this.options.itemsPerView = newItemsPerView;
      this.currentIndex = 0; // Resetear al primer slide
      this.updateCarousel();
    }
  }

  /**
   * Inicializa el carrusel con propiedades pre-cargadas
   * @param {Array} propiedadesPreCargadas - Propiedades ya cargadas
   */
  async initWithData(propiedadesPreCargadas) {
    try {
      // Mostrar estado de carga
      this.showLoading();
      
      if (!propiedadesPreCargadas || propiedadesPreCargadas.length === 0) {
        this.showEmptyState();
        return;
      }
      
      // Renderizar el carrusel
      this.renderCarousel(propiedadesPreCargadas);
      
      // Inicializar controles
      this.initControls();
      
      // Iniciar autoplay si está habilitado
      if (this.options.autoPlay) {
        this.startAutoPlay();
      }
      
    } catch (error) {
      console.error('Error al inicializar el carrusel con datos:', error);
      this.showErrorState();
    }
  }
}

// =============================
// FUNCIÓN GLOBAL PARA INICIALIZAR EL CARRUSEL
// =============================

/**
 * Inicializa el carrusel de propiedades destacadas
 * @param {string} containerSelector - Selector del contenedor
 * @param {Object} options - Opciones de configuración
 * @returns {FeaturedPropertiesCarousel} Instancia del carrusel
 */
function initFeaturedCarousel(containerSelector = '.featured-properties-carousel', options = {}) {
  return new FeaturedPropertiesCarousel(containerSelector, options);
}

// =============================
// FUNCIÓN PARA CARGAR PROPIEDADES DESTACADAS (COMPATIBILIDAD)
// =============================

/**
 * Carga propiedades destacadas en el carrusel (versión optimizada)
 * @param {string} containerSelector - Selector del contenedor
 * @param {Array} propiedadesPreCargadas - Propiedades ya cargadas (opcional)
 */
async function cargarPropiedadesDestacadasCarousel(containerSelector = '.featured-properties-carousel', propiedadesPreCargadas = null) {
  try {
    const carousel = new FeaturedPropertiesCarousel(containerSelector, {
      propertyType: 'venta',
      autoPlay: true,
      autoPlayInterval: 5000
    });
    
    if (propiedadesPreCargadas) {
      await carousel.initWithData(propiedadesPreCargadas);
    } else {
      await carousel.init();
    }
  } catch (error) {
    console.error('Error al cargar carrusel de propiedades destacadas:', error);
  }
}

// =============================
// FUNCIÓN PARA CARGAR PROPIEDADES DESTACADAS EN ARRIENDO
// =============================

/**
 * Carga propiedades destacadas en arriendo en el carrusel (versión optimizada)
 * @param {string} containerSelector - Selector del contenedor
 * @param {Array} propiedadesPreCargadas - Propiedades ya cargadas (opcional)
 */
async function cargarPropiedadesDestacadasArriendoCarousel(containerSelector = '.featured-rental-properties-carousel', propiedadesPreCargadas = null) {
  try {
    const carousel = new FeaturedPropertiesCarousel(containerSelector, {
      propertyType: 'arriendo',
      autoPlay: true,
      autoPlayInterval: 5000
    });
    
    if (propiedadesPreCargadas) {
      await carousel.initWithData(propiedadesPreCargadas);
    } else {
      await carousel.init();
    }
  } catch (error) {
    console.error('Error al cargar carrusel de propiedades destacadas en arriendo:', error);
  }
}

// =============================
// EXPORTAR FUNCIONES GLOBALMENTE
// =============================

// Hacer las funciones disponibles globalmente
window.cargarPropiedadesDestacadasCarousel = cargarPropiedadesDestacadasCarousel;
window.cargarPropiedadesDestacadasArriendoCarousel = cargarPropiedadesDestacadasArriendoCarousel;
window.initFeaturedCarousel = initFeaturedCarousel; 