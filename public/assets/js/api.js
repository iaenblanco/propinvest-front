// =============================
// API Service - Solo funciones necesarias para el sitio estático
// =============================

/**
 * Obtiene la tasa actual de la UF desde la API de Mindicador.cl
 * NOTA: Esta es la ÚNICA llamada a API externa que debe permanecer activa
 * ya que la UF debe actualizarse en tiempo real.
 * @returns {Promise<number>} Valor actual de la UF
 */
async function obtenerTasaUF() {
  try {
    console.log('🪙 Obteniendo tasa UF actualizada...');
    const response = await fetch('https://mindicador.cl/api/uf');
    
    if (!response.ok) {
      throw new Error(`Error en la API de UF: ${response.status}`);
    }
    
    const data = await response.json();
    const tasaUF = data.serie && data.serie[0] ? data.serie[0].valor : 37000;
    
    console.log('✅ Tasa UF obtenida:', tasaUF);
    return tasaUF;
  } catch (error) {
    console.error('Error al obtener tasa UF:', error);
    // Valor por defecto en caso de error
    return 37000;
  }
}

/**
 * Formatea el precio en CLP con separadores de miles
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
  return formatted.replace(/^\$/, 'CLP $');
}

/**
 * Actualiza los precios en CLP usando la tasa UF actual
 * Esto se usa en las páginas donde se muestran precios dinámicos
 * @param {number} precioUF - Precio en UF
 * @returns {Promise<string>} Precio formateado en CLP
 */
async function actualizarPrecioCLP(precioUF) {
  if (!precioUF) return '';
  
  try {
    const tasaUF = await obtenerTasaUF();
    const precioCLP = precioUF * tasaUF;
    return formatearPrecioCLP(precioCLP);
  } catch (error) {
    console.error('Error al actualizar precio CLP:', error);
    return 'Precio no disponible';
  }
}

// =============================
// Funciones de utilidad para el detalle de propiedades
// =============================

/**
 * Renderiza el detalle de una propiedad (usado en páginas de detalle)
 * @param {Object} propiedad - Datos de la propiedad (ya pre-cargados)
 */
async function renderizarDetallePropiedad(propiedad) {
  if (!propiedad) {
    console.error('No se proporcionó propiedad para renderizar');
    return;
  }

  try {
    // Actualizar precio en CLP usando la tasa UF actual
    const precioCLPElement = document.querySelector('.price-clp, .price-clp-mobile');
    if (precioCLPElement && propiedad.Precio) {
      const precioCLP = await actualizarPrecioCLP(propiedad.Precio);
      precioCLPElement.textContent = precioCLP;
    }

    // Inicializar galería si existe
    const imagenes = getTodasImagenes(propiedad);
    if (imagenes.length > 0) {
      inicializarGaleria(imagenes);
    }

    // Configurar WhatsApp
    configurarWhatsApp(propiedad.Titulo);

    console.log('✅ Detalle de propiedad renderizado correctamente');
  } catch (error) {
    console.error('Error al renderizar detalle de propiedad:', error);
  }
}

/**
 * Ajusta la ficha técnica y características en móvil
 */
function ajustarFichaTecnicaYCaracteristicas() {
  const fichaElement = document.querySelector('.info-box-mobile');
  const caracteristicasElement = document.querySelector('.caracteristicas-mobile');
  
  if (window.innerWidth <= 768) {
    if (fichaElement) fichaElement.style.display = 'flex';
    if (caracteristicasElement) caracteristicasElement.style.display = 'flex';
  } else {
    if (fichaElement) fichaElement.style.display = 'none';
    if (caracteristicasElement) caracteristicasElement.style.display = 'none';
  }
}

/**
 * Inicializa la galería de imágenes
 * @param {Array} imagenes - Array de URLs de imágenes
 */
function inicializarGaleria(imagenes) {
  if (!imagenes || imagenes.length === 0) return;

  let currentIndex = 0;
  const mainImage = document.getElementById('main-image');
  const thumbnails = document.querySelectorAll('.thumbnail');
  const prevArrow = document.querySelector('.carousel-arrow.prev');
  const nextArrow = document.querySelector('.carousel-arrow.next');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');

  function showImage(idx) {
    if (idx < 0 || idx >= imagenes.length) return;
    
    currentIndex = idx;
    if (mainImage) mainImage.src = imagenes[idx];
    
    thumbnails.forEach((thumb, index) => {
      if (index === idx) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  // Event listeners para miniaturas
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => showImage(index));
  });

  // Event listeners para flechas
  if (prevArrow) {
    prevArrow.addEventListener('click', () => {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : imagenes.length - 1;
      showImage(newIndex);
    });
  }

  if (nextArrow) {
    nextArrow.addEventListener('click', () => {
      const newIndex = currentIndex < imagenes.length - 1 ? currentIndex + 1 : 0;
      showImage(newIndex);
    });
  }

  // Lightbox
  if (mainImage && lightboxModal && lightboxImg) {
    mainImage.addEventListener('click', () => {
      lightboxImg.src = imagenes[currentIndex];
      lightboxModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
}

/**
 * Configura el enlace de WhatsApp para una propiedad
 * @param {string} nombrePropiedad - Nombre de la propiedad
 */
function configurarWhatsApp(nombrePropiedad) {
  const whatsappButtons = document.querySelectorAll('a[href*="wa.me"]');
  const mensaje = `Hola, me interesa la propiedad ${nombrePropiedad} que vi en su sitio web.`;
  
  whatsappButtons.forEach(button => {
    button.href = `https://wa.me/56912345678?text=${encodeURIComponent(mensaje)}`;
  });
}

/**
 * Obtiene la primera imagen de una propiedad
 * @param {Object} propiedad - Objeto de propiedad
 * @returns {string} URL de la imagen
 */
function getPrimeraImagen(propiedad) {
  if (!propiedad.Imagenes || !Array.isArray(propiedad.Imagenes) || propiedad.Imagenes.length === 0) {
    return '/assets/images/propiedad-default.jpg';
  }
  
  const primeraImagen = propiedad.Imagenes[0];
  if (!primeraImagen?.url) {
    return '/assets/images/propiedad-default.jpg';
  }
  
  return primeraImagen.url.startsWith('http') 
    ? primeraImagen.url 
    : `https://truthful-rhythm-e8bcafa766.strapiapp.com${primeraImagen.url}`;
}

/**
 * Obtiene todas las imágenes de una propiedad
 * @param {Object} propiedad - Objeto de propiedad
 * @returns {Array} Array de URLs de imágenes
 */
function getTodasImagenes(propiedad) {
  if (!propiedad.Imagenes || !Array.isArray(propiedad.Imagenes)) {
    return ['/assets/images/propiedad-default.jpg'];
  }
  
  return propiedad.Imagenes.map(imagen => {
    if (!imagen?.url) return '/assets/images/propiedad-default.jpg';
    
    return imagen.url.startsWith('http') 
      ? imagen.url 
      : `https://truthful-rhythm-e8bcafa766.strapiapp.com${imagen.url}`;
  });
}

// =============================
// Exportar funciones globales
// =============================
window.obtenerTasaUF = obtenerTasaUF;
window.formatearPrecioCLP = formatearPrecioCLP;
window.actualizarPrecioCLP = actualizarPrecioCLP;
window.renderizarDetallePropiedad = renderizarDetallePropiedad;
window.ajustarFichaTecnicaYCaracteristicas = ajustarFichaTecnicaYCaracteristicas;
window.inicializarGaleria = inicializarGaleria;
window.configurarWhatsApp = configurarWhatsApp;
window.getPrimeraImagen = getPrimeraImagen;
window.getTodasImagenes = getTodasImagenes;

console.log('✅ API estática cargada correctamente - Solo UF en tiempo real')