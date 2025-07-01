// =============================
// Utilidades de Optimización de Rendimiento
// =============================

class PerformanceOptimizer {
  constructor() {
    this.loadingStates = new Map();
    this.performanceMetrics = {
      startTime: Date.now(),
      apiCalls: 0,
      cacheHits: 0,
      imagePreloads: 0
    };
  }

  /**
   * Muestra un indicador de carga optimizado
   * @param {string} containerSelector - Selector del contenedor
   * @param {string} message - Mensaje de carga
   */
  showOptimizedLoading(containerSelector, message = 'Cargando...') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const loadingId = `loading-${Date.now()}`;
    this.loadingStates.set(containerSelector, loadingId);

    container.innerHTML = `
      <div class="optimized-loading" id="${loadingId}">
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      </div>
    `;
  }

  /**
   * Oculta el indicador de carga
   * @param {string} containerSelector - Selector del contenedor
   */
  hideLoading(containerSelector) {
    const container = document.querySelector(containerSelector);
    const loadingId = this.loadingStates.get(containerSelector);
    
    if (container && loadingId) {
      const loadingElement = container.querySelector(`#${loadingId}`);
      if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
          if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
          }
        }, 300);
      }
    }
    
    this.loadingStates.delete(containerSelector);
  }

  /**
   * Registra métricas de rendimiento
   * @param {string} metric - Nombre de la métrica
   * @param {number} value - Valor de la métrica
   */
  recordMetric(metric, value = 1) {
    if (this.performanceMetrics[metric] !== undefined) {
      this.performanceMetrics[metric] += value;
    }
  }

  /**
   * Muestra un resumen de rendimiento en la consola
   */
  logPerformanceSummary() {
    const totalTime = Date.now() - this.performanceMetrics.startTime;
    
    console.log('📊 Resumen de Rendimiento:');
    console.log(`⏱️ Tiempo total: ${totalTime}ms`);
    console.log(`🌐 Llamadas a API: ${this.performanceMetrics.apiCalls}`);
    console.log(`📦 Hits de caché: ${this.performanceMetrics.cacheHits}`);
    console.log(`🖼️ Imágenes precargadas: ${this.performanceMetrics.imagePreloads}`);
    
    if (this.performanceMetrics.cacheHits > 0) {
      const cacheHitRate = (this.performanceMetrics.cacheHits / (this.performanceMetrics.apiCalls + this.performanceMetrics.cacheHits)) * 100;
      console.log(`📈 Tasa de acierto en caché: ${cacheHitRate.toFixed(1)}%`);
    }
  }

  /**
   * Optimiza las imágenes para carga lazy
   * @param {string} containerSelector - Selector del contenedor
   */
  enableLazyLoading(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const images = container.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Optimiza el scroll para mejor rendimiento
   */
  optimizeScroll() {
    let ticking = false;
    
    function updateScroll() {
      // Aquí puedes agregar lógica de optimización de scroll
      ticking = false;
    }
    
    function requestTick() {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }

  /**
   * Inicializa todas las optimizaciones
   */
  init() {
    this.optimizeScroll();
    
    // Mostrar resumen de rendimiento al finalizar la carga
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.logPerformanceSummary();
      }, 1000);
    });
  }
}

// =============================
// Funciones de utilidad para optimización
// =============================

/**
 * Debounce function para optimizar llamadas frecuentes
 * @param {Function} func - Función a debounce
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function para limitar la frecuencia de ejecución
 * @param {Function} func - Función a throttle
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function} Función throttled
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Preload critical resources
 */
function preloadCriticalResources() {
  const criticalResources = [
    '/assets/css/style.css',
    '/assets/js/config.js',
    '/assets/js/api.js'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
}

// =============================
// Inicialización automática
// =============================

// Crear instancia global del optimizador
window.PerformanceOptimizer = new PerformanceOptimizer();

// Inicializar optimizaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.PerformanceOptimizer.init();
  preloadCriticalResources();
});

// Exportar funciones para uso global
window.PerformanceUtils = {
  debounce,
  throttle,
  preloadCriticalResources
}; 