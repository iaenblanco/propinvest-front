# Configuración de PropInvest con Strapi

Este proyecto ha sido configurado para consumir datos dinámicamente desde una API de Strapi.

## ✅ Configuración Completada

Las URLs de Strapi ya están configuradas:
- **API URL**: `https://truthful-rhythm-e8bcafa766.strapiapp.com/api`
- **Imágenes URL**: `https://truthful-rhythm-e8bcafa766.strapiapp.com`

## 🧪 Página de Prueba

Para verificar que todo funcione correctamente, visita:
**`/test-strapi.html`**

Esta página te permitirá:
- ✅ Probar la conexión con Strapi
- 📋 Ver todas las propiedades disponibles
- ⭐ Ver propiedades destacadas
- 🔍 Verificar que los datos se carguen correctamente

## 📋 Estructura de la Colección en Strapi

Asegúrate de que tu colección "Propiedad" en Strapi tenga los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Titulo` | Text | Nombre de la propiedad |
| `Slug` | UID | URL única (se genera desde el título) |
| `Ubicacion` | Text | Ubicación general |
| `Descripcion` | Rich Text | Descripción detallada |
| `Precio` | Number | Precio en UF (número entero) |
| `Imagenes` | Multiple Media | Galería de fotos |
| `Dormitorios` | Number | Cantidad de dormitorios |
| `Banos` | Number | Cantidad de baños |
| `Superficie` | Number | Metros cuadrados |
| `Destacado` | Boolean | Si aparece en destacados |
| `Direccion` | Text | Dirección específica |
| `Publicado` | Boolean | Si está publicado |

## 🔧 Configuración de Permisos en Strapi

En el panel de administración de Strapi:

1. Ve a **Settings > Users & Permissions Plugin > Roles**
2. Selecciona **Public**
3. En la colección "Propiedad", habilita:
   - `find` (para listar propiedades)
   - `findOne` (para ver detalles)

## 🚀 Funcionalidades Implementadas

### ✅ Páginas Dinámicas
- **Página Principal**: Muestra propiedades destacadas
- **Página de Propiedades**: Lista todas las propiedades publicadas
- **Páginas de Detalle**: URLs dinámicas basadas en el slug

### ✅ Características Técnicas
- Carga asíncrona de datos desde Strapi
- Manejo de errores y estados de carga
- Galería de imágenes con lightbox
- Formateo automático de precios (UF 25.000)
- Íconos para características (🛏️ 🚿 🏡)
- SEO optimizado con metadatos dinámicos
- Datos estructurados JSON-LD

### ✅ URLs Dinámicas
Las propiedades se acceden mediante URLs como:
- `/propiedades/residencia-moderna-lo-barnechea.html`
- `/propiedades/hacienda-clasica-chicureo.html`

## 📁 Estructura de Archivos

```
front/
├── assets/
│   ├── js/
│   │   ├── config.js          # Configuración de Strapi ✅
│   │   ├── api.js             # Funciones de API ✅
│   │   └── main.js            # Funcionalidad principal ✅
│   └── css/
│       └── style.css
├── propiedad-dinamica.html    # Plantilla para páginas de detalle ✅
├── test-strapi.html          # Página de prueba ✅
├── _redirects                 # Configuración para Cloudflare Pages ✅
└── README-STRAPI.md          # Este archivo ✅
```

## 🔧 Comandos de Despliegue

### Para Cloudflare Pages:

1. Conecta tu repositorio a Cloudflare Pages
2. Configura las variables de entorno si es necesario
3. El archivo `_redirects` se aplicará automáticamente

### Para otros servidores:

Asegúrate de configurar el servidor para que todas las rutas `/propiedades/*` redirijan a `propiedad-dinamica.html`.

## 🐛 Solución de Problemas

### Error: "No se pudo cargar la información de la propiedad"
- Verifica que la URL de la API sea correcta ✅
- Confirma que la propiedad esté marcada como "Publicado"
- Revisa los permisos de la colección en Strapi

### Error: "Error al conectar con Strapi"
- Verifica que el backend de Strapi esté funcionando
- Confirma que la URL de la API sea accesible ✅
- Revisa la configuración de CORS

### Las imágenes no se cargan
- Verifica que las imágenes estén subidas en Strapi
- Confirma que la URL base de imágenes sea correcta ✅
- Revisa los permisos de archivos en Strapi

## 🧪 Prueba de Funcionamiento

1. **Abre `/test-strapi.html`** en tu navegador
2. **Haz clic en "Probar Conexión"** para verificar la API
3. **Carga propiedades** para ver los datos disponibles
4. **Verifica que todo funcione** antes de desplegar

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa la consola del navegador para errores
2. Usa la página `/test-strapi.html` para diagnosticar problemas
3. Verifica la configuración de Strapi
4. Confirma que todos los campos estén correctamente configurados

---

**✅ Estado**: Configuración completada y lista para usar.
**🌐 API**: `https://truthful-rhythm-e8bcafa766.strapiapp.com/api`
**🖼️ Imágenes**: `https://truthful-rhythm-e8bcafa766.strapiapp.com` 