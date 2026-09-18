"use strict";

const { SITE } = require("../nav");
const { escapeHtml, productCard, ourScore, amazonSearchBox } = require("../lib");
const { pageHero } = require("../layout");

// Comparativa automática entre la opción más económica y la de gama alta de
// cada guía: reutiliza datos ya verificados en products, no investiga nada
// nuevo. Si la guía tiene un solo producto, no genera comparativa.
function comparativaPage(g) {
  const sorted = [...g.products].sort((a, b) => Number(a.price) - Number(b.price));
  const budget = sorted[0];
  const premium = sorted[sorted.length - 1];
  if (!budget || !premium || budget.asin === premium.asin) return null;

  const rows = [
    ["Precio", `${budget.price} €`, `${premium.price} €`],
    ["Valoración en Amazon", budget.rating || "—", premium.rating || "—"],
    ["Nuestra puntuación", ourScore(budget, g.products).toFixed(1), ourScore(premium, g.products).toFixed(1)],
  ];

  const html = `
  ${pageHero({
    eyebrow: `Comparativa · ${g.title}`,
    title: `${budget.title} vs. ${premium.title}`,
    dek: `¿Compensa pagar más? Comparamos la opción más económica y la de gama alta de nuestra guía de ${g.title.toLowerCase()}.`,
  })}
  <section class="section">
    <div class="wrap two-col">
      <article class="prose">
        <table class="table">
          <thead>
            <tr><th scope="col"></th><th scope="col">${escapeHtml(budget.title)}</th><th scope="col">${escapeHtml(premium.title)}</th></tr>
          </thead>
          <tbody>
            ${rows.map(([label, a, b]) => `<tr><td>${label}</td><td>${escapeHtml(a)}</td><td>${escapeHtml(b)}</td></tr>`).join("\n            ")}
          </tbody>
        </table>

        <div class="content-section">
          <h2>Nuestro veredicto</h2>
          <p><strong>${escapeHtml(budget.title)}:</strong> ${escapeHtml(budget.note)}</p>
          <p><strong>${escapeHtml(premium.title)}:</strong> ${escapeHtml(premium.note)}</p>
          <p>
            Si tu prioridad es gastar lo mínimo cumpliendo los criterios básicos de la guía, la opción
            de entrada cumple. Si buscas más recorrido y prestaciones a largo plazo, la de gama alta
            compensa. Entre medias hay más opciones: la
            <a href="/guias/${g.slug}.html">guía completa de ${escapeHtml(g.title.toLowerCase())}</a>
            explica los criterios para elegir entre todas ellas.
          </p>
        </div>

        <div class="product-grid">
          ${[budget, premium].map(productCard).join("\n")}
        </div>
      </article>
      <aside class="sidebar">
        ${amazonSearchBox(g.title, "Buscar más opciones")}
      </aside>
    </div>
  </section>
  `;

  return {
    route: `comparativas/${g.slug}.html`,
    path: `/comparativas/${g.slug}.html`,
    title: `${budget.title} vs. ${premium.title}`,
    description: `Comparativa entre la opción de entrada y la de gama alta de nuestra guía de ${g.title.toLowerCase()}.`,
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
          { "@type": "ListItem", position: 4, name: "Comparativa", item: SITE.domain + `/comparativas/${g.slug}.html` },
        ],
      },
    ],
    html,
  };
}

module.exports = comparativaPage;
