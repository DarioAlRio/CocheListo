"use strict";

const { SITE } = require("../nav");
const { paragraphs, checklist, faqBlock, amazonSearchBox, productGrid, icon } = require("../lib");
const { pageHero, formatDate } = require("../layout");

function guiaPage(g) {
  const sections = g.sections
    .map(
      (s) => `<div class="content-section">
        <h2>${s.heading}</h2>
        ${paragraphs(s.body)}
      </div>`
    )
    .join("\n");

  const html = `
  ${pageHero({
    eyebrow: "Guía de compra",
    title: g.title,
    dek: g.dek,
    updated: g.updated,
  })}
  <section class="section">
    <div class="wrap two-col">
      <article class="prose">
        ${paragraphs(g.intro)}
        ${sections}
        ${
          g.checklist
            ? `<div class="content-section">
          <h2>Resumen rápido</h2>
          ${checklist(g.checklist)}
        </div>`
            : ""
        }
        ${
          g.faq && g.faq.length
            ? `<div class="content-section">
          <h2>Preguntas frecuentes</h2>
          ${faqBlock(g.faq)}
        </div>`
            : ""
        }
        ${productGrid(g.products)}
        ${
          g.products && g.products.length > 1
            ? `<p class="see-all"><a href="/comparativas/${g.slug}.html">Ver comparativa: entrada de gama vs. gama alta ${icon("arrow")}</a></p>`
            : ""
        }
      </article>
      <aside class="sidebar">
        ${amazonSearchBox(g.title, "Buscar más opciones")}
      </aside>
    </div>
  </section>
  `;

  return {
    route: `guias/${g.slug}.html`,
    path: `/guias/${g.slug}.html`,
    title: g.title,
    description: g.dek,
    excludeCategory: g.slug,
    breadcrumbsItems: [
      { label: "Inicio", href: "/" },
      { label: "Guías de compra", href: "/guias/" },
      { label: g.title },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.domain + "/" },
          { "@type": "ListItem", position: 2, name: "Guías de compra", item: SITE.domain + "/guias/" },
          { "@type": "ListItem", position: 3, name: g.title, item: SITE.domain + `/guias/${g.slug}.html` },
        ],
      },
      ...(g.faq && g.faq.length
        ? [
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: g.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
    html,
  };
}

module.exports = guiaPage;
