// =============================
// Carga dinámica de componentes (header y footer)
// =============================

// Función para cargar un componente HTML y colocarlo en el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Cargar Header
  fetch('/components/header.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      inicializarMenuMovil();
      inicializarMenuDesplegable();
    });

  // Cargar Footer
  fetch('/components/footer.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    });
    
  // Cargar propiedades dinámicamente según la página
  cargarPropiedadesSegunPagina();
});

// =============================
// Carga dinámica de propiedades según la página (VERSIÓN CORREGIDA)
// =============================

function cargarPropiedadesSegunPagina() {
  const currentPath = window.location.pathname;

  // Página principal (Home)
  if (currentPath === '/' || currentPath === '/index.html') {
    setTimeout(() => {
      if (typeof cargarPropiedadesDestacadasCarousel === 'function') {
        cargarPropiedadesDestacadasCarousel('.featured-properties-carousel');
      }
    }, 1000);
  }
  
  // Página de "Todas las propiedades"
  else if (currentPath === '/propiedades.html') {
    setTimeout(() => {
      if (typeof cargarTodasPropiedades === 'function') {
        cargarTodasPropiedades();
      }
    }, 1000);
  }
  
  // Páginas de CATEGORÍAS específicas (en-venta, en-arriendo, etc.)
  else if (currentPath.startsWith('/propiedades/')) {
    setTimeout(() => {
      // Nos aseguramos de que la función exista antes de llamarla
      if (typeof cargarPropiedadesPorCategoria === 'function') {
        console.log('Llamando a cargarPropiedadesPorCategoria() para una categoría específica.');
        cargarPropiedadesPorCategoria(currentPath);
      } else {
        console.error('La función cargarPropiedadesPorCategoria no está definida.');
      }
    }, 1000);
  }
  
  // La página de detalle (propiedad-dinamica.html) tiene su propia lógica interna
  // y no necesita ser manejada aquí.
}

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
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorDiv.textContent = mensaje;
    
    document.body.appendChild(errorDiv);
    
    // Remover después de 5 segundos
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
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  successDiv.textContent = mensaje;
  
  document.body.appendChild(successDiv);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// =============================
// Funciones de utilidad para SEO y metadatos
// =============================

/**
 * Actualiza los metadatos de la página dinámicamente
 * @param {Object} metadata - Objeto con título, descripción, etc.
 */
function actualizarMetadatos(metadata) {
  if (metadata.title) {
    document.title = metadata.title;
  }
  
  if (metadata.description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = metadata.description;
    }
  }
  
  if (metadata.image) {
    const metaImage = document.querySelector('meta[property="og:image"]');
    if (metaImage) {
      metaImage.content = metadata.image;
    }
  }
}

// Exportar utilidades globales
window.PropInvestUtils = {
  animarContador,
  mostrarError,
  mostrarExito,
  actualizarMetadatos,
  cargarPropiedadesSegunPagina
}; 