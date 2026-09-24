#!/usr/bin/env node
"use strict";

// Genera todos los .html + sitemap.xml + robots.txt y VERIFICA enlaces e
// imágenes internas. El HTML generado no se edita a mano: se toca el
// contenido en _build/data.js o las páginas en _build/pages/*.js y se
// vuelve a ejecutar `node build.js`.

const fs = require("fs");
const path = require("path");

const { SITE, FOOT } = require("./_build/nav");
const { GUIDES, ARTICLES, FEATURED } = require("./_build/data");

// Productos que Amazon da como no disponibles o eliminados (lo genera
// _tools/asin-status). Se quitan antes de construir nada.
const UNAVAILABLE = new Set(fs.existsSync(path.join(__dirname, "_build/unavailable.json")) ? require("./_build/unavailable.json") : []);
for (const g of GUIDES) g.products = g.products.filter((p) => !UNAVAILABLE.has(p.asin));
for (let i = FEATURED.length - 1; i >= 0; i--) if (UNAVAILABLE.has(FEATURED[i].asin)) FEATURED.splice(i, 1);
const { page: renderPage, formatDate, head: renderHead } = require("./_build/layout");

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
const { seoPages, guideBanner } = require("./_build/seo");

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
  ...GUIDES.map((g) => {
    const p = guiaPage(g);
    p.html = p.html.replace('<section class="section">', guideBanner(g) + '<section class="section">');
    return p;
  }),
  productosIndex(),
  ...productPages,
  ...allComparativaPages,
  ...seoPages(),
  blogIndex(),
  ...ARTICLES.map(articuloPage),
  avisoLegal(),
  politicaPrivacidad(),
  politicaCookies(),
  notFound(),
];

// --- Ajustes SEO comunes -------------------------------------------------------

const TODAY = new Date().toISOString().slice(0, 10);
const guideImg = Object.fromEntries(GUIDES.map((g) => [g.slug, g.img]));
const clipTo = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[\s,;:.·-]+$/, ""));

for (const p of pages) {
  // Imagen para redes/Pinterest: la primera imagen propia de la página, si no
  // la de su guía, si no la genérica del sitio. JPG para máxima compatibilidad.
  const own = (p.html.match(/src="(\/assets\/img\/[^"]+\.(?:jpe?g|png|webp))"/) || [])[1];
  const cat = p.excludeCategory && guideImg[p.excludeCategory];
  const amz = (p.html.match(/src="(https:\/\/m\.media-amazon\.com\/[^"]+)"/) || [])[1];
  let img = own || cat || amz || "/assets/img/trust-bg.jpg";
  if (img.startsWith("/") && img.endsWith(".webp") && fs.existsSync(path.join(ROOT, img.replace(/\.webp$/, ".jpg")))) img = img.replace(/\.webp$/, ".jpg");
  p.image = img;

  p.jsonLd = p.jsonLd || [];
  const types = p.jsonLd.map((o) => o["@type"]);
  if (!p.noindex && p.path !== "/" && !types.includes("BreadcrumbList")) {
    const items = p.breadcrumbsItems || [{ label: "Inicio", href: "/" }, { label: p.title }];
    p.jsonLd.unshift({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: String(c.label).replace(/<[^>]+>/g, ""), item: SITE.domain + (c.href || p.path) })) });
  }
  if (/^\/(comparativas|guias)\/.+\.html$/.test(p.path) && !types.some((t) => /Article/.test(t))) {
    p.jsonLd.push({ "@context": "https://schema.org", "@type": "Article", headline: p.title.slice(0, 110), description: p.description, image: img.startsWith("http") ? img : SITE.domain + img, datePublished: "2026-09-24", dateModified: "2026-09-24", author: { "@type": "Organization", name: SITE.name, url: SITE.domain + "/" }, publisher: { "@type": "Organization", name: SITE.name, url: SITE.domain + "/" }, mainEntityOfPage: SITE.domain + p.path });
  }
}

// Títulos únicos: si dos páginas acaban con el mismo <title>, se añade lo que
// distingue a cada una según su URL.
{
  const byTitle = new Map();
  const shown = (p) => (renderHead({ title: p.title, description: "", path: p.path }).match(/<title>([^<]*)<\/title>/) || [])[1];
  for (const p of pages) if (!p.noindex) byTitle.set(shown(p), [...(byTitle.get(shown(p)) || []), p]);
  for (const [, group] of byTitle) {
    if (group.length < 2) continue;
    const t = group[0].title;
    const words = group.map((p) => p.path.replace(/\.html$/, "").split("/").pop().split("-").filter((w) => !/^b0[a-z0-9]{8}$/.test(w)));
    group.forEach((p, i) => {
      const others = new Set(words.filter((_, j) => j !== i).flat());
      const asin = (p.path.match(/b0[a-z0-9]{8}/) || [])[0];
      const diff = words[i].filter((w) => !others.has(w)).join(" ").toUpperCase() || (i ? (asin || String(i + 1)).toUpperCase() : "");
      if (diff) p.title = `${clipTo(t, 58 - diff.length)} (${diff})`;
    });
  }
}

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
    image: p.image,
  });
  fs.writeFileSync(outPath, html, "utf8");
}

console.log(`Generadas ${pages.length} páginas.`);

// --- Páginas obsoletas -> 301 ---------------------------------------------------
// Borra los .html generados que ya no produce el build (p. ej. selecciones
// fusionadas o productos retirados) y guarda una redirección 301 a la página
// más parecida que sigue existiendo, para no perder enlaces ni posicionamiento.
{
  const REDIR = path.join(ROOT, "_build/redirects.json");
  const redirects = fs.existsSync(REDIR) ? JSON.parse(fs.readFileSync(REDIR, "utf8")) : {};
  const live = new Set(pages.map((p) => p.path));
  for (const p of pages) { live.add("/" + p.route); if (p.route.endsWith("index.html")) live.add("/" + p.route.replace(/index\.html$/, "")); }
  for (const dir of ["mejores", "comparativas", "productos", "blog", "guias"]) {
    const d = path.join(ROOT, dir);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      const url = `/${dir}/${f}`;
      if (!f.endsWith(".html") || live.has(url)) continue;
      const old = fs.readFileSync(path.join(d, f), "utf8");
      const cands = [...old.matchAll(/href="(\/(?:mejores|guias)\/[^"#]+\.html)"/g)].map((m) => m[1]);
      const target = cands.find((c) => live.has(c) && c !== url) || `/${dir}/`;
      redirects[url] = target;
      fs.unlinkSync(path.join(d, f));
    }
  }
  for (const [from, to] of Object.entries(redirects)) {
    if (live.has(from)) delete redirects[from];                 // la URL vuelve a existir
    else if (!live.has(to)) redirects[from] = redirects[to] || `/${from.split("/")[1]}/`;
  }
  fs.writeFileSync(REDIR, JSON.stringify(redirects, null, 1));
  const vjPath = path.join(ROOT, "vercel.json");
  const vj = JSON.parse(fs.readFileSync(vjPath, "utf8"));
  vj.redirects = [
    ...Object.entries(redirects).sort().map(([source, destination]) => ({ source, destination, permanent: true })),
    ...(vj.redirects || []).filter((r) => !redirects[r.source] && !(r.source.endsWith(".html") && r.source.split("/").length === 3)),
  ];
  fs.writeFileSync(vjPath, JSON.stringify(vj, null, 2) + "\n");
  if (Object.keys(redirects).length) console.log(`${Object.keys(redirects).length} redirecciones 301 de páginas retiradas.`);
}

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
  if (p.path.startsWith("/mejores/")) return "0.9";
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
