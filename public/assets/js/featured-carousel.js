// =============================
// CARRUSEL DE PROPIEDADES DESTACADAS - VERSION ESTÁTICA
// Componente modular que trabaja solo con datos pre-cargados
// =============================

class StaticPropertiesCarousel {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    this.options = {
      autoPlay: options.autoPlay !== false,
      autoPlayInterval: options.autoPlayInterval || 5000,
      showIndicators: options.showIndicators !== false,
      showArrows: options.showArrows !== false,
      itemsPerView: options.itemsPerView || this.getItemsPerView(),
      ...options
    };
    
    this.currentIndex = 0;
    this.totalItems = 0;
    this.autoPlayTimer = null;
    this.isAnimating = false;
    
    if (!this.container) {
      console.error(`Contenedor no encontrado: ${containerSelector}`);
    }
  }

  /**
   * Inicializa el carrusel con datos pre-cargados
   * @param {Array} propiedades - Array de propiedades ya cargadas desde Astro
   */
  initWithData(propiedades) {
    try {
      if (!propiedades || propiedades.length === 0) {
        this.showEmptyState();
        return;
      }
      
      console.log(`🎠 Inicializando carrusel con ${propiedades.length} propiedades pre-cargadas`);
      
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
        Error al cargar las propiedades destacadas.
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
    // Usar la misma lógica que funciona en las páginas de propiedades
    const datos = propiedad; // Acceso directo, no attributes
    const imagen = this.getPrimeraImagen(datos);
    const precio = this.formatearPrecio(datos.Precio, datos.Precio_CLP);
    
    // Crear características condicionales usando la misma lógica que las páginas
    const dormitorios = datos.Dormitorios ? `
      <span>
        <img src="/assets/icons/bed.svg" alt="Dormitorios" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;">
        ${datos.Dormitorios}
      </span>
    ` : '';
    
    const banos = datos.Banos ? `
      <span>
        <img src="/assets/icons/shower.svg" alt="Baños" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;">
        ${datos.Banos}
      </span>
    ` : '';
    
    const superficie = datos.Superficie ? `
      <span>
        <img src="/assets/icons/mt2.svg" alt="Metros cuadrados" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;">
        ${datos.Superficie} m²
      </span>
    ` : '';
    
    const m2utiles = datos.M2utiles ? `
      <span>
        <img src="/assets/icons/utiles.svg" alt="Metros útiles" style="width:16px; height:16px; vertical-align:middle; margin-right:4px;">
        ${datos.M2utiles} m²
      </span>
    ` : '';
    
    return `
      <div class="featured-property-card">
        <a href="/propiedades/${datos.Slug}" class="featured-property-image-link">
          <img src="${imagen}" alt="${datos.Titulo}" class="featured-property-image" />
        </a>
        <div class="featured-property-content">
          <h3 class="featured-property-title">${datos.Titulo}</h3>
          <div class="featured-property-location">${datos.Ubicacion}</div>
          <div class="featured-property-price">${precio}</div>
          <div class="featured-property-features">
            ${dormitorios}
            ${banos}
            ${superficie}
            ${m2utiles}
          </div>
          <a href="/propiedades/${datos.Slug}" class="featured-property-btn">
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

    // Pausar autoplay en hover
    if (this.container) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
    }

    // Responsive
    window.addEventListener('resize', () => this.updateItemsPerView());
  }

  prev() {
    if (this.isAnimating || this.currentIndex === 0) return;
    this.goToSlide(this.currentIndex - 1);
  }

  next() {
    if (this.isAnimating) return;
    const maxIndex = Math.ceil(this.totalItems / this.options.itemsPerView) - 1;
    if (this.currentIndex < maxIndex) {
      this.goToSlide(this.currentIndex + 1);
    }
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.currentIndex = index;
    this.updateCarousel();
    this.updateControls();
    this.resetAutoPlay();
  }

  updateCarousel() {
    if (!this.track) return;
    
    this.isAnimating = true;
    
    // Calcular el translateX basado en el tamaño de pantalla
    let translateX;
    if (window.innerWidth <= 480) {
      // En móvil muy pequeño: mover de 2 en 2 tarjetas
      translateX = -(this.currentIndex * 100);
    } else if (window.innerWidth <= 768) {
      // En móvil: mover de 2 en 2 tarjetas
      translateX = -(this.currentIndex * 100);
    } else {
      // En desktop: usar el cálculo original
      translateX = -(this.currentIndex * 100);
    }
    
    this.track.style.transform = `translateX(${translateX}%)`;
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }

  updateControls() {
    // Actualizar indicadores
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });

    // Actualizar flechas - deshabilitar completamente en extremos
    const maxIndex = Math.ceil(this.totalItems / this.options.itemsPerView) - 1;
    
    if (this.prevArrow) {
      if (this.currentIndex === 0) {
        this.prevArrow.style.opacity = '0.3';
        this.prevArrow.style.cursor = 'not-allowed';
        this.prevArrow.disabled = true;
      } else {
        this.prevArrow.style.opacity = '1';
        this.prevArrow.style.cursor = 'pointer';
        this.prevArrow.disabled = false;
      }
    }
    
    if (this.nextArrow) {
      if (this.currentIndex === maxIndex) {
        this.nextArrow.style.opacity = '0.3';
        this.nextArrow.style.cursor = 'not-allowed';
        this.nextArrow.disabled = true;
      } else {
        this.nextArrow.style.opacity = '1';
        this.nextArrow.style.cursor = 'pointer';
        this.nextArrow.disabled = false;
      }
    }
  }

  startAutoPlay() {
    if (!this.options.autoPlay) return;
    
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
    if (this.options.autoPlay) {
      this.pauseAutoPlay();
      this.startAutoPlay();
    }
  }

  getPrimeraImagen(propiedad) {
    // Manejar formato de Strapi (con attributes)
    if (propiedad.attributes?.Imagenes?.data?.length > 0) {
      const imagen = propiedad.attributes.Imagenes.data[0];
      const url = imagen.attributes?.url || imagen.url;
      return url.startsWith('http') ? url : `https://truthful-rhythm-e8bcafa766.strapiapp.com${url}`;
    }
    
    // Manejar formato simplificado
    if (propiedad.Imagenes?.length > 0) {
      const imagen = propiedad.Imagenes[0];
      const url = imagen.url || imagen;
      return url.startsWith('http') ? url : `https://truthful-rhythm-e8bcafa766.strapiapp.com${url}`;
    }
    
    return '/assets/images/propiedad-default.jpg';
  }

  formatearPrecio(precio, precioCLP) {
    if (precio) {
      return `UF ${precio.toLocaleString('es-CL')}`;
    } else if (precioCLP) {
      return `CLP ${precioCLP.toLocaleString('es-CL')}`;
    } else {
      return 'Consultar';
    }
  }

  destroy() {
    // Limpiar event listeners y timers
    this.pauseAutoPlay();
    
    if (this.container) {
      this.container.removeEventListener('mouseenter', () => this.pauseAutoPlay());
      this.container.removeEventListener('mouseleave', () => this.resumeAutoPlay());
    }
    
    window.removeEventListener('resize', () => this.updateItemsPerView());
    
    // Limpiar referencias
    this.container = null;
    this.track = null;
    this.indicators = null;
    this.prevArrow = null;
    this.nextArrow = null;
  }

  getItemsPerView() {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 2; // Cambiado de 1 a 2 para móvil
  }

  updateItemsPerView() {
    const newItemsPerView = this.getItemsPerView();
    if (newItemsPerView !== this.options.itemsPerView) {
      this.options.itemsPerView = newItemsPerView;
      this.currentIndex = 0;
      this.updateCarousel();
      this.updateControls();
    }
  }
}

// =============================
// Funciones de conveniencia para usar desde Astro
// =============================

/**
 * Inicializa un carrusel de propiedades destacadas con datos pre-cargados
 * @param {string} containerSelector - Selector del contenedor
 * @param {Array} propiedadesPreCargadas - Propiedades ya cargadas desde Astro
 * @param {Object} options - Opciones del carrusel
 */
function cargarPropiedadesDestacadasCarousel(containerSelector = '.featured-properties-carousel', propiedadesPreCargadas = null, options = {}) {
  if (!propiedadesPreCargadas || propiedadesPreCargadas.length === 0) {
    console.warn('No se proporcionaron propiedades pre-cargadas para el carrusel de venta');
    return;
  }

  console.log(`🎠 Inicializando carrusel de venta con ${propiedadesPreCargadas.length} propiedades`);
  
  const carousel = new StaticPropertiesCarousel(containerSelector, options);
  carousel.initWithData(propiedadesPreCargadas);
  
  return carousel;
}

/**
 * Inicializa un carrusel de propiedades destacadas en arriendo con datos pre-cargados
 * @param {string} containerSelector - Selector del contenedor  
 * @param {Array} propiedadesPreCargadas - Propiedades ya cargadas desde Astro
 * @param {Object} options - Opciones del carrusel
 */
function cargarPropiedadesDestacadasArriendoCarousel(containerSelector = '.featured-rental-properties-carousel', propiedadesPreCargadas = null, options = {}) {
  if (!propiedadesPreCargadas || propiedadesPreCargadas.length === 0) {
    console.warn('No se proporcionaron propiedades pre-cargadas para el carrusel de arriendo');
    return;
  }

  console.log(`🎠 Inicializando carrusel de arriendo con ${propiedadesPreCargadas.length} propiedades`);
  
  const carousel = new StaticPropertiesCarousel(containerSelector, options);
  carousel.initWithData(propiedadesPreCargadas);
  
  return carousel;
}

// =============================
// Exportar funciones globales
// =============================
window.StaticPropertiesCarousel = StaticPropertiesCarousel;
window.cargarPropiedadesDestacadasCarousel = cargarPropiedadesDestacadasCarousel;
window.cargarPropiedadesDestacadasArriendoCarousel = cargarPropiedadesDestacadasArriendoCarousel;

console.log('✅ Carrusel estático cargado correctamente - Sin llamadas a Strapi'); 