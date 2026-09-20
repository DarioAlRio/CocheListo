"use strict";

const { SITE } = require("../nav");
const { escapeHtml, productCard, ourScore, amazonSearchBox } = require("../lib");
const { pageHero } = require("../layout");

// Construye una página de comparativa entre dos productos concretos de una
// misma guía. `slugSuffix` es "" para la comparativa histórica (entrada vs.
// gama alta, ruta sin sufijo para no romper enlaces ya indexados) o un sufijo
// para las comparativas adicionales (entrada vs. media, media vs. alta).
// Nombre corto (marca + modelo) para el <title>, que si no se corta a mitad de palabra.
function shortName(t) {
  const s = String(t).replace(/\s+/g, " ");
  return s.length <= 30 ? s : s.slice(0, 30).replace(/\s+\S*$/, "");
}

function buildComparativa(g, a, b, slugSuffix, labelA, labelB, intro) {
  const rows = [
    ["Precio", `${a.price} €`, `${b.price} €`],
    ["Valoración en Amazon", a.rating || "—", b.rating || "—"],
    ["Nuestra puntuación", ourScore(a, g.products).toFixed(1), ourScore(b, g.products).toFixed(1)],
  ];

  const route = `comparativas/${g.slug}${slugSuffix}.html`;
  const path = `/comparativas/${g.slug}${slugSuffix}.html`;

  const html = `
  ${pageHero({
    eyebrow: `Comparativa · ${g.title}`,
    title: `${a.title} vs. ${b.title}`,
    dek: intro,
    image: g.img,
    imageAlt: g.title,
  })}
  <section class="section">
    <div class="wrap two-col">
      <article class="prose">
        <table class="table">
          <thead>
            <tr><th scope="col"></th><th scope="col">${escapeHtml(a.title)}</th><th scope="col">${escapeHtml(b.title)}</th></tr>
          </thead>
          <tbody>
            ${rows.map(([label, x, y]) => `<tr><td>${label}</td><td>${escapeHtml(x)}</td><td>${escapeHtml(y)}</td></tr>`).join("\n            ")}
          </tbody>
        </table>

        <div class="content-section">
          <h2>Nuestro veredicto</h2>
          <p><strong>${escapeHtml(a.title)} (${labelA}):</strong> ${escapeHtml(a.note)}</p>
          <p><strong>${escapeHtml(b.title)} (${labelB}):</strong> ${escapeHtml(b.note)}</p>
          <p>
            La guía completa de
            <a href="/guias/${g.slug}.html">${escapeHtml(g.title.toLowerCase())}</a>
            explica los criterios para elegir entre todas las opciones, no solo estas dos.
          </p>
        </div>

        <div class="product-grid">
          ${[a, b].map(productCard).join("\n")}
        </div>
      </article>
      <aside class="sidebar">
        ${amazonSearchBox(g.title, "Buscar más opciones")}
      </aside>
    </div>
  </section>
  `;

  return {
    route,
    path,
    title: `${shortName(a.title)} vs. ${shortName(b.title)}`,
    description: `Comparativa entre ${labelA} y ${labelB} de nuestra guía de ${g.title.toLowerCase()}.`,
    breadcrumbsItems: [
      { label: "Inicio", href: "/" },
      { label: "Guías de compra", href: "/guias/" },
      { label: g.title, href: `/guias/${g.slug}.html` },
      { label: "Comparativa" },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.domain + "/" },
          { "@type": "ListItem", position: 2, name: "Guías de compra", item: SITE.domain + "/guias/" },
          { "@type": "ListItem", position: 3, name: g.title, item: SITE.domain + `/guias/${g.slug}.html` },
          { "@type": "ListItem", position: 4, name: "Comparativa", item: SITE.domain + path },
        ],
      },
    ],
    html,
  };
}

// Genera hasta 3 comparativas por guía a partir de los mismos datos ya
// verificados en products, sin investigar nada nuevo: entrada vs. gama alta
// (siempre, si hay al menos 2 precios distintos, misma ruta que antes para no
// romper enlaces ya indexados), y si la guía tiene bastantes productos
// (5 o más), también entrada vs. gama media y gama media vs. alta.
function comparativaPages(g) {
  const sorted = [...g.products].sort((a, b) => Number(a.price) - Number(b.price));
  const budget = sorted[0];
  const premium = sorted[sorted.length - 1];
  if (!budget || !premium || budget.asin === premium.asin) return [];

  const pages = [
    buildComparativa(
      g,
      budget,
      premium,
      "",
      "entrada de gama",
      "gama alta",
      `¿Compensa pagar más? Comparamos la opción más económica y la de gama alta de nuestra guía de ${g.title.toLowerCase()}.`
    ),
  ];

  if (sorted.length >= 5) {
    const mid = sorted[Math.floor(sorted.length / 2)];
    if (mid.asin !== budget.asin && mid.asin !== premium.asin) {
      pages.push(
        buildComparativa(
          g,
          budget,
          mid,
          "-entrada-vs-gama-media",
          "entrada de gama",
          "gama media",
          `¿Merece la pena subir de la opción más económica a una de gama media en ${g.title.toLowerCase()}?`
        )
      );
      pages.push(
        buildComparativa(
          g,
          mid,
          premium,
          "-gama-media-vs-alta",
          "gama media",
          "gama alta",
          `¿Merece la pena dar el salto de gama media a gama alta en ${g.title.toLowerCase()}?`
        )
      );
    }
  }

  return pages;
}

module.exports = comparativaPages;
