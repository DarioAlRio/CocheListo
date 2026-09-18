# Pendiente antes de publicar y solicitar el alta en Amazon Afiliados

## Store ID / tag de afiliado (URGENTE, bloquea todo enlace de producto)

- **`SITE.amazonTag` es un PLACEHOLDER**: hoy vale `cochelisto0a-21` en
  `_build/nav.js`, pero ese Store ID **todavía no existe** en el panel de
  Amazon Afiliados. Hay que:
  1. Crear el Store ID real para este sitio en `afiliados.amazon.es`.
  2. Sustituir `cochelisto0a-21` por el tag real en `SITE.amazonTag`
     (`_build/nav.js`).
  3. Ejecutar `node build.js` para regenerar todas las páginas — todos los
     enlaces de producto (`https://www.amazon.es/dp/<ASIN>?tag=...`) se
     regeneran automáticamente a partir de esta constante.

Hasta que se haga esto, **todos los enlaces de afiliado del sitio apuntan
a un tag que no cobra comisión real.**

## Datos que faltan (obligatorios para legal/privacidad)

- **NIF/NIE y nombre o razón social** del titular: hoy son placeholders
  `[PENDIENTE: ...]` en `_build/nav.js` (`SITE.legal`). Se usan en
  [`legal/aviso-legal.html`](legal/aviso-legal.html) y
  [`legal/politica-privacidad.html`](legal/politica-privacidad.html).
- **Domicilio fiscal completo**: mismo sitio.
- **Correo real**: `hola@cochelisto.es` es un placeholder — hoy ese
  dominio no existe. Cambiar `SITE.email` en `_build/nav.js` por un correo
  que sí puedas leer (puede ser un Gmail mientras no haya dominio propio).

Después de rellenar `_build/nav.js`, ejecutar `node build.js` para
regenerar las páginas con los datos correctos.

## Dominio

No hay dominio comprado. `SITE.domain` en `_build/nav.js` apunta a un
subdominio provisional de Vercel (`cochelisto.vercel.app`) — todavía sin
desplegar. Para la solicitud de afiliados sirve un subdominio de Vercel,
pero un dominio propio (`.es` o `.com`) da más credibilidad en la revisión
manual de Amazon.

## Cuenta de Amazon Afiliados

Esta web puede usar la MISMA cuenta de Afiliados que los demás sitios
hermanos de este directorio (Amazon permite hasta 50 sitios por cuenta),
pero necesita su propio Store ID para medir resultados por separado y para
que los enlaces cobren comisión (ver sección de arriba, todavía pendiente).

1. **Pendiente**: crear el Store ID real en `afiliados.amazon.es` y
   sustituir el placeholder en `SITE.amazonTag`.
2. **Pendiente**: publicar este sitio en Vercel (nuevo proyecto, distinto
   de los otros) y añadir la URL publicada en `afiliados.amazon.es` →
   "Tus páginas web o apps".
3. Las 3 ventas cualificadas en 180 días son **por cuenta**, no por sitio.

## Contenido

10 guías de compra + artículos de blog + inicio + guías-índice +
productos-índice + blog-índice + 3 legales + 404 sin indexar, con más de
100 productos reales en total repartidos entre las 10 guías
(`_build/data.js`). Cada guía tiene su sección de "Productos que cumplen
estos criterios" enlazada con `https://www.amazon.es/dp/<ASIN>?tag=<SITE.amazonTag>`.

Los precios y valoraciones mostrados son una foto fija tomada al añadir
cada producto (verificados en Amazon.es en septiembre de 2026: ASIN,
título e imagen reales), no datos en vivo — hay que revisarlos de vez en
cuando a mano, sobre todo en categorías con mucha rotación de modelos
(dash cams, cargadores). Siguiente paso cuando haya PA-API: sustituir esos
datos estáticos por una consulta automática en tiempo de build.

## Otras cosas menores

- `SITE.social` (Instagram/Pinterest) está vacío.
- No hay fotografías propias: el sitio usa solo iconos SVG a propósito,
  salvo las fotos de producto que vienen directamente de Amazon.
- Analítica: no hay ningún script de analítica instalado todavía.
- No tiene páginas "Sobre mí" ni "Contacto" (misma decisión que en los
  demás sitios hermanos): el correo de contacto vive solo en las páginas
  legales.
- Revisar las políticas de categorías restringidas de Amazon Afiliados
  España antes de publicar (accesorios de coche no está en la lista
  restringida a día de hoy, pero conviene confirmarlo).
