# Sistema Modular de CTAs - PropInvest

## Descripción

Se ha implementado un sistema modular de CTAs (Call-to-Action) que mantiene la línea formal y elegante de la página web. Todos los CTAs ahora usan el diseño "elegant" con fondo claro y borde negro, siguiendo el estilo que más te gustó.

## Componentes Disponibles

### 1. CTAButton.astro

Botón CTA individual con múltiples variantes y tamaños.

#### Props:
- `text`: Texto del botón
- `href`: Enlace de destino
- `variant`: Tipo de estilo ('primary', 'secondary', 'outline', 'gradient')
- `size`: Tamaño ('small', 'medium', 'large')
- `icon`: Icono opcional (emoji o texto)
- `iconSvg`: Icono SVG opcional (recomendado)
- `className`: Clases CSS adicionales

#### Ejemplo de uso:
```astro
---
import CTAButton from '../components/CTAButton.astro';
---

<CTAButton
  text="Llamar Ahora"
  href="tel:+56974954413"
  variant="primary"
  size="large"
  iconSvg='<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
/>
```

### 2. CTABanner.astro

Banner completo con título, subtítulo y botón CTA.

#### Props:
- `title`: Título principal del banner
- `subtitle`: Subtítulo opcional
- `ctaText`: Texto del botón CTA
- `ctaHref`: Enlace del botón
- `variant`: Variante del banner ('primary', 'secondary', 'gradient', 'elegant')
- `ctaVariant`: Variante del botón CTA
- `ctaSize`: Tamaño del botón CTA
- `iconSvg`: Icono SVG del botón (recomendado)
- `className`: Clases CSS adicionales

#### Ejemplo de uso:
```astro
---
import CTABanner from '../components/CTABanner.astro';
---

<CTABanner
  title="¿Listo para Invertir?"
  subtitle="Agenda una consulta personalizada y descubre las mejores oportunidades del mercado"
  ctaText="Agendar Consulta"
  ctaHref="/contacto"
  variant="elegant"
  ctaVariant="primary"
  ctaSize="large"
  iconSvg='<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
/>
```

## Variantes Disponibles

### CTAButton Variants:
- **primary**: Negro elegante con gradiente (recomendado)
- **secondary**: Marrón dorado con gradiente
- **outline**: Blanco con borde negro
- **gradient**: Negro con gradiente a marrón

### CTABanner Variants:
- **elegant**: Fondo claro con borde negro (recomendado)
- **primary**: Fondo negro elegante
- **secondary**: Fondo marrón dorado
- **gradient**: Gradiente negro a marrón

## Tamaños Disponibles

- **small**: 0.75rem padding, 0.9rem font-size
- **medium**: 1rem padding, 1rem font-size
- **large**: 1.25rem padding, 1.1rem font-size

## Características del Sistema

### Efectos Visuales:
- Animación de hover con elevación
- Efecto de brillo al pasar el mouse
- Transiciones suaves con cubic-bezier
- Backdrop blur para efecto glassmorphism
- Iconos SVG consistentes con el resto de la página

### Responsive:
- Adaptación automática en móviles
- Botones full-width en pantallas pequeñas
- Tamaños optimizados para cada breakpoint

### Accesibilidad:
- Contraste adecuado en todas las variantes
- Estados de hover y focus bien definidos
- Iconos semánticos para mejor UX

## CTAs Actualizados

### ✅ Completados:
1. **Página Asesorías**: CTA "Agendar Consulta" con variante elegant
2. **Página Ofrece tu Propiedad**: CTA "Llamar Ahora" con variante elegant
3. **Página Contacto**: CTA "Llamar Ahora" con variante elegant
4. **Páginas de Propiedades**: CTA "¿Te interesa esta propiedad?" con variante elegant (optimizado para venta)

### 🔒 No Modificados (según especificación):
- Botón "Ver Propiedades" de la imagen principal
- Rectángulo "Ver Propiedad" en los carruseles

## Implementación

Los componentes están ubicados en:
- `src/components/CTAButton.astro`
- `src/components/CTABanner.astro`

Los estilos están integrados en:
- `public/assets/css/style.css` (estilos adicionales)

## Mantenimiento

Para agregar nuevas variantes o modificar estilos:
1. Editar el componente correspondiente
2. Actualizar los estilos en el archivo CSS
3. Probar en diferentes dispositivos
4. Verificar accesibilidad y contraste 