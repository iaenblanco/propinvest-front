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
    
  // Cargar propiedades dinámicamente según la página (sin timeout)
  cargarPropiedadesSegunPagina();
});

// =============================
// Carga dinámica de propiedades según la página
// =============================

function cargarPropiedadesSegunPagina() {
  const currentPath = window.location.pathname;
  
  // Verificar si estamos en la página principal
  if (currentPath === '/' || currentPath === '/index.html') {
    // Cargar ambas propiedades destacadas en paralelo
    cargarPropiedadesDestacadasParalelo();
  }
  
  // Verificar si estamos en la página de propiedades general
  else if (currentPath === '/propiedades.html' || currentPath === '/propiedades') {
    if (typeof cargarTodasPropiedades === 'function') {
      console.log('Llamando a cargarTodasPropiedades()');
      cargarTodasPropiedades();
    } else {
      console.error('No existe la función cargarTodasPropiedades');
    }
  }
  
  // Verificar si estamos en una página de categoría específica
  else if (currentPath.includes('/propiedades/')) {
    if (typeof cargarPropiedadesPorCategoria === 'function') {
      console.log('Llamando a cargarPropiedadesPorCategoria()');
      cargarPropiedadesPorCategoria(currentPath);
    } else {
      console.error('No existe la función cargarPropiedadesPorCategoria');
    }
  }
  
  // Verificar si estamos en una página de detalle de propiedad
  else if (currentPath.includes('/propiedades/') && currentPath.endsWith('.html')) {
    // La página de detalle se maneja en propiedad-dinamica.html
    // No necesitamos hacer nada aquí
  }
}

/**
 * Carga las propiedades destacadas de venta y arriendo en paralelo
 * para optimizar el rendimiento
 */
async function cargarPropiedadesDestacadasParalelo() {
  try {
    console.log('🚀 Iniciando carga paralela de propiedades destacadas...');
    
    const api = new StrapiAPI();
    
    // Cargar todas las propiedades destacadas en una sola llamada
    const todasPropiedades = await api.getTodasPropiedadesDestacadas();
    
    // Renderizar propiedades de venta
    if (typeof cargarPropiedadesDestacadasCarousel === 'function') {
      console.log('Llamando a cargarPropiedadesDestacadasCarousel()');
      cargarPropiedadesDestacadasCarousel('.featured-properties-carousel', todasPropiedades.venta);
    } else {
      console.error('No existe la función cargarPropiedadesDestacadasCarousel');
    }
    
    // Renderizar propiedades de arriendo
    if (typeof cargarPropiedadesDestacadasArriendoCarousel === 'function') {
      console.log('Llamando a cargarPropiedadesDestacadasArriendoCarousel()');
      cargarPropiedadesDestacadasArriendoCarousel('.featured-rental-properties-carousel', todasPropiedades.arriendo);
    } else {
      console.error('No existe la función cargarPropiedadesDestacadasArriendoCarousel');
    }
    
    console.log('✅ Propiedades destacadas cargadas exitosamente');
  } catch (error) {
    console.error('Error al cargar propiedades destacadas en paralelo:', error);
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

// =============================
// UF en tiempo real y barra superior
// =============================

function mostrarUF() {
  fetch('https://mindicador.cl/api/uf')
    .then(res => res.json())
    .then(data => {
      const uf = data.serie[0].valor;
      const ufBarra = document.getElementById('uf-barra');
      if (ufBarra) {
        ufBarra.innerText = `UF $${uf.toLocaleString('es-CL', {minimumFractionDigits:2})}`;
      }
      window.valorUF = uf;
    })
    .catch(() => {
      const ufBarra = document.getElementById('uf-barra');
      if (ufBarra) {
        ufBarra.innerText = 'No se pudo cargar el valor de la UF';
      }
    });
}

// Ocultar barra UF al hacer scroll
function ocultarBarraUFAlScroll() {
  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const topBar = document.getElementById('top-bar-uf');
    if (!topBar) return;
    if (window.scrollY > 10) {
      topBar.style.top = '-50px';
    } else {
      topBar.style.top = '0';
    }
  });
}

// Ejecutar después de cargar el header
function inicializarBarraUF() {
  mostrarUF();
  ocultarBarraUFAlScroll();
}

// Esperar a que el header esté en el DOM
const observer = new MutationObserver(() => {
  if (document.getElementById('top-bar-uf')) {
    inicializarBarraUF();
    observer.disconnect();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// Exportar utilidades globales
window.PropInvestUtils = {
  animarContador,
  mostrarError,
  mostrarExito,
  actualizarMetadatos,
  cargarPropiedadesSegunPagina
}; 