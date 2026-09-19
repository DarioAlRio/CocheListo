#!/usr/bin/env node
"use strict";

// Genera todos los .html + sitemap.xml + robots.txt y VERIFICA enlaces e
// imágenes internas. El HTML generado no se edita a mano: se toca el
// contenido en _build/data.js o las páginas en _build/pages/*.js y se
// vuelve a ejecutar `node build.js`.

const fs = require("fs");
const path = require("path");

const { SITE, FOOT } = require("./_build/nav");
const { GUIDES, ARTICLES } = require("./_build/data");
const { page: renderPage, formatDate } = require("./_build/layout");

const ROOT = __dirname;

const home = require("./_build/pages/home");
const guiasIndex = require("./_build/pages/guias-index");
const guiaPage = require("./_build/pages/guia");
const productoPage = require("./_build/pages/producto");
const productosIndex = require("./_build/pages/productos-index");
const comparativaPages = require("./_build/pages/comparativa");
const blogIndex = require("./_build/pages/blog-index");
const articuloPage = require("./_build/pages/articulo");
const { avisoLegal, politicaPrivacidad, politicaCookies } = require("./_build/pages/legal");
const notFound = require("./_build/pages/not-found");

// FOOT se completa aquí a partir de los datos reales, para no duplicar la
// lista de guías/artículos en nav.js.
FOOT.columnas[0].enlaces = GUIDES.map((g) => ({ label: g.title, href: `/guias/${g.slug}.html` }));
FOOT.columnas[1].enlaces = ARTICLES.map((a) => ({ label: a.title, href: `/blog/${a.slug}.html` }));

// Una página propia por producto (ficha con nuestro veredicto y puntuación) y
// una comparativa entrada-vs-gama-alta por guía, generadas a partir de los
// mismos datos ya verificados en GUIDES: no se investiga nada nuevo aquí.
const productPages = GUIDES.flatMap((g) => g.products.map((p) => productoPage(p, g)));
const allComparativaPages = GUIDES.flatMap(comparativaPages);

const pages = [
  home(),
  guiasIndex(),
  ...GUIDES.map(guiaPage),
  productosIndex(),
  ...productPages,
  ...allComparativaPages,
  blogIndex(),
  ...ARTICLES.map(articuloPage),
  avisoLegal(),
  politicaPrivacidad(),
  politicaCookies(),
  notFound(),
];

// --- Escritura de los .html -------------------------------------------------

for (const p of pages) {
  const outPath = path.join(ROOT, p.route);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const html = renderPage({
    path: p.path,
    title: p.title,
    description: p.description,
    jsonLd: p.jsonLd || [],
    noindex: p.noindex || false,
    breadcrumbsItems: p.breadcrumbsItems || null,
    excludeCategory: p.excludeCategory || null,
    main: p.html,
  });
  fs.writeFileSync(outPath, html, "utf8");
}

console.log(`Generadas ${pages.length} páginas.`);

// --- sitemap.xml + robots.txt -----------------------------------------------

const indexable = pages.filter((p) => !p.noindex);
const buildDate = new Date().toISOString();

// Prioridad y frecuencia de rastreo por tipo de página: el home y los
// índices de sección son los que más cambian y los que más interesa que
// Google visite a menudo; las páginas legales casi nunca cambian.
function sitemapPriority(p) {
  if (p.path === "/") return "1.0";
  if (p.path === "/guias/" || p.path === "/productos/" || p.path === "/blog/") return "0.8";
  if (p.path.startsWith("/legal/")) return "0.3";
  return "0.6";
}
function sitemapChangefreq(p) {
  if (p.path === "/") return "daily";
  if (p.path.startsWith("/legal/")) return "yearly";
  return "weekly";
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(
    (p) => `  <url>
    <loc>${SITE.domain}${p.path}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${sitemapChangefreq(p)}</changefreq>
    <priority>${sitemapPriority(p)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE.domain}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, "robots.txt"), robots, "utf8");

console.log("sitemap.xml y robots.txt generados.");

// --- Verificación ------------------------------------------------------------
// Falla con código 1 si algún enlace interno (href="/...") o alguna imagen
// referenciada (src="/assets/...") no existe en disco, o si hay dos rutas
// distintas apuntando al mismo archivo de salida.

let errors = [];

const knownRoutes = new Set(pages.map((p) => p.path));
// index.html de una carpeta también responde en la carpeta sin nombre de archivo
for (const p of pages) {
  if (p.route.endsWith("index.html")) {
    knownRoutes.add("/" + p.route.replace(/index\.html$/, ""));
  }
}

const seenRoutes = new Map();
for (const p of pages) {
  if (seenRoutes.has(p.route)) {
    errors.push(`Ruta duplicada: ${p.route} (${seenRoutes.get(p.route)} y ${p.title})`);
  }
  seenRoutes.set(p.route, p.title);
}

const hrefPattern = /href="(\/[^"#]*)"/g;
const srcPattern = /src="(\/[^"]+)"/g;

for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p.route), "utf8");

  let m;
  while ((m = hrefPattern.exec(html))) {
    const href = m[1];
    if (href.startsWith("/assets/")) {
      const file = path.join(ROOT, href);
      if (!fs.existsSync(file)) errors.push(`${p.route}: enlace a asset inexistente ${href}`);
      continue;
    }
    if (!knownRoutes.has(href)) {
      errors.push(`${p.route}: enlace interno roto ${href}`);
    }
  }

  while ((m = srcPattern.exec(html))) {
    const src = m[1];
    const file = path.join(ROOT, src);
    if (!fs.existsSync(file)) errors.push(`${p.route}: recurso inexistente ${src}`);
  }
}

if (errors.length) {
  console.error(`\n${errors.length} error(es) de verificación:\n`);
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("Verificación OK: sin enlaces ni imágenes rotas.");
