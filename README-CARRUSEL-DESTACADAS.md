# Carrusel de Propiedades Destacadas

## Descripción
Componente modular y reutilizable para mostrar propiedades destacadas en formato de carrusel horizontal. Este componente está completamente separado del sistema de renderizado de propiedades generales.

## Características

### ✅ Funcionalidades
- **Carrusel horizontal** con navegación por flechas
- **Autoplay** configurable (por defecto activado)
- **Indicadores** para navegación directa
- **Responsive** - se adapta a diferentes tamaños de pantalla
- **Navegación por teclado** (flechas izquierda/derecha)
- **Pausa automática** al hacer hover
- **Animaciones suaves** y transiciones elegantes

### 🎨 Diseño
- **3 propiedades por vista** en escritorio
- **2 propiedades por vista** en tablet
- **1 propiedad por vista** en móvil
- **Tarjetas con hover effects** y sombras
- **Flechas de navegación** estilizadas
- **Indicadores** con estado activo

## Uso

### 1. Uso Básico (Página Principal)
```html
<div class="featured-properties-carousel">
  <!-- El carrusel se cargará automáticamente -->
</div>

<script src="/assets/js/featured-carousel.js"></script>
<script>
  cargarPropiedadesDestacadasCarousel('.featured-properties-carousel');
</script>
```

### 2. Uso Avanzado (Configuración Personalizada)
```html
<div class="my-custom-carousel"></div>

<script>
  const carousel = initFeaturedCarousel('.my-custom-carousel', {
    autoPlay: true,
    autoPlayInterval: 8000, // 8 segundos
    showIndicators: true,
    showArrows: true,
    itemsPerView: 2 // Solo 2 propiedades por vista
  });
</script>
```

### 3. Componente Reutilizable
```html
<!-- Incluir el componente completo -->
<script>
  fetch('/components/featured-carousel.html')
    .then(res => res.text())
    .then(html => {
      document.querySelector('#mi-contenedor').innerHTML = html;
    });
</script>
```

## Opciones de Configuración

| Opción | Tipo | Por Defecto | Descripción |
|--------|------|-------------|-------------|
| `autoPlay` | boolean | `true` | Activa/desactiva el autoplay |
| `autoPlayInterval` | number | `5000` | Intervalo en milisegundos para el autoplay |
| `showIndicators` | boolean | `true` | Muestra/oculta los indicadores |
| `showArrows` | boolean | `true` | Muestra/oculta las flechas de navegación |
| `itemsPerView` | number | `3` | Número de propiedades visibles por vista |

## Estructura de Archivos

```
assets/
├── css/
│   └── style.css                    # Estilos del carrusel (nuevo)
├── js/
│   ├── featured-carousel.js         # Lógica del carrusel (nuevo)
│   ├── api.js                       # API de Strapi (existente)
│   └── main.js                      # Lógica principal (modificado)
components/
└── featured-carousel.html           # Componente reutilizable (nuevo)
```

## Responsive Design

### Desktop (>1024px)
- 3 propiedades por vista
- Flechas grandes (48px)
- Espaciado generoso

### Tablet (768px - 1024px)
- 2 propiedades por vista
- Flechas medianas (40px)
- Espaciado moderado

### Mobile (<768px)
- 1 propiedad por vista
- Flechas pequeñas (36px)
- Espaciado compacto
- Características en columna

## API del Componente

### Métodos Públicos
```javascript
const carousel = initFeaturedCarousel('.selector');

// Navegación
carousel.next();           // Siguiente slide
carousel.prev();           // Slide anterior
carousel.goToSlide(2);     // Ir al slide específico

// Control de autoplay
carousel.startAutoPlay();  // Iniciar autoplay
carousel.pauseAutoPlay();  // Pausar autoplay
carousel.resumeAutoPlay(); // Reanudar autoplay

// Limpieza
carousel.destroy();        // Destruir el carrusel
```

## Estados del Componente

### Estados de Carga
- **Loading**: "Cargando propiedades destacadas..."
- **Empty**: "No hay propiedades destacadas disponibles"
- **Error**: "Error al cargar las propiedades destacadas"

### Estados de Navegación
- **Flechas deshabilitadas** cuando no hay más slides
- **Indicadores activos** para el slide actual
- **Animación en progreso** durante las transiciones

## Compatibilidad

### Navegadores
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Dispositivos
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile
- ✅ Touch devices

## Personalización

### CSS Variables Disponibles
```css
:root {
  --color-primary: #1a1a1a;           /* Color principal */
  --color-primary-dark: #000;         /* Color principal oscuro */
  --color-text-primary: #333;         /* Texto principal */
  --color-text-secondary: #666;       /* Texto secundario */
  --font-secondary: 'Playfair Display', serif; /* Fuente secundaria */
}
```

### Personalización de Estilos
```css
/* Personalizar tarjetas */
.featured-property-card {
  border-radius: 16px; /* Bordes más redondeados */
  box-shadow: 0 12px 40px rgba(0,0,0,0.15); /* Sombra más pronunciada */
}

/* Personalizar flechas */
.carousel-arrow {
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0); /* Gradiente */
  border: 2px solid var(--color-primary); /* Borde */
}
```

## Troubleshooting

### Problemas Comunes

1. **El carrusel no se carga**
   - Verificar que `config.js` y `api.js` estén cargados antes
   - Verificar la conexión con Strapi
   - Revisar la consola del navegador

2. **Las flechas no funcionan**
   - Verificar que el contenedor tenga la clase correcta
   - Verificar que no haya conflictos de CSS

3. **El autoplay no funciona**
   - Verificar que `autoPlay: true` esté configurado
   - Verificar que no haya errores en la consola

### Debug
```javascript
// Habilitar logs de debug
const carousel = initFeaturedCarousel('.selector', {
  debug: true // Mostrar logs en consola
});
```

## Changelog

### v1.0.0 (Actual)
- ✅ Carrusel horizontal funcional
- ✅ Autoplay configurable
- ✅ Navegación por flechas e indicadores
- ✅ Responsive design
- ✅ Componente modular y reutilizable
- ✅ Compatibilidad con Strapi API
- ✅ Estados de carga y error
- ✅ Navegación por teclado
- ✅ Pausa automática en hover

## Próximas Mejoras

- [ ] Soporte para swipe en dispositivos táctiles
- [ ] Lazy loading de imágenes
- [ ] Animaciones más avanzadas
- [ ] Soporte para videos
- [ ] Integración con analytics
- [ ] Modo oscuro 