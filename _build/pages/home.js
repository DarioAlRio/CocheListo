"use strict";

const { SITE } = require("../nav");
const { GUIDES, ARTICLES, FEATURED } = require("../data");
const { icon, escapeHtml, guideCard, articleCard, productUrl, ratingNumber } = require("../lib");
const { pageHero, ctaBand } = require("../layout");

// Las 4 tarjetas del hero muestran una foto real de producto (no un icono
// decorativo): las 4 categorías más buscadas, sin las 6 restantes porque el
// hero solo tiene sitio para 4 tarjetas.
const HERO_LABELS = {
  "camaras-de-conduccion-dash-cams": "Dash cam",
  "cargadores-de-coche-usb": "Cargador USB",
  "soportes-de-movil-para-coche": "Soporte móvil",
  "cables-y-arrancadores-de-bateria": "Arrancador batería",
};

function home() {
  const featuredGuides = GUIDES.slice(0, 4).map(guideCard).join("\n");
  const featuredArticles = ARTICLES.slice(0, 3).map(articleCard).join("\n");
  const heroProducts = Object.keys(HERO_LABELS)
    .map((slug) => FEATURED.find((p) => p.category === slug))
    .filter(Boolean);

  const allProducts = GUIDES.flatMap((g) => g.products);
  const ratings = allProducts.map((p) => ratingNumber(p.rating)).filter((n) => n !== null);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const stats = [
    { num: allProducts.length, label: "Productos analizados" },
    { num: GUIDES.length, label: "Guías de compra" },
    { num: ARTICLES.length, label: "Artículos del blog" },
    ...(avgRating ? [{ num: `${avgRating.toFixed(1)}★`, label: "Valoración media en Amazon" }] : []),
  ];

  const html = `
  <section class="hero">
    <div class="wrap hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">Guías de compra independientes</p>
        <h1>${SITE.claim}</h1>
        <p class="hero-dek">
          Comparamos criterios, no marcas: qué mirar antes de comprar una dash cam, un
          cargador de coche, un arrancador de batería o un organizador de maletero, explicado
          sin tecnicismos y sin recomendaciones pagadas por ninguna marca.
        </p>
        <div class="hero-actions">
          <a class="btn btn-accent" href="/guias/">Ver guías de compra ${icon("arrow")}</a>
          <a class="btn btn-ghost" href="/blog/">Leer el blog</a>
        </div>
      </div>
      <div class="hero-art">
        ${heroProducts
          .map(
            (p) => `<a class="hero-art-card" href="${productUrl(p)}">
          <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" width="140" height="140">
          <span>${HERO_LABELS[p.category]}</span>
        </a>`
          )
          .join("\n")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="stats-bar">
        ${stats.map((s) => `<div><span class="stat-num">${s.num}</span><span class="stat-label">${s.label}</span></div>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Empieza por aquí</p>
        <h2>Guías por tipo de producto</h2>
      </div>
      <div class="card-grid">
        ${featuredGuides}
      </div>
      <a class="see-all" href="/guias/">Ver todas las guías ${icon("arrow")}</a>
    </div>
  </section>

  <section class="section section-alt">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Del blog</p>
        <h2>Artículos recientes</h2>
      </div>
      <div class="card-grid">
        ${featuredArticles}
      </div>
      <a class="see-all" href="/blog/">Ver todo el blog ${icon("arrow")}</a>
    </div>
  </section>

  <section class="section trust-section">
    <div class="wrap trust-grid">
      <div>
        <h2>¿Por qué esta web?</h2>
        <p>
          Equipar el coche con accesorios implica decidir sobre productos que se notan justo
          en el peor momento: una dash cam sin modo aparcamiento, un arrancador de batería sin
          amperios suficientes para tu motor o una baliza V16 no homologada se convierten en un
          problema real el día que de verdad los necesitas. ${SITE.name} reúne los criterios que
          importan de cada tipo de producto para que la decisión no dependa de adivinar.
        </p>
        <p>
          No inventamos comparativas de modelos concretos que no hemos podido revisar con
          criterio: cada guía explica qué características buscar y por qué, de forma que sirva
          para comparar cualquier producto, lo compres donde lo compres.
        </p>
      </div>
      <div class="trust-card">
        <h3>Cómo se financia esta web</h3>
        <p>${SITE.amazonDisclaimer}</p>
        <p class="trust-note">
          Enlazar a un producto no cambia su precio para ti ni implica que sea el único
          recomendable: es una forma de sostener el tiempo que lleva escribir cada guía.
        </p>
      </div>
    </div>
  </section>

  ${ctaBand()}
  `;

  return {
    route: "index.html",
    path: "/",
    title: SITE.name,
    description: SITE.description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.domain,
        description: SITE.description,
        inLanguage: "es-ES",
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE.name,
        url: SITE.domain,
      },
    ],
    html,
  };
}

module.exports = home;
