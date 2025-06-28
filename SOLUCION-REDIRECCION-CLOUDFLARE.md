# Solución para Problema de Redirección en Cloudflare Pages

## Problema Identificado

El sitio web estaba experimentando redirecciones incorrectas en Cloudflare Pages donde las páginas de categorías (`/propiedades/en-venta.html`, `/propiedades/en-arriendo.html`, `/propiedades/oportunidades.html`) eran interceptadas y servidas por `propiedad-dinamica.html` en lugar de mostrar su contenido original.

## Causa Raíz

El problema se debía a que **Cloudflare Pages estaba configurado en modo "Single Page App (SPA)"** o tenía reglas de reescritura que interceptaban todas las rutas `/propiedades/*` y las redirigían a `propiedad-dinamica.html`.

## Solución Implementada

### 1. Archivo `_redirects` Actualizado

Se ha creado un archivo `_redirects` más específico que:

- **Prioriza las páginas estáticas** sobre las dinámicas
- **Define rutas específicas** para cada categoría antes de las reglas generales
- **Preserva la estructura de URLs** actual (`/propiedades/en-venta.html`, etc.)

```bash
# Páginas de categorías específicas - DEBE ir ANTES de las reglas dinámicas
/propiedades/en-venta.html /propiedades/en-venta.html 200
/propiedades/en-arriendo.html /propiedades/en-arriendo.html 200
/propiedades/oportunidades.html /propiedades/oportunidades.html 200

# Redirecciones sin .html para las categorías
/propiedades/en-venta /propiedades/en-venta.html 200
/propiedades/en-arriendo /propiedades/en-arriendo.html 200
/propiedades/oportunidades /propiedades/oportunidades.html 200

# Regla para propiedades dinámicas individuales (solo con parámetro slug)
/propiedades/* /propiedad-dinamica.html 200
```

### 2. Archivo `wrangler.toml` (Configuración de Cloudflare)

Se ha creado un archivo `wrangler.toml` que:

- **Evita el modo SPA** automático
- **Define reglas específicas** para cada tipo de ruta
- **Configura condiciones** para las propiedades dinámicas

### 3. Archivo `_headers` (Headers de Seguridad)

Se ha creado un archivo `_headers` que:

- **Configura headers de seguridad** para cada tipo de página
- **Optimiza el cache** para assets estáticos
- **Mejora el rendimiento** general

## Pasos para Aplicar la Solución

### Paso 1: Verificar Configuración en Cloudflare Pages Dashboard

1. Ve al dashboard de Cloudflare Pages
2. Selecciona tu proyecto
3. Ve a **Settings** > **Builds & deployments**
4. **IMPORTANTE**: Asegúrate de que **"Framework preset"** esté configurado como **"None"** o **"Static HTML"**
5. **NO** debe estar configurado como "React", "Vue", "Angular" o cualquier framework SPA

### Paso 2: Configurar Variables de Entorno (Opcional)

Si tienes variables de entorno, configúralas en:
- **Settings** > **Environment variables**

### Paso 3: Desplegar los Cambios

1. Haz commit de los nuevos archivos al repositorio:
   ```bash
   git add _redirects wrangler.toml _headers
   git commit -m "Fix: Resolver problema de redirección en Cloudflare Pages"
   git push origin main
   ```

2. Cloudflare Pages se desplegará automáticamente

### Paso 4: Verificar el Despliegue

1. Espera a que el despliegue termine
2. Verifica que las páginas funcionen correctamente:
   - `/propiedades/en-venta.html` → Debe mostrar la página de propiedades en venta
   - `/propiedades/en-arriendo.html` → Debe mostrar la página de propiedades en arriendo
   - `/propiedades/oportunidades.html` → Debe mostrar la página de oportunidades
   - `/propiedad-dinamica.html?slug=ejemplo` → Debe mostrar una propiedad específica

## Configuración Adicional en Cloudflare Dashboard

### Transform Rules (Si es necesario)

Si el problema persiste, puedes crear reglas de transformación en Cloudflare:

1. Ve a **Rules** > **Transform Rules**
2. Crea una regla con la siguiente configuración:

**Rule Name**: `Preserve Static Property Pages`
**Field**: `URI Path`
**Operator**: `equals`
**Value**: `/propiedades/en-venta.html`
**Action**: `Override`
**Override**: `URI Path`
**Value**: `/propiedades/en-venta.html`

Repite para `/propiedades/en-arriendo.html` y `/propiedades/oportunidades.html`.

### Page Rules (Alternativa)

Si las transform rules no están disponibles, usa Page Rules:

1. Ve a **Rules** > **Page Rules**
2. Crea reglas para cada página de categoría:
   - URL: `*propinvest.cl/propiedades/en-venta.html*`
   - Action: `Forwarding URL` → `301 Redirect`
   - Destination: `https://propinvest.cl/propiedades/en-venta.html`

## Verificación de la Solución

### Test 1: Navegación Directa
- Navega directamente a `/propiedades/en-venta.html`
- Debe mostrar la página de propiedades en venta
- NO debe redirigir a `propiedad-dinamica.html`

### Test 2: Navegación desde Menú
- Haz clic en "Propiedades" → "En Venta" en el menú
- Debe cargar `/propiedades/en-venta.html`
- Debe mostrar las propiedades filtradas por tipo "Venta"

### Test 3: Propiedades Dinámicas
- Haz clic en "Ver Propiedad" en cualquier tarjeta
- Debe navegar a `/propiedad-dinamica.html?slug=ejemplo`
- Debe mostrar el detalle de la propiedad específica

## Troubleshooting

### Si el problema persiste:

1. **Limpia el cache de Cloudflare**:
   - Ve a **Caching** > **Configuration**
   - Haz clic en "Purge Everything"

2. **Verifica la configuración de DNS**:
   - Asegúrate de que el dominio apunte correctamente a Cloudflare Pages

3. **Revisa los logs de despliegue**:
   - Ve a **Deployments** en Cloudflare Pages
   - Verifica que no haya errores en el build

4. **Contacta soporte de Cloudflare**:
   - Si el problema persiste, puede ser un issue específico de la configuración

## Estructura Final de Archivos

```
front/
├── _redirects          # ✅ Configuración de redirecciones
├── _headers           # ✅ Headers de seguridad
├── wrangler.toml      # ✅ Configuración de Cloudflare
├── propiedades/
│   ├── en-venta.html      # ✅ Página estática
│   ├── en-arriendo.html   # ✅ Página estática
│   └── oportunidades.html # ✅ Página estática
└── propiedad-dinamica.html # ✅ Página dinámica
```

## Resultado Esperado

Después de aplicar esta solución:

- ✅ Las páginas de categorías se cargan correctamente
- ✅ La estructura de URLs se preserva (`/propiedades/en-venta.html`)
- ✅ Las propiedades dinámicas funcionan con parámetros (`?slug=`)
- ✅ No hay redirecciones incorrectas
- ✅ El rendimiento se mantiene optimizado 