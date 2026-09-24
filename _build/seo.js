"use strict";

// Páginas orientadas a búsqueda y clic directo a Amazon, generadas a partir
// de los productos ya verificados en data.js (nada se inventa aquí):
//   /mejores/                          índice de rankings
//   /mejores/<guia>.html               "Los mejores X de 2026" (ranking completo)
//   /mejores/<guia>-baratos.html       "X baratos": la mitad más económica
//   /comparativas/<a>-vs-<b>.html      duelos entre los productos más vendidos
// Copia común en _tools/seo.js; cada web lleva la suya en _build/seo.js.

const { SITE } = require("./nav");
const { GUIDES } = require("./data");
const TOPICS = require("./topics.json");
const { escapeHtml, amazonProductUrl, productUrl, ratingNumber, icon, slugify } = require("./lib");

const YEAR = 2026;
const num = (p) => Number(String(p.price).replace(/\./g, "").replace(",", "."));
const eur = (p) => `${String(p.price).includes(",") ? p.price : num(p).toFixed(2).replace(".", ",").replace(",00", "")} €`;
const stars = (p) => ratingNumber(p.rating) || 0;
const reviewsTxt = (p) => (p.reviews ? `${Number(p.reviews).toLocaleString("es-ES")} valoraciones` : "");
const topic = (g) => (TOPICS[g.slug] || [g.title.replace(/^Cómo elegir (un |una )?/i, ""), g.title])[0];
const topicOne = (g) => (TOPICS[g.slug] || [null, topic(g)])[1];
const fem = (g) => { const w = topic(g).split(" ")[0].toLowerCase(); if (/ y (accesorios|cubos|protectores)/.test(topic(g))) return false; return /as$/.test(w) || ["luces", "fuentes", "sartenes", "kettlebells", "dash"].includes(w); };
const G = (g, m, f) => (fem(g) ? f : m);
// Género del nombre en singular (topicOne), que puede no coincidir con el plural.
const femOne = (g) => { const w = topicOne(g).split(" ")[0].toLowerCase(); return /a$/.test(w) || ["luz", "fuente", "sartén", "dash", "kettlebell"].includes(w); };
const GS = (g, m, f) => (femOne(g) ? f : m);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const shortName = (t) => {
  const s = String(t).split(/,\s|\s\|\s?|\s[–-]\s|\s?[(\[【]/)[0].replace(/\s+/g, " ").trim();
  let o = (s.length <= 42 ? s : s.slice(0, 42).replace(/\s+\S*$/, "")).split(/,(?=\S)/)[0];
  while (/\s(y|de|del|para|con|el|la|los|las|en|a|sin|e|o)$/i.test(o)) o = o.replace(/\s\S+$/, "");
  return o;
};
const amz = (p, label, cls = "btn btn-accent") =>
  `<a class="${cls}" href="${amazonProductUrl(p.asin)}" target="_blank" rel="nofollow sponsored noopener">${label || "Ver precio en Amazon"} ${icon("arrow")}</a>`;

// Orden de ranking: valoración ponderada por volumen de opiniones (si se
// conoce). Un 4,6 con 3.000 opiniones pesa más que un 5,0 con 12.
function rankScore(p) {
  const r = stars(p);
  const n = Number(p.reviews) || 150;
  return r * 2 + Math.log10(n + 10);
}
const ranked = (g) => [...g.products].filter((p) => !isNaN(num(p))).sort((a, b) => rankScore(b) - rankScore(a));

function scoreOf10(p, list) {
  const max = Math.max(...list.map(rankScore));
  const min = Math.min(...list.map(rankScore));
  const t = max === min ? 1 : (rankScore(p) - min) / (max - min);
  return (7.6 + t * 2.2).toFixed(1).replace(".", ",");
}

function podium(list) {
  const used = new Set();
  const pick = (arr) => { const p = arr.find((x) => !used.has(x.asin)); if (p) used.add(p.asin); return p; };
  const best = pick(list);
  const value = pick([...list].filter((p) => stars(p) >= 4.2).sort((a, b) => (stars(b) - 3.6) / Math.sqrt(num(b)) - (stars(a) - 3.6) / Math.sqrt(num(a))));
  const cheap = pick([...list].filter((p) => stars(p) >= 4.0).sort((a, b) => num(a) - num(b)));
  return [
    best && { label: "Mejor en general", p: best },
    value && { label: "Mejor calidad-precio", p: value },
    cheap && { label: "Más barato que merece la pena", p: cheap },
  ].filter(Boolean);
}

function podiumHtml(items) {
  return `<div class="seo-podium">
    ${items.map(({ label, p }) => `<div class="seo-podium-card">
      <span class="seo-badge">${label}</span>
      <img src="${p.img}" alt="${escapeHtml(p.title)}" width="160" height="160" loading="lazy">
      <p class="seo-podium-title">${escapeHtml(shortName(p.title))}</p>
      <p class="seo-meta">${escapeHtml(p.rating || "")} · <strong>${eur(p)}</strong></p>
      ${amz(p)}
    </div>`).join("\n")}
  </div>`;
}

function rankItem(p, i, list) {
  return `<li class="seo-rank-item" id="p${i + 1}">
    <span class="seo-rank-n">${i + 1}</span>
    <img src="${p.img}" alt="${escapeHtml(p.title)}" width="120" height="120" loading="lazy">
    <div class="seo-rank-body">
      <h3>${escapeHtml(shortName(p.title))}</h3>
      <p class="seo-meta">Nota ${scoreOf10(p, list)}/10 · ${escapeHtml(p.rating || "")}${p.reviews ? ` (${reviewsTxt(p)})` : ""} · desde <strong>${eur(p)}</strong></p>
      ${p.note ? `<p>${escapeHtml(p.note)}</p>` : ""}
      <div class="seo-actions">${amz(p)}<a class="seo-link" href="${productUrl(p)}">Ficha y opinión</a></div>
    </div>
  </li>`;
}

function tableHtml(list) {
  return `<div class="seo-table-wrap"><table class="table seo-table">
    <thead><tr><th>#</th><th>Producto</th><th>Valoración</th><th>Precio</th><th></th></tr></thead>
    <tbody>${list.map((p, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(shortName(p.title))}</td><td>${escapeHtml(p.rating || "—")}</td><td>${eur(p)}</td><td>${amz(p, "Ver", "btn btn-accent btn-sm")}</td></tr>`).join("")}</tbody>
  </table></div>`;
}

function faqHtml(faq) {
  return `<div class="faq">${faq.map((f, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary>${f.q}${icon("chevron", "faq-chevron")}</summary><p>${f.a}</p></details>`).join("")}</div>`;
}

function ld(pathname, title, crumbs, list, faq) {
  const out = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: SITE.domain + (c.href || pathname) })),
    },
  ];
  if (list) out.push({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE.domain + productUrl(p), name: p.title })),
  });
  if (faq && faq.length) out.push({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q.replace(/<[^>]+>/g, ""), acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") } })),
  });
  return out;
}

function hero(eyebrow, title, dek) {
  return `<section class="page-hero"><div class="wrap">
    <p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="hero-dek">${dek}</p>
    <p class="updated">Actualizado en septiembre de ${YEAR} · Precios orientativos, compruébalos en Amazon</p>
  </div></section>`;
}

function rankingPage(g) {
  const list = ranked(g);
  const top = list.slice(0, 10);
  const T = topic(g);
  const pod = podium(list);
  const cheapest = [...list].sort((a, b) => num(a) - num(b))[0];
  const pricey = [...list].sort((a, b) => num(b) - num(a))[0];
  const faq = [
    { q: `¿Cuál es ${GS(g, "el mejor", "la mejor")} ${topicOne(g)} de ${YEAR}?`, a: `Por valoración y volumen de opiniones en Amazon.es, nuestro número 1 ahora mismo es ${escapeHtml(shortName(pod[0].p.title))} (${escapeHtml(pod[0].p.rating)}, desde ${eur(pod[0].p)}).` },
    pod[1] && { q: `¿Qué ${topicOne(g)} tiene mejor relación calidad-precio?`, a: `${escapeHtml(shortName(pod[1].p.title))}: buena nota (${escapeHtml(pod[1].p.rating)}) sin irse de precio (desde ${eur(pod[1].p)}).` },
    { q: `¿Cuánto cuesta ${GS(g, "un buen", "una buena")} ${topicOne(g)}?`, a: `En nuestra selección los precios van de ${eur(cheapest)} a ${eur(pricey)}. Por debajo de la gama media sueles ganar precio pero perder acabados, garantía o funciones.` },
    ...(g.faq || []).slice(0, 3),
  ].filter(Boolean);
  const path = `/mejores/${g.slug}.html`;
  const title = `${/as$|^(luces|fuentes|sartenes|kettlebells|dash)$/.test(topic(g).split(" ")[0].toLowerCase()) ? "Las" : "Los"} ${top.length} mejores ${T} de ${YEAR}`;
  const crumbs = [{ label: "Inicio", href: "/" }, { label: `Top ${YEAR}`, href: "/mejores/" }, { label: cap(T) }];
  const html = `${hero(`Ranking ${YEAR}`, `${title}: ranking calidad-precio`, `Comparamos ${list.length} ${T} con buenas opiniones en Amazon.es y ${G(g, "los", "las")} ordenamos por valoración real y número de compradores. Directo al grano: el podio arriba y el ranking completo debajo.`)}
  <section class="section"><div class="wrap">
    <h2>Resumen rápido: nuestro podio</h2>
    ${podiumHtml(pod)}
    <p class="seo-disclosure">Enlaces de afiliado: si compras a través de ellos ${SITE.name} recibe una pequeña comisión, sin coste extra para ti.</p>
    <h2>Tabla comparativa del top ${top.length}</h2>
    ${tableHtml(top)}
    <h2>Ranking completo de ${T}</h2>
    <ol class="seo-rank">${list.map((p, i) => rankItem(p, i, list)).join("\n")}</ol>
    ${g.checklist ? `<h2>Qué mirar antes de comprar ${T}</h2><ul>${g.checklist.map((c) => `<li>${c}</li>`).join("")}</ul>
    <p>Si quieres el detalle de cada criterio, lee nuestra <a href="/guias/${g.slug}.html">guía para elegir ${T}</a>.</p>` : ""}
    <p>¿Buscas algo económico? Mira los <a href="/mejores/${g.slug}-baratos.html">${T} ${G(g, "baratos", "baratas")} que merecen la pena</a>.</p>
    <h2>Preguntas frecuentes</h2>
    ${faqHtml(faq)}
  </div></section>`;
  return { route: path.slice(1), path, title: `${title} (calidad-precio)`, description: `Ranking ${YEAR} de ${T}: ${G(g, "los", "las")} ${top.length} mejores según valoraciones reales en Amazon.es, con el mejor calidad-precio y el más barato. Precios y opiniones.`, breadcrumbsItems: crumbs, jsonLd: ld(path, title, crumbs, top, faq), excludeCategory: g.slug, html };
}

function budgetPage(g) {
  const list = ranked(g);
  const byPrice = [...list].sort((a, b) => num(a) - num(b));
  const half = byPrice.slice(0, Math.max(4, Math.ceil(byPrice.length / 2)));
  const limit = Math.ceil(num(half[half.length - 1]) / 5) * 5;
  const cheapRanked = half.filter((p) => stars(p) >= 4.0).sort((a, b) => rankScore(b) - rankScore(a));
  const T = topic(g);
  const path = `/mejores/${g.slug}-baratos.html`;
  const title = `${cap(T)} ${G(g, "baratos", "baratas")}: ${G(g, "los", "las")} mejores por menos de ${limit} €`;
  const crumbs = [{ label: "Inicio", href: "/" }, { label: `Top ${YEAR}`, href: "/mejores/" }, { label: `${cap(T)} ${G(g, "baratos", "baratas")}` }];
  const faq = [
    { q: `¿Merece la pena ${GS(g, "un", "una")} ${topicOne(g)} ${GS(g, "barato", "barata")}?`, a: `Sí, si cubre lo básico que necesitas. En esta lista solo entran modelos con 4 estrellas o más en Amazon.es, para evitar las gangas que acaban en devolución.` },
    { q: `¿Cuál es ${GS(g, "el", "la")} ${topicOne(g)} más ${GS(g, "barato", "barata")} recomendable?`, a: `${escapeHtml(shortName(byPrice[0].title))}, desde ${eur(byPrice[0])} con ${escapeHtml(byPrice[0].rating || "buena valoración")}.` },
  ];
  const html = `${hero("Ofertas y gama de entrada", `${title} (${YEAR})`, `Seleccionamos ${G(g, "los", "las")} ${T} más ${G(g, "económicos", "económicas")} de nuestro ranking que mantienen buena valoración. ${G(g, "Todos", "Todas")} por debajo de ${limit} €.`)}
  <section class="section"><div class="wrap">
    ${podiumHtml(podium(cheapRanked))}
    <h2>${G(g, "Los", "Las")} ${cheapRanked.length} mejores ${T} por menos de ${limit} €</h2>
    <ol class="seo-rank">${cheapRanked.map((p, i) => rankItem(p, i, cheapRanked)).join("\n")}</ol>
    <p>¿Puedes estirar el presupuesto? Mira el <a href="/mejores/${g.slug}.html">ranking completo de ${T} de ${YEAR}</a> o la <a href="/guias/${g.slug}.html">guía de compra</a>.</p>
    <h2>Preguntas frecuentes</h2>${faqHtml(faq)}
  </div></section>`;
  return { route: path.slice(1), path, title: `${title} (${YEAR})`, description: `${G(g, "Los", "Las")} mejores ${T} ${G(g, "baratos", "baratas")} de ${YEAR} por menos de ${limit} €, con buenas valoraciones en Amazon.es. Precios y enlaces directos.`, breadcrumbsItems: crumbs, jsonLd: ld(path, title, crumbs, cheapRanked, faq), excludeCategory: g.slug, html };
}

function vsPage(g, a, b) {
  const T = topicOne(g);
  const na = shortName(a.title), nb = shortName(b.title);
  const slug = `${slugify(na).slice(0, 40)}-vs-${slugify(nb).slice(0, 40)}`.replace(/-+/g, "-");
  const path = `/comparativas/${slug}.html`;
  const cheaper = num(a) <= num(b) ? a : b, dearer = cheaper === a ? b : a;
  const better = stars(a) === stars(b) ? ((Number(a.reviews) || 0) >= (Number(b.reviews) || 0) ? a : b) : stars(a) > stars(b) ? a : b;
  const diff = Math.abs(num(a) - num(b));
  const verdict = better === cheaper
    ? `${escapeHtml(shortName(better.title))} gana en las dos cosas que más pesan: sale más barato y tiene mejor valoración. Salvo que necesites algo concreto del otro, es la compra lógica.`
    : `${escapeHtml(shortName(better.title))} tiene mejor valoración, pero cuesta ${diff.toFixed(0)} € más. Si el presupuesto manda, ${escapeHtml(shortName(cheaper.title))} cumple con nota.`;
  const faq = [
    { q: `¿Qué es mejor, ${escapeHtml(na)} o ${escapeHtml(nb)}?`, a: verdict },
    { q: `¿Cuál es más barato?`, a: `${escapeHtml(shortName(cheaper.title))}, desde ${eur(cheaper)}, frente a ${eur(dearer)} del otro (precios orientativos de septiembre de ${YEAR}).` },
  ];
  const row = (l, x, y) => `<tr><td>${l}</td><td>${x}</td><td>${y}</td></tr>`;
  const title = `${na} vs ${nb}`;
  const crumbs = [{ label: "Inicio", href: "/" }, { label: "Guías de compra", href: "/guias/" }, { label: g.title, href: `/guias/${g.slug}.html` }, { label: "Comparativa" }];
  const html = `${hero(`Comparativa · ${cap(topic(g))}`, `${escapeHtml(na)} vs ${escapeHtml(nb)}: ¿cuál comprar?`, `Dos de ${G(g, "los", "las")} ${topic(g)} más ${G(g, "vendidos", "vendidas")} en Amazon.es, cara a cara: precio, valoración y para quién es cada uno.`)}
  <section class="section"><div class="wrap">
    <div class="seo-verdict"><strong>Veredicto rápido:</strong> ${verdict}</div>
    <div class="seo-vs">${[a, b].map((p) => `<div class="seo-podium-card"><img src="${p.img}" alt="${escapeHtml(p.title)}" width="160" height="160" loading="lazy"><p class="seo-podium-title">${escapeHtml(shortName(p.title))}</p><p class="seo-meta">${escapeHtml(p.rating || "")} · <strong>${eur(p)}</strong></p>${amz(p)}</div>`).join('<span class="seo-vs-sep">VS</span>')}</div>
    <div class="seo-table-wrap"><table class="table"><thead><tr><th></th><th>${escapeHtml(na)}</th><th>${escapeHtml(nb)}</th></tr></thead><tbody>
      ${row("Precio orientativo", eur(a), eur(b))}
      ${row("Valoración Amazon", escapeHtml(a.rating || "—"), escapeHtml(b.rating || "—"))}
      ${row("Nº de opiniones", a.reviews ? Number(a.reviews).toLocaleString("es-ES") : "—", b.reviews ? Number(b.reviews).toLocaleString("es-ES") : "—")}
      ${row("Lo más destacado", escapeHtml(a.note || ""), escapeHtml(b.note || ""))}
    </tbody></table></div>
    <h2>¿Para quién es cada uno?</h2>
    <p><strong>${escapeHtml(shortName(cheaper.title))}</strong>: para quien quiere ${GS(g, "un", "una")} ${T} que cumpla sin gastar de más.</p>
    <p><strong>${escapeHtml(shortName(dearer.title))}</strong>: para quien valora ${stars(dearer) >= stars(cheaper) ? "una valoración más alta de los compradores" : "sus prestaciones extra"} y no le importa pagar ${diff.toFixed(0)} € más.</p>
    <p>Si ninguno te convence, revisa el <a href="/mejores/${g.slug}.html">ranking de ${G(g, "los", "las")} mejores ${topic(g)} de ${YEAR}</a>.</p>
    <h2>Preguntas frecuentes</h2>${faqHtml(faq)}
  </div></section>`;
  return { route: path.slice(1), path, title: `${title}: ¿cuál es mejor? (${YEAR})`, description: `Comparativa ${na} vs ${nb}: precio, valoraciones y veredicto claro para elegir ${GS(g, "el mejor", "la mejor")} ${T} en ${YEAR}.`, breadcrumbsItems: crumbs, jsonLd: ld(path, title, crumbs, [a, b], faq), excludeCategory: g.slug, html };
}

// Duelos: los dos más vendidos (por nº de opiniones) de cada guía y el
// nº 1 del ranking contra el más barato bien valorado.
function vsPages(g) {
  const list = ranked(g);
  const byReviews = list.filter((p) => p.reviews).sort((a, b) => b.reviews - a.reviews);
  const pairs = [];
  if (byReviews.length >= 2) pairs.push([byReviews[0], byReviews[1]]);
  const cheap = [...list].filter((p) => stars(p) >= 4.2).sort((a, b) => num(a) - num(b))[0];
  if (cheap && list[0] && cheap.asin !== list[0].asin) pairs.push([list[0], cheap]);
  if (byReviews.length >= 4) pairs.push([byReviews[2], byReviews[3]]);
  const seen = new Set();
  return pairs.filter(([a, b]) => { const k = [a.asin, b.asin].sort().join(); if (seen.has(k) || a.asin === b.asin) return false; seen.add(k); return true; }).map(([a, b]) => vsPage(g, a, b));
}

function indexPage(vs) {
  const path = "/mejores/";
  const crumbs = [{ label: "Inicio", href: "/" }, { label: `Top ${YEAR}` }];
  const html = `${hero(`Rankings ${YEAR}`, `Los mejores productos de ${YEAR} según ${SITE.name}`, "Rankings por categoría ordenados por valoración real y número de compradores en Amazon.es, más selecciones baratas y comparativas cara a cara.")}
  <section class="section"><div class="wrap">
    <div class="seo-index">${GUIDES.map((g) => { const top = ranked(g)[0]; return `<div class="seo-index-card">
      ${top ? `<img src="${top.img}" alt="${escapeHtml(topic(g))}" width="120" height="120" loading="lazy">` : ""}
      <div><h2><a href="/mejores/${g.slug}.html">Mejores ${topic(g)} ${YEAR}</a></h2>
      ${top ? `<p class="seo-meta">Nº 1: ${escapeHtml(shortName(top.title))} · ${eur(top)}</p>` : ""}
      <p><a href="/mejores/${g.slug}-baratos.html">${G(g, "Baratos", "Baratas")}</a> · <a href="/guias/${g.slug}.html">Guía de compra</a></p></div>
    </div>`; }).join("\n")}</div>
    <h2>Comparativas cara a cara</h2>
    <ul class="seo-vs-list">${vs.map((p) => `<li><a href="${p.path}">${p.title.replace(/: ¿cuál es mejor\? \(\d+\)$/, "")}</a></li>`).join("")}</ul>
  </div></section>`;
  return { route: "mejores/index.html", path, title: `Mejores productos ${YEAR}: rankings y comparativas`, description: `Rankings ${YEAR} de ${SITE.name}: los mejores productos por categoría según opiniones reales en Amazon.es, versiones baratas y comparativas.`, breadcrumbsItems: crumbs, jsonLd: ld(path, "Top", crumbs), html };
}

// Banner que se inserta en cada guía enlazando a su ranking.
function guideBanner(g) {
  const top = ranked(g)[0];
  if (!top) return "";
  return `<section class="section seo-guide-banner"><div class="wrap"><div class="seo-verdict">
    <strong>¿Sin tiempo?</strong> El más recomendado ahora mismo es <strong>${escapeHtml(shortName(top.title))}</strong> (${escapeHtml(top.rating || "")}, desde ${eur(top)}).
    ${amz(top)} <a class="seo-link" href="/mejores/${g.slug}.html">Ver el top ${Math.min(10, g.products.length)} de ${YEAR}</a>
  </div></div></section>`;
}

function seoPages() {
  const vs = GUIDES.flatMap(vsPages);
  return [indexPage(vs), ...GUIDES.map(rankingPage), ...GUIDES.map(budgetPage), ...vs];
}

module.exports = { seoPages, guideBanner, ranked, topic };
