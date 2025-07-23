// =============================
// CARRUSEL DE PROPIEDADES DESTACADAS - VERSION ESTÁTICA (FIXED)
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
      
      // Guardar las propiedades originales para re-renderizar
      this.propiedadesOriginales = propiedades;
      
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
    const isMobile = window.innerWidth <= 768;
    
    // DEBUG: Verificar que tenemos las mismas propiedades en ambos casos
    console.log(`📱 ${isMobile ? 'MOBILE' : 'DESKTOP'}: Renderizando ${propiedades.length} propiedades`);
    console.log('Propiedades:', propiedades.map(p => p.Titulo || p.attributes?.Titulo));
    
    if (isMobile) {
      // En mobile: usar estructura similar a "Propiedades Similares"
      const html = `
        <div class="featured-properties-section">
          <div class="featured-properties-container">
            ${this.options.showArrows ? this.createArrows() : ''}
            
            <div class="featured-carousel">
              <div class="featured-carousel-track mobile-similar-layout" style="display:flex; flex-direction:row; gap:1.5rem; overflow-x: auto; padding-bottom: 1rem;">
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
      
      // En mobile, no necesitamos actualizar controles inicialmente
      // ya que usamos scroll horizontal natural
    } else {
      // DESKTOP: Asegurar que TODAS las propiedades se rendericen
      const html = `
        <div class="featured-properties-section">
          <div class="featured-properties-container">
            ${this.options.showArrows ? this.createArrows() : ''}
            
            <div class="featured-carousel" style="overflow: hidden; width: 100%;">
              <div class="featured-carousel-track" style="display: flex; gap: 2rem; transition: transform 0.5s ease-in-out; will-change: transform; width: max-content;">
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
      
      // DEBUG: Verificar que las tarjetas se crearon correctamente
      const cards = this.track.querySelectorAll('.featured-property-card');
      console.log(`🖥️ DESKTOP: Se crearon ${cards.length} tarjetas en el DOM`);
      
      // Actualizar estado inicial
      this.updateControls();
    }
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
    const isMobile = window.innerWidth <= 768;
    let totalIndicators;
    
    if (isMobile) {
      // En mobile, cada indicador representa un elemento
      totalIndicators = this.totalItems;
    } else {
      // En desktop, cada indicador representa una "vista" que puede mostrar hasta itemsPerView elementos
      // Pero calculamos cuántas "posiciones" diferentes puede tener el carrusel
      const maxStartIndex = Math.max(0, this.totalItems - this.options.itemsPerView);
      totalIndicators = maxStartIndex + 1;
    }
    
    const indicators = [];
    
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
    
    // Detectar si estamos en mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Diseño mobile similar a "Propiedades Similares" pero con íconos de características
      return `
        <div class="featured-property-card mobile-similar-style">
          <a href="/propiedades/${datos.Slug}" class="featured-property-image-link">
            <div style="width:100%; aspect-ratio:1/1; background:#f5f5f5; display:flex; align-items:center; justify-content:center;">
              <img src="${imagen}" alt="${datos.Titulo}" style="width:100%; height:100%; object-fit:cover; display:block;" />
            </div>
          </a>
          <div style="padding:1.1rem 1rem 1rem 1rem; display:flex; flex-direction:column; gap:0.3rem; align-items:flex-start;">
            <div style="font-family:var(--font-primary); font-weight:600; font-size:1.08rem; color:var(--color-text-primary); margin-bottom:0.2rem; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${datos.Titulo}</div>
            <div style="font-size:1rem; color:var(--color-primary-accent); font-weight:600;">${precio}</div>
            <div style="font-size:0.95rem; color:var(--color-text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${datos.Ubicacion || ''}</div>
            <div class="featured-property-features mobile-features" style="display:flex; gap:0.5rem; margin-top:0.5rem; flex-wrap:wrap;">
              ${dormitorios}
              ${banos}
              ${superficie}
              ${m2utiles}
            </div>
            <a href="/propiedades/${datos.Slug}" class="featured-property-btn mobile-btn" style="margin-top:0.75rem; padding:0.5rem 1rem; font-size:0.85rem; background:rgba(255,255,255,0.95); color:#000; border:1px solid #000; text-decoration:none; border-radius:6px; text-align:center; display:inline-block; transition:all 0.3s ease;">
              Ver Propiedad
            </a>
          </div>
        </div>
      `;
    } else {
      // Diseño desktop: usar un ancho fijo en píxeles para evitar problemas de cálculo
      // Esto asegura que todas las tarjetas tengan el mismo ancho independientemente de cuántas sean
      const cardWidth = '320px'; // Actualizado de 350px a 320px para coincidir con CSS
      
      return `
        <div class="featured-property-card" style="flex: 0 0 ${cardWidth}; min-width: ${cardWidth};">
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

    // SOLO en mobile: detectar scroll para actualizar estado
    if (window.innerWidth <= 768 && this.track) {
      this.track.addEventListener('scroll', () => {
        if (!this.isAnimating) {
          this.updateControls();
        }
      });
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
    
    const isMobile = window.innerWidth <= 768;
    let maxIndex;
    
    if (isMobile) {
      maxIndex = this.totalItems - 1;
    } else {
      // En desktop: el índice máximo es cuando ya no podemos mostrar itemsPerView completos
      maxIndex = Math.max(0, this.totalItems - this.options.itemsPerView);
    }
    
    if (this.currentIndex < maxIndex) {
      this.goToSlide(this.currentIndex + 1);
    } else {
      // Opcional: ir al inicio al llegar al final
      // this.goToSlide(0);
    }
  }

  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    const isMobile = window.innerWidth <= 768;
    let maxIndex;
    
    if (isMobile) {
      maxIndex = this.totalItems - 1;
    } else {
      maxIndex = Math.max(0, this.totalItems - this.options.itemsPerView);
    }
    
    // Asegurar que el índice esté en el rango válido
    index = Math.max(0, Math.min(index, maxIndex));
    
    this.currentIndex = index;
    this.updateCarousel();
    this.updateControls();
    this.resetAutoPlay();
  }

  updateCarousel() {
    if (!this.track) return;
    
    this.isAnimating = true;
    
    if (window.innerWidth <= 768) {
      // En mobile: usar scroll horizontal como "Propiedades Similares"
      const cardWidth = 300; // Ancho fijo del card en mobile
      const gap = 24; // Gap entre cards (1.5rem = 24px)
      const scrollPosition = this.currentIndex * (cardWidth + gap);
      
      this.track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        this.isAnimating = false;
      }, 300);
    } else {
      // DESKTOP: Usar ancho fijo de las tarjetas para cálculo preciso
      const cardWidth = 320; // Actualizado de 350px a 320px para coincidir con CSS
      const gap = 32; // 2rem = 32px
      const cardWidthWithGap = cardWidth + gap;
      
      // Desplazar por la cantidad de elementos indicada por currentIndex
      const translateX = -(this.currentIndex * cardWidthWithGap);
      
      console.log(`🖥️ Desplazando a posición ${this.currentIndex}: translateX(${translateX}px)`);
      
      this.track.style.transform = `translateX(${translateX}px)`;
      
      setTimeout(() => {
        this.isAnimating = false;
      }, 500);
    }
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
    const isMobile = window.innerWidth <= 768;
    let maxIndex;
    
    if (isMobile) {
      maxIndex = this.totalItems - 1;
    } else {
      maxIndex = Math.max(0, this.totalItems - this.options.itemsPerView);
    }
    
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
      if (this.currentIndex >= maxIndex) {
        this.nextArrow.style.opacity = '0.3';
        this.nextArrow.style.cursor = 'not-allowed';
        this.nextArrow.disabled = true;
      } else {
        this.nextArrow.style.opacity = '1';
        this.nextArrow.style.cursor = 'pointer';
        this.nextArrow.disabled = false;
      }
    }
    
    // SOLO en mobile: actualizar basado en el scroll actual
    if (window.innerWidth <= 768 && this.track) {
      const cardWidth = 300;
      const gap = 24;
      const scrollPosition = this.track.scrollLeft;
      const currentIndexFromScroll = Math.round(scrollPosition / (cardWidth + gap));
      
      if (currentIndexFromScroll !== this.currentIndex) {
        this.currentIndex = currentIndexFromScroll;
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
      return `$${precioCLP.toLocaleString('es-CL')}`;
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
    return 1; // En mobile: mostrar solo 1 elemento a la vez (como "Propiedades Similares")
  }

  updateItemsPerView() {
    const newItemsPerView = this.getItemsPerView();
    if (newItemsPerView !== this.options.itemsPerView) {
      this.options.itemsPerView = newItemsPerView;
      this.currentIndex = 0;
      
      // Re-renderizar completamente el carrusel para cambiar la estructura
      // Guardar las propiedades originales para no perderlas
      if (!this.propiedadesOriginales) {
        // Esto es un fallback, idealmente las propiedades se guardan en la inicialización
        console.warn("Propiedades originales no encontradas, re-renderizado puede fallar.");
        return;
      }
      
      this.renderCarousel(this.propiedadesOriginales);
      this.initControls(); // Re-inicializar controles
      this.updateControls(); // Actualizar estado inicial
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