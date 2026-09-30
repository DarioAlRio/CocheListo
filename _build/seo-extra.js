"use strict";

// Ajustes SEO y E-E-A-T comunes a las 8 webs (auditoría del 30-09-2026).
// Copia común en _tools/seo-extra.js; cada web lleva la suya en
// _build/seo-extra.js (la copia _tools/install-extra.js). Lo usa build.js:
//   extraPages()        Sobre nosotros, Contacto y Política de afiliación
//   tunePages(pages)    noindex de comparativas de plantilla, autor, firma
//                       visible, descripciones de 140-155 caracteres…
//   lastmodOf(p)        fecha real de la última modificación (por hash)
//   writeLlms(ROOT, pages)

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { SITE, FOOT } = require("./nav");
const { GUIDES } = require("./data");
const { pageHero } = require("./layout");
const { escapeHtml } = require("./lib");

const TODAY = new Date().toISOString().slice(0, 10);
const ABOUT = "/sobre-nosotros/";
const topicOf = (g) => g.title.replace(/^Cómo elegir (un |una |unos |unas )?/i, "").toLowerCase();

// --- Páginas de confianza (E-E-A-T) ------------------------------------------

function wrap(eyebrow, title, dek, body) {
  return `
  ${pageHero({ eyebrow, title, dek })}
  <section class="section">
    <div class="wrap prose">
${body}
    </div>
  </section>`;
}

function aboutPage() {
  const cats = GUIDES.map((g) => `<li><a href="/mejores/${g.slug}.html">${escapeHtml(topicOf(g))}</a></li>`).join("");
  const html = wrap("Quiénes somos", `Sobre ${SITE.name}: quiénes somos y cómo elegimos`, `${SITE.name} es una web de guías de compra independiente. Aquí te contamos cómo seleccionamos y ordenamos los productos, y qué no hacemos.`, `
      <h2>Quién está detrás</h2>
      <p>${SITE.name} lo escribe y mantiene un equipo editorial pequeño que publica guías de compra en español. No somos una tienda ni un fabricante: no vendemos nada ni gestionamos pedidos. Nuestro trabajo es ordenar la información que ya existe para que elijas antes y con menos dudas.</p>
      <p>Para cualquier corrección, duda o propuesta puedes escribirnos a <a href="mailto:${SITE.email}">${SITE.email}</a> o desde la página de <a href="/contacto/">contacto</a>.</p>

      <h2>Cómo elegimos los productos</h2>
      <ol>
        <li><strong>Partimos de lo que se vende de verdad.</strong> Revisamos los productos más vendidos y mejor valorados de cada categoría en Amazon.es.</li>
        <li><strong>Filtramos.</strong> Descartamos los modelos no disponibles y los que no encajan en la categoría (por ejemplo, una báscula de baño dentro de las básculas de bebé).</li>
        <li><strong>Comprobamos el enlace.</strong> Cada producto se enlaza por su código ASIN, que verificamos antes de publicarlo.</li>
        <li><strong>Aplicamos criterios de compra.</strong> Cada categoría tiene una guía con lo que conviene mirar antes de comprar; esos criterios son los que usamos para comentar cada modelo.</li>
      </ol>

      <h2>Cómo se ordenan los rankings</h2>
      <p>El orden de cada ranking combina dos datos: la valoración media que dan los compradores y el número de opiniones. Una nota muy alta con una docena de opiniones pesa menos que una algo más baja respaldada por miles de compradores.</p>
      <p>El podio destaca tres perfiles: el <strong>mejor en general</strong> (el primero del ranking), el de <strong>mejor calidad-precio</strong> (buena valoración sin irse de precio) y el <strong>más barato que merece la pena</strong> (el más económico que mantiene buenas opiniones).</p>

      <h2>Qué significa «Nuestra puntuación»</h2>
      <p>Es una nota de 0 a 10 que calculamos igual para todos los productos de una misma guía:</p>
      <ul>
        <li>Hasta 7 puntos salen de la valoración media de los compradores (una media de 5 estrellas equivale a 7 puntos).</li>
        <li>+1 punto si es el modelo más económico de la guía y +1 si es el más completo (el de gama más alta).</li>
      </ul>
      <p>Sirve para comparar modelos de la misma categoría, no entre categorías distintas.</p>

      <h2>Lo que no hacemos</h2>
      <ul>
        <li>No probamos físicamente cada producto: nos basamos en datos públicos, fichas técnicas y opiniones de compradores, y lo decimos así.</li>
        <li>No publicamos precios fijos, porque cambian a diario: el precio actual siempre está en Amazon.</li>
        <li>No aceptamos pagos de marcas para aparecer ni para subir en un ranking.</li>
        <li>No inventamos reseñas ni valoraciones.</li>
      </ul>

      <h2>Cómo nos financiamos</h2>
      <p>${SITE.name} participa en el Programa de Afiliados de Amazon EU. Si compras a través de nuestros enlaces recibimos una pequeña comisión, sin coste extra para ti. Lo explicamos en la <a href="/legal/afiliacion.html">política de afiliación</a>.</p>

      <h2>Revisión y actualización</h2>
      <p>Revisamos los rankings de forma periódica para retirar productos agotados o que dejan de encajar y añadir modelos nuevos. Cada página muestra la fecha de su última actualización.</p>

      <h2>Nuestras categorías</h2>
      <ul>${cats}</ul>`);
  return {
    route: "sobre-nosotros/index.html",
    path: ABOUT,
    title: `Sobre nosotros: quiénes somos y cómo elegimos`,
    description: `Quién está detrás de ${SITE.name}, cómo seleccionamos y ordenamos los productos, qué significa nuestra puntuación y cómo nos financiamos.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Sobre nosotros" }],
    jsonLd: [{ "@context": "https://schema.org", "@type": "AboutPage", name: `Sobre ${SITE.name}`, url: SITE.domain + ABOUT, about: { "@type": "Organization", name: SITE.name, url: SITE.domain + "/", email: SITE.email } }],
    html,
  };
}

function contactPage() {
  const html = wrap("Contacto", `Contacto con ${SITE.name}`, "¿Has visto un error, un producto que ya no está disponible o quieres proponernos algo? Escríbenos.", `
      <h2>Correo electrónico</h2>
      <p>La forma más rápida de contactar con el equipo es por correo: <a href="mailto:${SITE.email}"><strong>${SITE.email}</strong></a>. Respondemos normalmente en unos días laborables.</p>
      <h2>Qué nos puedes enviar</h2>
      <ul>
        <li>Correcciones: datos erróneos, enlaces que no funcionan o productos agotados.</li>
        <li>Sugerencias de productos o categorías que echas en falta.</li>
        <li>Consultas sobre privacidad o sobre tus datos (ver la <a href="/legal/politica-privacidad.html">política de privacidad</a>).</li>
      </ul>
      <h2>Lo que no podemos hacer</h2>
      <p>No somos una tienda: no podemos gestionar pedidos, envíos, devoluciones ni garantías. Para eso, contacta con Amazon o con el vendedor desde tu cuenta.</p>
      <p>Si quieres saber cómo trabajamos, lee <a href="${ABOUT}">quiénes somos y cómo elegimos los productos</a>.</p>`);
  return {
    route: "contacto/index.html",
    path: "/contacto/",
    title: `Contacto: escríbenos`,
    description: `Contacta con el equipo de ${SITE.name} para enviar correcciones, avisar de productos agotados o proponer categorías. Te respondemos por correo electrónico.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Contacto" }],
    jsonLd: [{ "@context": "https://schema.org", "@type": "ContactPage", name: `Contacto con ${SITE.name}`, url: SITE.domain + "/contacto/" }],
    html,
  };
}

function affiliatePage() {
  const html = wrap("Legal", "Política de afiliación", "", `
      <p class="updated">Última actualización: ${TODAY.split("-").reverse().join("/")}</p>
      <h2>Participación en el Programa de Afiliados de Amazon</h2>
      <p>${SITE.name} participa en el Programa de Afiliados de Amazon EU, un programa de publicidad para afiliados diseñado para ofrecer a sitios web un modo de obtener comisiones por publicidad, publicitando e incluyendo enlaces a Amazon.es.</p>
      <p>Como afiliado de Amazon, obtenemos ingresos por las compras adscritas que cumplen los requisitos aplicables.</p>
      <h2>Qué significa para ti</h2>
      <ul>
        <li>Los botones «Ver precio en Amazon» y similares son enlaces de afiliado.</li>
        <li>Si compras a través de ellos, Amazon nos paga una pequeña comisión. <strong>El precio para ti es el mismo.</strong></li>
        <li>Los enlaces llevan el atributo <code>rel="sponsored"</code>, como piden los buscadores.</li>
      </ul>
      <h2>Independencia editorial</h2>
      <p>Las comisiones no deciden qué productos aparecen ni en qué orden. Los rankings se ordenan con los criterios que explicamos en <a href="${ABOUT}">cómo elegimos los productos</a>, y ninguna marca paga por aparecer.</p>
      <h2>Precios y disponibilidad</h2>
      <p>No mostramos precios fijos: los precios y la disponibilidad cambian con frecuencia y los que valen son los que ves en Amazon en el momento de la compra.</p>
      <p>Para cualquier duda, escríbenos a <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`);
  return {
    route: "legal/afiliacion.html",
    path: "/legal/afiliacion.html",
    title: "Política de afiliación",
    description: `Cómo funcionan los enlaces de afiliado de ${SITE.name} al Programa de Afiliados de Amazon EU y por qué no cambian el precio que pagas.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Política de afiliación" }],
    noindex: true,
    html,
  };
}

function extraPages() {
  // Enlaces en el pie (columna legal): quién somos, contacto y afiliación.
  const legal = FOOT.columnas.find((c) => /legal/i.test(c.titulo));
  if (legal && !legal.enlaces.some((e) => e.href === ABOUT)) {
    legal.enlaces.unshift({ label: "Sobre nosotros", href: ABOUT }, { label: "Contacto", href: "/contacto/" });
    legal.enlaces.push({ label: "Afiliación", href: "/legal/afiliacion.html" });
  }
  return [aboutPage(), contactPage(), affiliatePage()];
}

// --- Ajustes sobre todas las páginas -----------------------------------------

// Comparativas de plantilla sin demanda de búsqueda (producto contra producto
// con nombres de Amazon, o "entrada vs. gama media/alta"): se quedan
// publicadas y enlazadas, pero fuera del índice y del sitemap. Las
// comparativas de marca contra marca (p. ej. "Tapo vs EZVIZ") sí se indexan.
const GUIDE_SLUGS = new Set(GUIDES.map((g) => g.slug));
function isTemplateComparison(p) {
  if (!p.path.startsWith("/comparativas/")) return false;
  if (p.pair) return true; // producto contra producto (seo.js)
  const slug = p.path.slice("/comparativas/".length).replace(/\.html$/, "");
  const base = slug.replace(/-(entrada-vs-gama-media|gama-media-vs-alta)$/, "");
  return GUIDE_SLUGS.has(base); // entrada vs. gama alta/media (comparativa.js)
}

// Descripción de 140-155 caracteres: si sobra, se quitan frases del final;
// si falta, se completa con una llamada a la acción.
const CTAS = [
  "Consulta el precio actual en Amazon.",
  "Elige rápido y sin sorpresas.",
  "Precio actualizado en Amazon.",
  "Te ayudamos a elegir bien.",
  "Compara antes de comprar.",
  "Sin letra pequeña.",
];
function fitDescription(d) {
  let s = String(d || "").replace(/\s+/g, " ").trim();
  if (s.length > 155) {
    const parts = s.split(/(?<=[.!?])\s+/);
    while (parts.length > 1 && parts.join(" ").length > 155) parts.pop();
    s = parts.join(" ");
    if (s.length > 155) {
      s = s.slice(0, 154).replace(/[\s,;:]+\S*$/, "");
      // Sin terminar en "del", "para", "con"… ni en un inciso a medias.
      while (/\s(y|e|o|u|de|del|la|el|los|las|en|a|al|con|para|por|sin|que|un|una|más|muy)$/i.test(s)) s = s.replace(/\s+\S+$/, "");
      s = s.replace(/[\s,;:.·–—-]+$/, "") + ".";
    }
  }
  if (s && !/[.!?]$/.test(s)) s += ".";
  for (let i = 0; s.length < 140 && i < 4; i++) {
    const room = 155 - s.length - 1;
    const best = CTAS.filter((c) => c.length <= room && !s.includes(c)).sort((a, b) => b.length - a.length)[0];
    if (!best) break;
    s += " " + best;
  }
  return s;
}

const BYLINE = `<p class="byline">Por el equipo editorial de ${SITE.name} · <a href="${ABOUT}">Cómo elegimos los productos</a></p>`;
const orgRef = () => ({ "@type": "Organization", name: SITE.name, url: SITE.domain + ABOUT });

function tunePages(pages) {
  for (const p of pages) {
    if (isTemplateComparison(p)) p.noindex = true;
    if (p.path.startsWith("/legal/")) p.noindex = true;

    // Autor: la marca es una organización, no una persona.
    for (const o of p.jsonLd || []) {
      if (!/Article|BlogPosting/.test(o["@type"] || "")) continue;
      if (!o.author || (o.author["@type"] === "Person" && o.author.name === SITE.name)) o.author = orgRef();
      if (!o.publisher) o.publisher = { "@type": "Organization", name: SITE.name, url: SITE.domain + "/" };
    }

    // Firma visible bajo la fecha de actualización en el contenido editorial.
    if (/^\/(blog|guias|mejores|comparativas|productos)\/./.test(p.path) && !p.html.includes('class="byline"')) {
      p.html = p.html.replace(/(<p class="updated">[\s\S]*?<\/p>)/, `$1\n      ${BYLINE}`);
    }

    // Imagen principal de rankings y comparativas: la primera imagen (podio o
    // portada VS) se carga con prioridad, sin lazy.
    if (/^\/(mejores|comparativas)\//.test(p.path) && !p.html.includes('fetchpriority="high"')) {
      p.html = p.html.replace(/<img\b([^>]*?)\s+loading="lazy"([^>]*)>/, '<img fetchpriority="high"$1$2>');
    }

    p.description = fitDescription(p.description);
  }

  // Índices de sección con título demasiado corto ("Blog", "Guías de compra").
  const idxTitles = { "/blog/": "Blog: consejos y dudas antes de comprar", "/guias/": "Guías de compra: cómo elegir paso a paso" };
  for (const p of pages) if (idxTitles[p.path] && p.title.length < 30) p.title = idxTitles[p.path];

  // Descripciones únicas: si dos páginas indexables coinciden, se añade lo que
  // las distingue (el final de su URL).
  const seen = new Map();
  for (const p of pages) if (!p.noindex) seen.set(p.description, [...(seen.get(p.description) || []), p]);
  for (const [, group] of seen) {
    if (group.length < 2) continue;
    group.slice(1).forEach((p) => {
      const tag = p.path.replace(/\.html$/, "").split("/").pop().replace(/-/g, " ").toUpperCase().slice(0, 20);
      p.description = fitDescription(p.description.replace(/\s*[^.]*\.$/, "") + ` (${tag}).`);
    });
  }
}

// --- lastmod real ------------------------------------------------------------
// Se guarda un hash del contenido de cada página; la fecha solo cambia cuando
// cambia el contenido (no en cada build).
let STORE = null, STORE_PATH = null;
function loadStore(ROOT) {
  STORE_PATH = path.join(ROOT, "_build/lastmod.json");
  STORE = fs.existsSync(STORE_PATH) ? JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) : {};
}
function lastmodOf(p) {
  const h = crypto.createHash("sha1").update([p.title, p.description, p.html, JSON.stringify(p.jsonLd || [])].join("\n")).digest("hex").slice(0, 16);
  const cur = STORE[p.path];
  if (!cur || cur.h !== h) STORE[p.path] = { h, d: TODAY };
  return STORE[p.path].d;
}
function saveStore(pages) {
  const live = new Set(pages.map((p) => p.path));
  for (const k of Object.keys(STORE)) if (!live.has(k)) delete STORE[k];
  fs.writeFileSync(STORE_PATH, JSON.stringify(STORE, null, 0).replace(/\},/g, "},\n"));
}

// --- llms.txt ------------------------------------------------------------------
function writeLlms(ROOT, pages) {
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const line = (href, label, note) => `- [${label}](${SITE.domain}${href})${note ? `: ${note}` : ""}`;
  const txt = `# ${SITE.name}

> ${SITE.description}

${SITE.name} publica guías de compra y rankings en español. Los productos se seleccionan entre los más vendidos de Amazon.es y se ordenan por valoración media y número de opiniones de compradores. No se publican precios fijos. Metodología completa: ${SITE.domain}${ABOUT}

## Rankings
${GUIDES.map((g) => line(`/mejores/${g.slug}.html`, `Mejores ${topicOf(g)}`, (byPath.get(`/mejores/${g.slug}.html`) || {}).description)).join("\n")}

## Guías de compra
${GUIDES.map((g) => line(`/guias/${g.slug}.html`, g.title)).join("\n")}

## Sobre el sitio
${line(ABOUT, "Sobre nosotros y metodología")}
${line("/contacto/", "Contacto")}
${line("/legal/afiliacion.html", "Política de afiliación")}
`;
  fs.writeFileSync(path.join(ROOT, "llms.txt"), txt, "utf8");
  // Lista de noindex intencionados, para que seo-audit.js no los marque como error.
  const noindex = pages.filter((p) => p.noindex).map((p) => p.route.replace(/\\/g, "/")).sort();
  fs.writeFileSync(path.join(ROOT, "_build/noindex.json"), JSON.stringify(noindex, null, 1) + "\n");
}

module.exports = { extraPages, tunePages, fitDescription, loadStore, lastmodOf, saveStore, writeLlms };
