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
    });

  // Cargar Footer
  fetch('/components/footer.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    });
    
  // Cargar propiedades dinámicamente según la página
  cargarPropiedadesSegunPagina();

  // Marcar enlace activo en el menú principal (desktop)
  setTimeout(() => {
    const path = window.location.pathname.replace(/\/index\.html$/, '/');
    const navLinks = document.querySelectorAll('.nav-list.nav-center li a');
    navLinks.forEach(link => {
      let href = link.getAttribute('href');
      // Normaliza href para que /index.html y / sean equivalentes
      if (href.endsWith('/index.html')) href = href.replace('/index.html', '/');
      // Compara solo el final del path, para funcionar en subcarpetas y deploys
      if (path.endsWith(href.replace('.', '')) || (href === '/' && (path === '/' || path === ''))) {
        link.classList.add('active');
      }
    });
  }, 100); // Espera a que el header esté en el DOM
});

// =============================
// Carga dinámica de propiedades según la página
// =============================

function cargarPropiedadesSegunPagina() {
  const currentPath = window.location.pathname;
  
  // Verificar si estamos en la página principal
  if (currentPath === '/' || currentPath === '/index.html') {
    setTimeout(() => {
      if (typeof cargarPropiedadesDestacadas === 'function') {
        console.log('Llamando a cargarPropiedadesDestacadas()');
        cargarPropiedadesDestacadas();
      }
    }, 1000);
  }
  
  // Verificar si estamos en la página de propiedades
  else if (currentPath === '/propiedades.html' || currentPath === '/propiedades') {
    setTimeout(() => {
      if (typeof cargarTodasPropiedades === 'function') {
        console.log('Llamando a cargarTodasPropiedades()');
        cargarTodasPropiedades();
      } else {
        console.error('No existe la función cargarTodasPropiedades');
      }
    }, 1000);
  }
  
  // Verificar si estamos en una página de detalle de propiedad
  else if (currentPath.includes('/propiedades/') && currentPath.endsWith('.html')) {
    // La página de detalle se maneja en propiedad-dinamica.html
    // No necesitamos hacer nada aquí
  }
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