// =============================
// Inicialización principal - Solo funciones de UI
// =============================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar funciones de UI básicas
  inicializarMenuMovil();
  inicializarMenuDesplegable();
  
  // Inicializar barra UF si existe
  if (typeof inicializarBarraUF === 'function') {
    inicializarBarraUF();
  }
  
  console.log('✅ PropInvest - UI inicializada correctamente');
});

// =============================
// Menú móvil (hamburguesa)
// =============================
function inicializarMenuMovil() {
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav-overlay');
  const mobileNavContent = document.querySelector('.mobile-nav-content');

  if (!navToggle || !mobileNav || !mobileNavContent) return;

  navToggle.addEventListener('click', () => {
    if (mobileNav.classList.contains('active')) {
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });

  // Cerrar menú al hacer click fuera del menú (en el overlay, pero no en el contenido)
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// =============================
// Menú desplegable móvil
// =============================
function inicializarMenuDesplegable() {
  // Menú desplegable móvil
  const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');
  
  mobileDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.mobile-dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('active');
      });
    }
  });
}

// =============================
// Utilidades globales (pueden ser usadas por otras páginas)
// =============================

// Función para animar contadores (Sobre Nosotros)
function animarContador(element, valorFinal, duracion = 1500) {
  let start = 0;
  const incremento = valorFinal / (duracion / 16);
  function actualizar() {
    start += incremento;
    if (start < valorFinal) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(actualizar);
    } else {
      element.textContent = valorFinal + '+';
    }
  }
  actualizar();
}

// =============================
// Funciones de utilidad para el manejo de errores
// =============================

/**
 * Muestra un mensaje de error en la consola y opcionalmente en la UI
 * @param {string} mensaje - Mensaje de error
 * @param {boolean} mostrarEnUI - Si mostrar el error en la interfaz
 */
function mostrarError(mensaje, mostrarEnUI = false) {
  console.error('PropInvest Error:', mensaje);
  
  if (mostrarEnUI) {
    // Crear un elemento de notificación de error
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 1000;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = mensaje;
    
    document.body.appendChild(errorDiv);
    
    // Remover automáticamente después de 5 segundos
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

/**
 * Muestra un mensaje de éxito en la UI
 * @param {string} mensaje - Mensaje de éxito
 */
function mostrarExito(mensaje) {
  console.log('PropInvest Éxito:', mensaje);
  
  // Crear un elemento de notificación de éxito
  const exitoDiv = document.createElement('div');
  exitoDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  exitoDiv.textContent = mensaje;
  
  document.body.appendChild(exitoDiv);
  
  // Remover automáticamente después de 3 segundos
  setTimeout(() => {
    if (exitoDiv.parentNode) {
      exitoDiv.parentNode.removeChild(exitoDiv);
    }
  }, 3000);
}

// =============================
// Funciones de SEO y metadatos
// =============================

/**
 * Actualiza los metadatos de la página dinámicamente
 * @param {Object} metadata - Objeto con title, description, keywords, etc.
 */
function actualizarMetadatos(metadata) {
  if (metadata.title) {
    document.title = metadata.title;
  }
  
  if (metadata.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metadata.description);
    }
  }
  
  if (metadata.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', metadata.keywords);
    }
  }
}

// =============================
// Funciones para la barra de UF (solo si está disponible)
// =============================

/**
 * Muestra la barra UF con el valor actual
 */
function mostrarUF() {
  const barraUF = document.querySelector('.uf-bar');
  if (barraUF && typeof obtenerTasaUF === 'function') {
    barraUF.style.display = 'flex';
    
    // Actualizar valor UF
    obtenerTasaUF()
      .then(valor => {
        const valorElement = barraUF.querySelector('.uf-value');
        if (valorElement) {
          valorElement.textContent = `UF: $${valor.toLocaleString('es-CL')}`;
        }
      })
      .catch(error => {
        console.error('Error al mostrar UF:', error);
      });
  }
}

/**
 * Oculta la barra UF al hacer scroll
 */
function ocultarBarraUFAlScroll() {
  const barraUF = document.querySelector('.uf-bar');
  if (!barraUF) return;
  
  let lastScrollTop = 0;
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling hacia abajo y más de 100px
      barraUF.style.transform = 'translateY(-100%)';
    } else if (scrollTop < lastScrollTop) {
      // Scrolling hacia arriba
      barraUF.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
  });
}

/**
 * Inicializa la barra UF si existe en la página
 */
function inicializarBarraUF() {
  const barraUF = document.querySelector('.uf-bar');
  if (barraUF) {
    mostrarUF();
    ocultarBarraUFAlScroll();
  }
}

// =============================
// Exportar funciones globales
// =============================
window.inicializarMenuMovil = inicializarMenuMovil;
window.inicializarMenuDesplegable = inicializarMenuDesplegable;
window.animarContador = animarContador;
window.mostrarError = mostrarError;
window.mostrarExito = mostrarExito;
window.actualizarMetadatos = actualizarMetadatos;
window.mostrarUF = mostrarUF;
window.inicializarBarraUF = inicializarBarraUF;

console.log('✅ PropInvest Main - Solo funciones de UI, sin llamadas a Strapi'); 