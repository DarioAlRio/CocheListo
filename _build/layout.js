"use strict";

const { SITE, NAV, FOOT } = require("./nav");
const { icon, escapeHtml, featuredProductsSection } = require("./lib");
const { FEATURED } = require("./data");

// Recorta a `max` caracteres sin partir palabras (títulos <=65 y descripciones <=160
// para que Google no los corte).
function clip(s, max) {
  const t = String(s).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return (i > max * 0.6 ? cut.slice(0, i) : cut).replace(/[\s,;:.\u2014\u2013-]+$/, "") + "…";
}

function head({ title, description, path, jsonLd = [], noindex = false }) {
  const fullTitle =
    path === "/"
      ? clip(`${SITE.name} — ${SITE.claim}`, 65)
      : `${title} — ${SITE.name}`.length <= 65
        ? `${title} — ${SITE.name}`
        : clip(title, 65);
  const desc = clip(description || SITE.description, 160);
  const canonical = `${SITE.domain}${path}`;
  const robots = noindex ? "noindex, nofollow" : "index, follow";
  const ld = jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join("\n  ");

  return `<meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:title" content="${escapeHtml(fullTitle)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${SITE.locale}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script>document.documentElement.classList.add('js')</script>
  ${ld}`;
}

function headerHtml(path) {
  const items = NAV.map((n) => {
    const active = path === n.href || (n.href !== "/" && path.startsWith(n.href.replace(/\/$/, "")));
    return `<li><a href="${n.href}"${active ? ' aria-current="page"' : ""}>${n.label}</a></li>`;
  }).join("\n        ");

  return `<a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="logo" href="/">
        <span class="logo-mark" aria-hidden="true">${icon("shield")}</span>
        <span class="logo-text">${SITE.name}</span>
      </a>
      <nav class="nav-desktop" aria-label="Principal">
        <ul>
        ${items}
        </ul>
      </nav>
      <details class="nav-mobile-wrap">
        <summary class="nav-toggle">
          ${icon("menu", "icon-open")}
          ${icon("close", "icon-close")}
          <span class="sr-only">Abrir menú</span>
        </summary>
        <nav class="nav-mobile" aria-label="Principal (móvil)">
          <ul>
          ${items}
          </ul>
        </nav>
      </details>
    </div>
  </header>`;
}

function footerHtml(foot) {
  const columnas = foot.columnas
    .map(
      (col) => `<div class="foot-col">
        <h3>${col.titulo}</h3>
        <ul>
          ${col.enlaces.map((e) => `<li><a href="${e.href}">${e.label}</a></li>`).join("\n          ")}
        </ul>
      </div>`
    )
    .join("\n      ");

  return `<footer class="site-footer">
    <div class="wrap">
      <div class="amazon-disclaimer">
        <p>${SITE.amazonDisclaimer}</p>
      </div>
      <div class="foot-grid">
        <div class="foot-brand">
          <a class="logo" href="/">
            <span class="logo-mark" aria-hidden="true">${icon("shield")}</span>
            <span class="logo-text">${SITE.name}</span>
          </a>
          <p>${SITE.claim}.</p>
        </div>
        ${columnas}
      </div>
      <div class="foot-bottom">
        <p>© ${new Date().getFullYear()} ${SITE.name}. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>`;
}

function cookieBanner() {
  return `<div class="cookiebar" id="cookiebar" hidden>
    <div class="wrap cookiebar-inner">
      <p>Usamos cookies propias y de terceros para analizar el uso del sitio y, si aceptas, para medir los enlaces a Amazon. Puedes leer más en la
        <a href="/legal/politica-cookies.html">política de cookies</a>.</p>
      <div class="cookiebar-actions">
        <button type="button" class="btn btn-ghost" id="cookie-reject">Rechazar</button>
        <button type="button" class="btn btn-accent" id="cookie-accept">Aceptar</button>
      </div>
    </div>
  </div>`;
}

function breadcrumbs(items) {
  // items: [{label, href?}] — el último sin href, es la página actual
  const parts = items
    .map((it, i) =>
      it.href
        ? `<li><a href="${it.href}">${it.label}</a></li>`
        : `<li aria-current="page">${it.label}</li>`
    )
    .join("\n      ");
  return `<nav class="breadcrumbs" aria-label="Migas de pan">
    <ol class="wrap">
      ${parts}
    </ol>
  </nav>`;
}

function pageHero({ eyebrow, title, dek, updated, image, imageAlt }) {
  return `<section class="page-hero${image ? " page-hero-with-image" : ""}">
    <div class="wrap${image ? " page-hero-inner" : ""}">
      <div class="page-hero-copy">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
        <h1>${title}</h1>
        ${dek ? `<p class="hero-dek">${dek}</p>` : ""}
        ${updated ? `<p class="updated">Actualizado el ${formatDate(updated)}</p>` : ""}
      </div>
      ${image ? `<img class="page-hero-img" src="${image}" alt="${imageAlt || ""}" loading="lazy" width="480" height="320">` : ""}
    </div>
  </section>`;
}

function formatDate(iso) {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${meses[m - 1]} de ${y}`;
}

function ctaBand() {
  return `<section class="cta-band">
    <div class="wrap">
      <h2>¿Buscas una recomendación rápida?</h2>
      <p>Empieza por la guía que más te preocupe ahora mismo: cámaras WiFi de interior, timbres con cámara o cerraduras inteligentes.</p>
      <a class="btn btn-light" href="/guias/">Ver todas las guías ${icon("arrow")}</a>
    </div>
  </section>`;
}

function page({ path, title, description, bodyClass = "", jsonLd = [], noindex = false, breadcrumbsItems = null, excludeCategory = null, main }) {
  return `<!DOCTYPE html>
<html lang="${SITE.lang}">
<head>
  ${head({ title, description, path, jsonLd, noindex })}
</head>
<body class="${bodyClass}">
  ${headerHtml(path)}
  ${breadcrumbsItems ? breadcrumbs(breadcrumbsItems) : ""}
  <main id="contenido">
    ${main}
    ${featuredProductsSection(FEATURED, excludeCategory)}
  </main>
  ${footerHtml(FOOT)}
  ${cookieBanner()}
  <script src="/assets/js/site.js"></script>
</body>
</html>`;
}

module.exports = {
  head,
  headerHtml,
  footerHtml,
  cookieBanner,
  breadcrumbs,
  pageHero,
  ctaBand,
  formatDate,
  page,
};
