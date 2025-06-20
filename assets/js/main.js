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

// Exportar utilidades globales
window.PropInvestUtils = {
  animarContador
}; 