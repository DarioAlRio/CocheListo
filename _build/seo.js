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
const { escapeHtml, amazonProductUrl, productUrl, ratingNumber, icon, slugify, priceTier } = require("./lib");

const YEAR = 2026;
const num = (p) => { const s = String(p.price); return Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s); };
const eur = (p) => `${String(p.price).includes(",") ? p.price : num(p).toFixed(2).replace(".", ",").replace(",00", "")} €`;
const stars = (p) => ratingNumber(p.rating) || 0;
// Sin precios en el HTML (normas de Amazon: solo se permiten vía PA-API y
// actualizados). En su lugar, la gama de precio dentro de su propia guía.
const tierOf = (p) => { const g = GUIDES.find((x) => x.products.some((y) => y.asin === p.asin)); return (g && priceTier(p, g.products)) || ""; };
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
      <img src="${p.img}" alt="${escapeHtml(shortName(p.title))}" width="160" height="160" loading="lazy">
      <p class="seo-podium-title">${escapeHtml(shortName(p.title))}</p>
      <p class="seo-meta">${escapeHtml(p.rating || "")} · ${tierOf(p)}</p>
      ${amz(p)}
    </div>`).join("\n")}
  </div>`;
}

function rankItem(p, i, list) {
  return `<li class="seo-rank-item" id="p${i + 1}">
    <span class="seo-rank-n">${i + 1}</span>
    <img src="${p.img}" alt="${escapeHtml(shortName(p.title))}" width="120" height="120" loading="lazy">
    <div class="seo-rank-body">
      <h3>${escapeHtml(shortName(p.title))}</h3>
      <p class="seo-meta">Nota ${scoreOf10(p, list)}/10 · ${escapeHtml(p.rating || "")}${p.reviews ? ` (${reviewsTxt(p)})` : ""} · ${tierOf(p)}</p>
      ${p.note ? `<p>${escapeHtml(p.note)}</p>` : ""}
      <div class="seo-actions">${amz(p)}<a class="seo-link" href="${productUrl(p)}">Ficha y opinión</a></div>
    </div>
  </li>`;
}

function tableHtml(list) {
  return `<div class="seo-table-wrap"><table class="table seo-table">
    <thead><tr><th>#</th><th>Producto</th><th>Valoración</th><th>Gama</th><th></th></tr></thead>
    <tbody>${list.map((p, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(shortName(p.title))}</td><td>${escapeHtml(p.rating || "—")}</td><td>${tierOf(p)}</td><td>${amz(p, "Ver precio", "btn btn-accent btn-sm")}</td></tr>`).join("")}</tbody>
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
    <p class="updated">Actualizado en septiembre de ${YEAR} · Consulta el precio actual en Amazon</p>
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
    { q: `¿Cuál es ${GS(g, "el mejor", "la mejor")} ${topicOne(g)} de ${YEAR}?`, a: `Por valoración y volumen de opiniones en Amazon.es, nuestro número 1 ahora mismo es ${escapeHtml(shortName(pod[0].p.title))} (${escapeHtml(pod[0].p.rating)}).` },
    pod[1] && { q: `¿Qué ${topicOne(g)} tiene mejor relación calidad-precio?`, a: `${escapeHtml(shortName(pod[1].p.title))}: buena nota (${escapeHtml(pod[1].p.rating)}) sin irse de precio.` },
    { q: `¿Cuánto cuesta ${GS(g, "un buen", "una buena")} ${topicOne(g)}?`, a: `En nuestra selección hay opciones desde la gama de entrada (${escapeHtml(shortName(cheapest.title))}) hasta la gama alta (${escapeHtml(shortName(pricey.title))}); el precio exacto cambia a menudo, así que consúltalo en Amazon. Por debajo de la gama media sueles ganar precio pero perder acabados, garantía o funciones.` },
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
  return { route: path.slice(1), path, title: `${title} (calidad-precio)`, description: `Ranking ${YEAR} de ${T}: ${G(g, "los", "las")} ${top.length} mejores según valoraciones reales en Amazon.es, con el mejor calidad-precio y el más barato. Opiniones reales.`, breadcrumbsItems: crumbs, jsonLd: ld(path, title, crumbs, top, faq), excludeCategory: g.slug, html };
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
    { q: `¿Cuál es ${GS(g, "el", "la")} ${topicOne(g)} más ${GS(g, "barato", "barata")} recomendable?`, a: `${escapeHtml(shortName(byPrice[0].title))}, con ${escapeHtml(byPrice[0].rating || "buena valoración")}.` },
  ];
  const html = `${hero("Ofertas y gama de entrada", `${title} (${YEAR})`, `Seleccionamos ${G(g, "los", "las")} ${T} más ${G(g, "económicos", "económicas")} de nuestro ranking que mantienen buena valoración. ${G(g, "Todos", "Todas")} por debajo de ${limit} €.`)}
  <section class="section"><div class="wrap">
    ${podiumHtml(podium(cheapRanked))}
    <h2>${G(g, "Los", "Las")} ${cheapRanked.length} mejores ${T} por menos de ${limit} €</h2>
    <ol class="seo-rank">${cheapRanked.map((p, i) => rankItem(p, i, cheapRanked)).join("\n")}</ol>
    <p>¿Puedes estirar el presupuesto? Mira el <a href="/mejores/${g.slug}.html">ranking completo de ${T} de ${YEAR}</a> o la <a href="/guias/${g.slug}.html">guía de compra</a>.</p>
    <h2>Preguntas frecuentes</h2>${faqHtml(faq)}
  </div></section>`;
  return { route: path.slice(1), path, title: `${title} (${YEAR})`, description: `${G(g, "Los", "Las")} mejores ${T} ${G(g, "baratos", "baratas")} de ${YEAR} por menos de ${limit} €, con buenas valoraciones en Amazon.es. Opiniones y enlaces directos.`, breadcrumbsItems: crumbs, jsonLd: ld(path, title, crumbs, cheapRanked, faq), excludeCategory: g.slug, html };
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
    : `${escapeHtml(shortName(better.title))} tiene mejor valoración, pero es más caro. Si el presupuesto manda, ${escapeHtml(shortName(cheaper.title))} cumple con nota.`;
  const faq = [
    { q: `¿Qué es mejor, ${escapeHtml(na)} o ${escapeHtml(nb)}?`, a: verdict },
    { q: `¿Cuál es más barato?`, a: `Normalmente ${escapeHtml(shortName(cheaper.title))}, que está en una gama de precio más baja. El precio cambia a menudo: compruébalo en Amazon antes de decidir.` },
  ];
  const row = (l, x, y) => `<tr><td>${l}</td><td>${x}</td><td>${y}</td></tr>`;
  const title = `${na} vs ${nb}`;
  const crumbs = [{ label: "Inicio", href: "/" }, { label: "Guías de compra", href: "/guias/" }, { label: g.title, href: `/guias/${g.slug}.html` }, { label: "Comparativa" }];
  const html = `${hero(`Comparativa · ${cap(topic(g))}`, `${escapeHtml(na)} vs ${escapeHtml(nb)}: ¿cuál comprar?`, `Dos de ${G(g, "los", "las")} ${topic(g)} más ${G(g, "vendidos", "vendidas")} en Amazon.es, cara a cara: valoración, gama de precio y para quién es cada uno.`)}
  <section class="section"><div class="wrap">
    <div class="seo-verdict"><strong>Veredicto rápido:</strong> ${verdict}</div>
    <div class="seo-vs">${[a, b].map((p) => `<div class="seo-podium-card"><img src="${p.img}" alt="${escapeHtml(shortName(p.title))}" width="160" height="160" loading="lazy"><p class="seo-podium-title">${escapeHtml(shortName(p.title))}</p><p class="seo-meta">${escapeHtml(p.rating || "")} · ${tierOf(p)}</p>${amz(p)}</div>`).join('<span class="seo-vs-sep">VS</span>')}</div>
    <div class="seo-table-wrap"><table class="table"><thead><tr><th></th><th>${escapeHtml(na)}</th><th>${escapeHtml(nb)}</th></tr></thead><tbody>
      ${row("Gama de precio", tierOf(a) || "—", tierOf(b) || "—")}
      ${row("Valoración Amazon", escapeHtml(a.rating || "—"), escapeHtml(b.rating || "—"))}
      ${row("Nº de opiniones", a.reviews ? Number(a.reviews).toLocaleString("es-ES") : "—", b.reviews ? Number(b.reviews).toLocaleString("es-ES") : "—")}
      ${row("Lo más destacado", escapeHtml(a.note || ""), escapeHtml(b.note || ""))}
    </tbody></table></div>
    <h2>¿Para quién es cada uno?</h2>
    <p><strong>${escapeHtml(shortName(cheaper.title))}</strong>: para quien quiere ${GS(g, "un", "una")} ${T} que cumpla sin gastar de más.</p>
    <p><strong>${escapeHtml(shortName(dearer.title))}</strong>: para quien valora ${stars(dearer) >= stars(cheaper) ? "una valoración más alta de los compradores" : "sus prestaciones extra"} y no le importa pagar algo más.</p>
    <p>Si ninguno te convence, revisa el <a href="/mejores/${g.slug}.html">ranking de ${G(g, "los", "las")} mejores ${topic(g)} de ${YEAR}</a>.</p>
    <h2>Cómo leer esta comparativa</h2>
    <p>La valoración de Amazon resume la experiencia de miles de compradores, pero no sustituye a tus necesidades: un modelo con media estrella menos puede ser mejor compra si encaja justo con lo que buscas. Mira también el número de opiniones: una nota alta con pocas reseñas es menos fiable que una algo más baja respaldada por miles.</p>
    ${g.checklist && g.checklist.length ? `<h2>Qué comprobar antes de decidirte</h2>
    <ul>${g.checklist.map((c) => `<li>${c}</li>`).join("")}</ul>
    <p>Lo explicamos con detalle en la <a href="/guias/${g.slug}.html">guía para elegir ${topic(g)}</a>.</p>` : ""}
    <h2>Preguntas frecuentes</h2>${faqHtml([...faq, ...(g.faq || []).slice(0, 2)])}
  </div></section>`;
  return { route: path.slice(1), path, title: `${title}: ¿cuál es mejor? (${YEAR})`, description: `Comparativa ${na} vs ${nb}: valoraciones, gama y veredicto claro para elegir ${GS(g, "el mejor", "la mejor")} ${T} en ${YEAR}.`, breadcrumbsItems: crumbs, jsonLd: ld(path, title, crumbs, [a, b], faq), excludeCategory: g.slug, html };
}

// --- Páginas de alta intención de compra ------------------------------------

const INTENTS = require("./intents.json");
const plain = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Barra fija inferior: el producto recomendado de la página, a un clic.
function sticky(p) {
  if (!p) return "";
  return `<div class="seo-sticky-space"></div><div class="seo-sticky" role="complementary" aria-label="Producto recomendado">
    <img src="${p.img}" alt="" width="44" height="44" loading="lazy">
    <span class="seo-sticky-txt"><strong>${escapeHtml(shortName(p.title))}</strong> ${escapeHtml(p.rating || "")}</span>
    ${amz(p, "Ver en Amazon")}
  </div>`;
}

// Enlaces internos entre todas las páginas de una categoría.
const RELATED = new Map();
function relatedHtml(g, self) {
  const l = (RELATED.get(g.slug) || []).filter((x) => x.path !== self);
  if (!l.length) return "";
  return `<div class="seo-related"><h2>Más selecciones de ${topic(g)}</h2><ul>${l.map((x) => `<li><a href="${x.path}">${escapeHtml(x.label)}</a></li>`).join("")}</ul></div>`;
}

// Página de lista genérica (intención, precio, marca).
function listPage(g, list, o) {
  const T = topic(g);
  const crumbs = [{ label: "Inicio", href: "/" }, { label: `Top ${YEAR}`, href: "/mejores/" }, { label: cap(T), href: `/mejores/${g.slug}.html` }, { label: o.crumb }];
  const cheapest = [...list].sort((a, b) => num(a) - num(b))[0];
  const faq = [
    { q: `¿Cuál es ${o.bestQ}?`, a: `Ahora mismo, ${escapeHtml(shortName(list[0].title))} (${escapeHtml(list[0].rating || "")}), por valoración y número de opiniones en Amazon.es.` },
    cheapest.asin !== list[0].asin && { q: `¿Hay alguna opción más económica?`, a: `${escapeHtml(shortName(cheapest.title))}, en una gama de precio más baja y con ${escapeHtml(cheapest.rating || "buena valoración")}.` },
  ].filter(Boolean);
  const html = `${hero(o.eyebrow, o.h1, o.dek)}
  <section class="section"><div class="wrap">
    ${list.length >= 3 ? `<h2>Resumen rápido</h2>${podiumHtml(podium(list))}` : ""}
    <p class="seo-disclosure">Enlaces de afiliado: si compras a través de ellos ${SITE.name} recibe una pequeña comisión, sin coste extra para ti.</p>
    <h2>${o.listH2}</h2>
    <ol class="seo-rank">${list.map((p, i) => rankItem(p, i, list)).join("\n")}</ol>
    ${relatedHtml(g, o.path)}
    <h2>Preguntas frecuentes</h2>${faqHtml(faq)}
  </div></section>${sticky(list[0])}`;
  return { route: o.path.slice(1), path: o.path, title: o.title, description: o.desc, breadcrumbsItems: crumbs, jsonLd: ld(o.path, o.h1, crumbs, list.slice(0, 10), faq), excludeCategory: g.slug, html, asins: list.map((p) => p.asin) };
}

function intentPages(g) {
  const list = ranked(g);
  const T = topic(g), one = topicOne(g);
  return (INTENTS[g.slug] || []).map((it) => {
    const re = new RegExp(it.re);
    const sub = list.filter((p) => re.test(plain(p.title)) && stars(p) >= 4.0);
    if (sub.length < 3) return null;
    const path = `/mejores/${g.slug}-${it.s}.html`;
    // it.n: nombre completo cuando la intención es un tipo de producto ("sandwicheras").
    const P = it.n || `${T} ${it.l}`;
    const w = plain(P.split(" ")[0]);
    const f = it.n ? /as$/.test(w) || ["luces", "fuentes"].includes(w) : fem(g);
    return listPage(g, sub, {
      path, crumb: cap(it.n || it.l), eyebrow: `Selección ${YEAR}`,
      h1: `${f ? "Las" : "Los"} mejores ${P} de ${YEAR}`,
      title: `Mejores ${P} (${YEAR}): top ${Math.min(sub.length, 10)} y opiniones`,
      desc: it.n
        ? `${cap(P)} ${YEAR}: comparamos ${sub.length} modelos con buenas opiniones en Amazon.es, con el mejor, el más barato y opiniones reales.`
        : `¿Buscas ${GS(g, "un", "una")} ${one} ${it.l}? Comparamos ${sub.length} modelos con buenas opiniones en Amazon.es: ${GS(g, "el mejor", "la mejor")}, el más barato y opiniones reales.`,
      dek: `Solo ${P}, ${f ? "ordenadas" : "ordenados"} por valoración real y número de compradores en Amazon.es. Elige y consulta el precio actual en Amazon.`,
      listH2: `${sub.length} ${P} ${f ? "ordenadas" : "ordenados"} por valoración`,
      bestQ: it.n ? `la mejor opción en ${P}` : `${GS(g, "el mejor", "la mejor")} ${one} ${it.l}`,
    });
  }).filter(Boolean);
}

const PRICE_STEPS = [15, 20, 25, 30, 40, 50, 60, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];
function pricePages(g) {
  const list = ranked(g);
  const T = topic(g), one = topicOne(g);
  const out = [];
  let lastCount = -1;
  for (const t of PRICE_STEPS) {
    const sub = list.filter((p) => num(p) <= t && stars(p) >= 4.0);
    if (sub.length < 3 || sub.length > list.length - 3 || (lastCount > 0 && sub.length < Math.max(lastCount + 3, Math.ceil(lastCount * 1.5)))) continue;
    lastCount = sub.length;
    out.push(listPage(g, sub, {
      path: `/mejores/${g.slug}-menos-de-${t}-euros.html`, crumb: `Menos de ${t} €`, eyebrow: "Por presupuesto",
      h1: `Mejores ${T} por menos de ${t} € (${YEAR})`,
      title: `Mejores ${T} por menos de ${t} € en ${YEAR}`,
      desc: `${cap(T)} por menos de ${t} euros: ${sub.length} modelos con 4 estrellas o más en Amazon.es, ordenados por opiniones. ${GS(g, "El mejor", "La mejor")} para tu presupuesto.`,
      dek: `Tienes ${t} € de presupuesto: estos son ${G(g, "los", "las")} ${T} que merecen la pena sin pasarte.`,
      listH2: `${sub.length} ${T} por debajo de ${t} €`,
      bestQ: `${GS(g, "el mejor", "la mejor")} ${one} por menos de ${t} €`,
    }));
    if (out.length >= 4) break;
  }
  return out;
}

// Marca = primera palabra del título, si se repite y no es un nombre común.
const NOT_BRAND = new Set("aspiradora aspirador aspiradoras robot robots camara camaras juego juegos set pack kit mini soporte soportes organizador organizadores trona tronas cuna silla sillas mochila bascula termometro higrometro comedero fuente cama transportin arenero rascador arbol juguete juguetes localizador correa arnes arneses collar mopa fregona cubo limpiador limpiadora guantes guante bayetas panos cepillo cargador cargadores funda fundas protector alfombrillas alfombrilla ambientador purificador arrancador luz luces baliza freidora cafetera batidora licuadora sarten sartenes bateria olla recipientes botes cuchillo cuchillos mancuernas esterilla bandas gomas banco comba cuerda kettlebell pesa rodillo foam escritorio mesa monitor teclado lampara flexo bandeja auriculares cascos reposapies timbre videoportero cerradura sensor detector alarma enchufe the la el las los de".split(" "));
const brandOf = (p) => { const w = String(p.title).split(/[\s,|\-–]+/)[0].replace(/[®™©]/g, ""); return /^[A-Za-zÀ-ÿ][\w&'.À-ÿ]+$/.test(w) && !NOT_BRAND.has(plain(w)) ? w : null; };
function brandGroups(g) {
  const m = new Map();
  for (const p of ranked(g)) { const b = brandOf(p); if (!b) continue; const k = plain(b); if (!m.has(k)) m.set(k, { name: b, list: [] }); m.get(k).list.push(p); }
  return [...m.values()].filter((x) => x.list.length >= 2).sort((a, b) => b.list.length - a.list.length);
}
function brandPages(g) {
  const T = topic(g), one = topicOne(g);
  const intentRes = (INTENTS[g.slug] || []).map((i) => i.re);
  return brandGroups(g).filter((b) => b.list.length >= 3 && !intentRes.some((r) => new RegExp(r).test(plain(b.name)))).map((b) => listPage(g, b.list, {
    path: `/mejores/${g.slug}-marca-${slugify(b.name)}.html`, crumb: `Marca ${b.name}`, eyebrow: `Marca · ${b.name}`,
    h1: `${G(g, "Los", "Las")} mejores ${T} ${b.name} de ${YEAR}`,
    title: `Mejores ${T} ${b.name} (${YEAR}): modelos y opiniones`,
    desc: `¿Qué ${one} ${b.name} comprar? Comparamos ${b.list.length} modelos de ${b.name} por valoración y opiniones en Amazon.es.`,
    dek: `Todos los modelos de ${b.name} de nuestra selección, ordenados por valoración real de compradores.`,
    listH2: `${b.list.length} ${T} de ${b.name}`,
    bestQ: `${GS(g, "el mejor", "la mejor")} ${one} ${b.name}`,
  }));
}
function brandVsPages(g) {
  const T = topic(g), one = topicOne(g);
  const bs = brandGroups(g).slice(0, 3);
  const out = [];
  const avg = (l) => l.reduce((s, p) => s + stars(p), 0) / l.length;
  const avgP = (l) => l.reduce((s, p) => s + num(p), 0) / l.length;
  const f1 = (x) => x.toFixed(1).replace(".", ",");
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
    const [a, b] = [bs[i], bs[j]];
    const path = `/comparativas/${g.slug}-${slugify(a.name)}-vs-${slugify(b.name)}.html`;
    const best = avg(a.list) >= avg(b.list) ? a : b, cheap = avgP(a.list) <= avgP(b.list) ? a : b;
    const verdict = best === cheap
      ? `${best.name} gana en valoración media (${f1(avg(best.list))}★) y además sale más a cuenta de media. Es la opción más segura.`
      : `${best.name} tiene mejor valoración media (${f1(avg(best.list))}★); ${cheap.name} suele ser más económica.`;
    const col = (x) => `<div><h3>${escapeHtml(x.name)}</h3><p class="seo-meta">Valoración media ${f1(avg(x.list))}★ · ${x.list.length} modelos</p><ol class="seo-rank">${x.list.slice(0, 3).map((p, k) => rankItem(p, k, x.list)).join("")}</ol></div>`;
    const crumbs = [{ label: "Inicio", href: "/" }, { label: `Top ${YEAR}`, href: "/mejores/" }, { label: cap(T), href: `/mejores/${g.slug}.html` }, { label: `${a.name} vs ${b.name}` }];
    const faq = [{ q: `¿Qué marca es mejor, ${a.name} o ${b.name}?`, a: verdict }];
    const h1 = `${a.name} o ${b.name}: ¿qué ${one} comprar en ${YEAR}?`;
    out.push({
      route: path.slice(1), path, title: `${a.name} vs ${b.name}: ¿qué ${one} es mejor? (${YEAR})`,
      description: `${cap(T)} ${a.name} contra ${b.name}: valoración media y los mejores modelos de cada marca. Veredicto claro.`,
      breadcrumbsItems: crumbs, jsonLd: ld(path, h1, crumbs, [...a.list.slice(0, 3), ...b.list.slice(0, 3)], faq), excludeCategory: g.slug,
      html: `${hero(`Marca contra marca · ${cap(T)}`, h1, `Comparamos los modelos de ${a.name} y ${b.name} de nuestra selección: qué marca tiene mejores opiniones y cuál sale más a cuenta.`)}
  <section class="section"><div class="wrap">
    <div class="seo-verdict"><strong>Veredicto rápido:</strong> ${verdict}</div>
    <h2>Los mejores modelos de cada marca</h2>
    <div class="seo-brand-vs">${col(a)}${col(b)}</div>
    ${relatedHtml(g, path)}
    <h2>Preguntas frecuentes</h2>${faqHtml(faq)}
  </div></section>${sticky(best.list[0])}`,
    });
  }
  return out;
}

// Duelos: los que ya existían (mismas URLs) más todos los pares del top 6.
const VS_SEEN = new Set();
function vsPages(g) {
  const list = ranked(g);
  const byReviews = list.filter((p) => p.reviews).sort((a, b) => b.reviews - a.reviews);
  const pairs = [];
  if (byReviews.length >= 2) pairs.push([byReviews[0], byReviews[1]]);
  const cheap = [...list].filter((p) => stars(p) >= 4.2).sort((a, b) => num(a) - num(b))[0];
  if (cheap && list[0] && cheap.asin !== list[0].asin) pairs.push([list[0], cheap]);
  if (byReviews.length >= 4) pairs.push([byReviews[2], byReviews[3]]);
  // El n.º 1 frente a sus dos rivales directos. No se generan todos los pares
  // del top: eran páginas casi idénticas entre sí (contenido duplicado).
  if (list.length >= 3) pairs.push([list[0], list[1]], [list[0], list[2]]);
  // VS_SEEN es global: un mismo producto puede estar en dos guías y no debe
  // generar dos veces el mismo duelo (ni en orden inverso).
  return pairs
    .filter(([a, b]) => { const k = [a.asin, b.asin].sort().join(); if (VS_SEEN.has(k) || a.asin === b.asin || shortName(a.title) === shortName(b.title)) return false; VS_SEEN.add(k); return true; })
    .map(([a, b]) => { const p = vsPage(g, a, b); const better = stars(a) >= stars(b) ? a : b; p.html += sticky(better); return p; });
}

function indexPage(vs) {
  const path = "/mejores/";
  const crumbs = [{ label: "Inicio", href: "/" }, { label: `Top ${YEAR}` }];
  const html = `${hero(`Rankings ${YEAR}`, `Los mejores productos de ${YEAR} según ${SITE.name}`, "Rankings por categoría, por presupuesto, por uso y por marca, ordenados por valoración real y número de compradores en Amazon.es.")}
  <section class="section"><div class="wrap">
    <div class="seo-index">${GUIDES.map((g) => { const top = ranked(g)[0]; const sub = (RELATED.get(g.slug) || []).slice(2); return `<div class="seo-index-card">
      ${top ? `<img src="${top.img}" alt="${escapeHtml(topic(g))}" width="120" height="120" loading="lazy">` : ""}
      <div><h2><a href="/mejores/${g.slug}.html">Mejores ${topic(g)} ${YEAR}</a></h2>
      ${top ? `<p class="seo-meta">Nº 1: ${escapeHtml(shortName(top.title))} · <a href="${amazonProductUrl(top.asin)}" target="_blank" rel="nofollow sponsored noopener">Ver en Amazon</a></p>` : ""}
      <p><a href="/mejores/${g.slug}-baratos.html">${G(g, "Baratos", "Baratas")}</a> · <a href="/guias/${g.slug}.html">Guía de compra</a></p>
      ${sub.length ? `<details><summary>${sub.length} selecciones más</summary><ul>${sub.map((x) => `<li><a href="${x.path}">${escapeHtml(x.label)}</a></li>`).join("")}</ul></details>` : ""}</div>
    </div>`; }).join("\n")}</div>
    <h2>Comparativas cara a cara</h2>
    <ul class="seo-vs-list">${vs.map((p) => `<li><a href="${p.path}">${escapeHtml(p.title.replace(/: ¿.*$/, ""))}</a></li>`).join("")}</ul>
  </div></section>`;
  return { route: "mejores/index.html", path, title: `Mejores productos ${YEAR}: rankings y comparativas`, description: `Rankings ${YEAR} de ${SITE.name}: los mejores productos por categoría, presupuesto, uso y marca según opiniones reales en Amazon.es.`, breadcrumbsItems: crumbs, jsonLd: ld(path, "Top", crumbs), html };
}

// Banner que se inserta en cada guía: nº 1 con botón directo y accesos a todas las selecciones.
function guideBanner(g) {
  seoPages();
  const top = ranked(g)[0];
  if (!top) return "";
  const sub = (RELATED.get(g.slug) || []).slice(1, 10);
  return `<section class="section seo-guide-banner"><div class="wrap"><div class="seo-verdict">
    <strong>¿Sin tiempo?</strong> El más recomendado ahora mismo es <strong>${escapeHtml(shortName(top.title))}</strong> (${escapeHtml(top.rating || "")}).
    ${amz(top)} <a class="seo-link" href="/mejores/${g.slug}.html">Ver el top ${Math.min(10, g.products.length)} de ${YEAR}</a>
  </div>${sub.length ? `<p class="seo-chips">${sub.map((x) => `<a href="${x.path}">${escapeHtml(x.label)}</a>`).join("")}</p>` : ""}</div></section>${sticky(top)}`;
}

const jac = (a, b) => { const s = new Set(a); const i = b.filter((x) => s.has(x)).length; return i / (s.size + b.length - i || 1); };
function catPages(g) {
  const all = ranked(g).map((p) => p.asin);
  const byPrice = [...ranked(g)].sort((a, b) => num(a) - num(b));
  const cheap = byPrice.slice(0, Math.max(4, Math.ceil(byPrice.length / 2))).filter((p) => stars(p) >= 4.0).map((p) => p.asin);
  const kept = [all, cheap];
  return [...intentPages(g), ...pricePages(g), ...brandPages(g)].filter((p) => {
    if (kept.some((k) => jac(k, p.asins) >= 0.6)) return false;
    kept.push(p.asins);
    return true;
  });
}

let CACHE = null;
function seoPages() {
  if (CACHE) return CACHE;
  // 1.ª pasada: saber qué páginas existen para rellenar los enlaces cruzados.
  for (const g of GUIDES) {
    const subs = [...catPages(g), ...brandVsPages(g)];
    RELATED.set(g.slug, [
      { path: `/mejores/${g.slug}.html`, label: `Top 10 ${topic(g)} ${YEAR}` },
      { path: `/mejores/${g.slug}-baratos.html`, label: `${cap(topic(g))} ${G(g, "baratos", "baratas")}` },
      ...subs.map((p) => ({ path: p.path, label: p.breadcrumbsItems[p.breadcrumbsItems.length - 1].label })),
    ]);
  }
  // 2.ª pasada: ya con RELATED completo.
  const subs = GUIDES.flatMap((g) => [...catPages(g), ...brandVsPages(g)]);
  const routes = new Set();
  const vs = GUIDES.flatMap(vsPages).filter((p) => !routes.has(p.route) && routes.add(p.route));
  const withExtras = (p, g) => { p.html = p.html.replace("<h2>Preguntas frecuentes</h2>", relatedHtml(g, p.path) + "<h2>Preguntas frecuentes</h2>") + sticky(ranked(g)[0]); return p; };
  CACHE = [
    indexPage(vs),
    ...GUIDES.map((g) => withExtras(rankingPage(g), g)),
    ...GUIDES.map((g) => withExtras(budgetPage(g), g)),
    ...subs,
    ...vs,
  ];
  return CACHE;
}

module.exports = { seoPages, guideBanner, ranked, topic };
