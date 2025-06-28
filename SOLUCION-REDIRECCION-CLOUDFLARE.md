# Solución Corregida para Problema de Redirección en Cloudflare Pages

## Problema Identificado

El sitio web estaba experimentando **bucles infinitos de redirección** (ERR_TOO_MANY_REDIRECTS) causados por reglas conflictivas en el archivo `_redirects`.

## Causa Raíz del Bucle Infinito

Las reglas anteriores estaban causando bucles porque:
1. **Reglas redundantes**: `/propiedades/en-venta.html /propiedades/en-venta.html 200` redirigía a sí misma
2. **Reglas generales conflictivas**: `/* /index.html 404` interceptaba todas las rutas
3. **Orden incorrecto**: Las reglas específicas no tenían prioridad sobre las generales

## Solución Corregida

### 1. Archivo `_redirects` Simplificado

Se ha simplificado el archivo `_redirects` para evitar bucles infinitos:

```bash
# Redirecciones mínimas para Cloudflare Pages
# Solo redirecciones necesarias para evitar bucles infinitos

# Redirecciones para páginas principales (sin .html)
/index /index.html 200
/asesorias /asesorias.html 200
/sobre-nosotros /sobre-nosotros.html 200
/contacto /contacto.html 200
/propiedades /propiedades.html 200

# Redirecciones para categorías de propiedades (sin .html)
/propiedades/en-venta /propiedades/en-venta.html 200
/propiedades/en-arriendo /propiedades/en-arriendo.html 200
/propiedades/oportunidades /propiedades/oportunidades.html 200
```

### 2. Eliminación de Archivos Conflictivos

- ❌ **Eliminado**: `wrangler.toml` (causaba conflictos adicionales)
- ✅ **Simplificado**: `_headers` (solo headers esenciales)

### 3. Configuración Mínima

La nueva configuración:
- ✅ **Evita bucles infinitos**
- ✅ **Preserva la estructura de URLs**
- ✅ **Mantiene la funcionalidad esencial**
- ✅ **Es compatible con Cloudflare Pages**

## Pasos para Aplicar la Solución Corregida

### Paso 1: Limpiar Cache y Cookies

1. **Limpia el cache del navegador**:
   - Chrome: `Ctrl+Shift+Delete` → Limpiar datos de navegación
   - Firefox: `Ctrl+Shift+Delete` → Limpiar datos

2. **Limpia el cache de Cloudflare**:
   - Ve al dashboard de Cloudflare
   - **Caching** > **Configuration**
   - Haz clic en "Purge Everything"

### Paso 2: Verificar Configuración en Cloudflare Pages

1. Ve al dashboard de Cloudflare Pages
2. Selecciona tu proyecto
3. Ve a **Settings** > **Builds & deployments**
4. **IMPORTANTE**: Asegúrate de que:
   - **Framework preset** = "None" o "Static HTML"
   - **Build command** = (vacío)
   - **Build output directory** = (vacío o ".")

### Paso 3: Desplegar los Cambios

1. Haz commit de los cambios:
   ```bash
   git add _redirects _headers
   git rm wrangler.toml
   git commit -m "Fix: Resolver bucles infinitos de redirección"
   git push origin main
   ```

2. Espera a que Cloudflare Pages se despliegue automáticamente

### Paso 4: Verificar el Despliegue

1. **Espera 2-3 minutos** después del despliegue
2. **Limpia el cache del navegador** nuevamente
3. **Prueba las URLs**:
   - ✅ `https://propinvest-front.pages.dev/` → Página principal
   - ✅ `https://propinvest-front.pages.dev/propiedades` → Lista general
   - ✅ `https://propinvest-front.pages.dev/propiedades/en-venta` → Propiedades en venta
   - ✅ `https://propinvest-front.pages.dev/propiedades/en-arriendo` → Propiedades en arriendo
   - ✅ `https://propinvest-front.pages.dev/propiedades/oportunidades` → Oportunidades

## Configuración Alternativa (Si el problema persiste)

Si después de aplicar la solución corregida el problema persiste, puedes probar con un archivo `_redirects` aún más mínimo:

```bash
# Configuración mínima alternativa
/propiedades/en-venta /propiedades/en-venta.html 200
/propiedades/en-arriendo /propiedades/en-arriendo.html 200
/propiedades/oportunidades /propiedades/oportunidades.html 200
```

O incluso eliminar completamente el archivo `_redirects` y manejar las redirecciones desde el dashboard de Cloudflare.

## Troubleshooting Avanzado

### Si el problema persiste:

1. **Elimina completamente el archivo `_redirects`**:
   ```bash
   git rm _redirects
   git commit -m "Remove _redirects to test"
   git push origin main
   ```

2. **Configura redirecciones desde Cloudflare Dashboard**:
   - Ve a **Rules** > **Page Rules**
   - Crea reglas manuales para cada redirección

3. **Verifica la configuración de DNS**:
   - Asegúrate de que el dominio apunte correctamente a Cloudflare Pages

4. **Contacta soporte de Cloudflare**:
   - Si el problema persiste, puede ser un issue específico de la configuración

## Verificación de la Solución

### Test 1: Navegación Directa
- ✅ `https://propinvest-front.pages.dev/propiedades/en-venta` → Debe mostrar la página
- ❌ NO debe mostrar "ERR_TOO_MANY_REDIRECTS"

### Test 2: Navegación desde Menú
- ✅ Haz clic en "Propiedades" → "En Venta"
- ✅ Debe cargar la página correctamente
- ✅ Debe mostrar las propiedades filtradas

### Test 3: URLs con .html
- ✅ `https://propinvest-front.pages.dev/propiedades/en-venta.html` → Debe funcionar
- ✅ `https://propinvest-front.pages.dev/propiedades/en-arriendo.html` → Debe funcionar

## Estructura Final de Archivos

```
front/
├── _redirects          # ✅ Configuración mínima (sin bucles)
├── _headers           # ✅ Headers simplificados
├── propiedades/
│   ├── en-venta.html      # ✅ Página estática
│   ├── en-arriendo.html   # ✅ Página estática
│   └── oportunidades.html # ✅ Página estática
└── propiedad-dinamica.html # ✅ Página dinámica
```

## Resultado Esperado

Después de aplicar esta solución corregida:

- ✅ **NO hay bucles infinitos de redirección**
- ✅ **Las páginas se cargan correctamente**
- ✅ **La estructura de URLs se preserva**
- ✅ **El rendimiento se mantiene optimizado**
- ✅ **No hay errores ERR_TOO_MANY_REDIRECTS** 