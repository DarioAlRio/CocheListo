"use strict";

const { SITE } = require("../nav");
const {
  escapeHtml,
  amazonProductUrl,
  productUrl,
  productSlug,
  ourScore,
  priceTier,
  productCard,
  icon,
} = require("../lib");
const { pageHero } = require("../layout");

function productoPage(p, g) {
  const others = g.products.filter((x) => x.asin !== p.asin).slice(0, 3);
  const score = ourScore(p, g.products);
  const tier = priceTier(p, g.products);
  const path = productUrl(p);

  const html = `
  ${pageHero({ eyebrow: g.title, title: p.title })}
  <section class="section">
    <div class="wrap two-col">
      <article class="prose">
        <div class="product-hero">
          <img src="${p.img}" alt="${escapeHtml(p.title)}" loading="lazy" width="220" height="220">
          <div class="product-hero-meta">
            ${tier ? `<span class="card-eyebrow">${tier}</span>` : ""}
            <div class="product-score">
              <span class="product-score-num">${score.toFixed(1)}</span>
              <span class="product-score-label">Nuestra puntuación<br>sobre 10</span>
            </div>
            ${p.rating ? `<p>Valoración en Amazon: <strong>${escapeHtml(p.rating)}</strong></p>` : ""}
            <p class="product-hero-price">desde ${escapeHtml(p.price)} €</p>
            <a class="btn btn-accent" href="${amazonProductUrl(p.asin)}" target="_blank" rel="nofollow sponsored noopener">Ver precio en Amazon ${icon("arrow")}</a>
          </div>
        </div>

        <div class="content-section">
          <h2>Por qué está en esta guía</h2>
          <p>${escapeHtml(p.note)}</p>
          <p>Forma parte de nuestra guía <a href="/guias/${g.slug}.html">${escapeHtml(g.title)}</a>, donde explicamos los criterios completos para elegir en esta categoría, no solo este modelo.</p>
        </div>

        <div class="content-section">
          <h2>Cómo calculamos nuestra puntuación</h2>
          <p>
            La puntuación combina la valoración media en Amazon con su posición de precio dentro de
            esta guía (si es la opción más económica o la de gama alta). No es una prueba de
            laboratorio propia: es una forma de resumir de un vistazo si compensa dentro de su
            categoría, pensada para comparar rápido, no para sustituir la lectura de la guía completa.
          </p>
        </div>

        ${
          others.length
            ? `<div class="content-section">
          <h2>Otras opciones de esta guía</h2>
          <div class="product-grid">
            ${others.map(productCard).join("\n")}
          </div>
        </div>`
            : ""
        }
      </article>
      <aside class="sidebar">
        <div class="amzbox">
          <p class="amzbox-label">${escapeHtml(p.title)}</p>
          <a class="btn btn-accent" href="${amazonProductUrl(p.asin)}" target="_blank" rel="nofollow sponsored noopener">Ver en Amazon ${icon("arrow")}</a>
          <p class="sidebar-note">Precio orientativo, verifica el actual en la ficha de Amazon.</p>
        </div>
      </aside>
    </div>
  </section>
  `;

  return {
    route: `productos/${productSlug(p)}.html`,
    path,
    title: p.title,
    description: p.note,
    breadcrumbsItems: [
      { label: "Inicio", href: "/" },
      { label: "Guías de compra", href: "/guias/" },
      { label: g.title, href: `/guias/${g.slug}.html` },
      { label: p.title },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.domain + "/" },
          { "@type": "ListItem", position: 2, name: "Guías de compra", item: SITE.domain + "/guias/" },
          { "@type": "ListItem", position: 3, name: g.title, item: SITE.domain + `/guias/${g.slug}.html` },
          { "@type": "ListItem", position: 4, name: p.title, item: SITE.domain + path },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.title,
        image: p.img,
        description: p.note,
        url: SITE.domain + path,
      },
    ],
    html,
  };
}

module.exports = productoPage;
