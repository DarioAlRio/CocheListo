"use strict";

const { SITE } = require("../nav");
const { escapeHtml, productCard, ourScore, amazonSearchBox, priceTier, productUrl, priceNum } = require("../lib");
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

// Fecha de la última revisión de productos y datos de estas comparativas.
const CMP_UPDATED = "2026-09-24";

// Bloque de contenido propio de cada comparativa: qué se gana subiendo de
// gama, criterios de la guía aplicados a este duelo y enlaces a las otras
// comparativas y rankings de la categoría.
function cmpExtra(g, a, b, slugSuffix, labelA, labelB) {
  const topic = g.title.replace(/^Cómo elegir (un |una |unos |unas )?/i, "").toLowerCase();
  const others = [
    ["", "Entrada de gama vs. gama alta"],
    ["-entrada-vs-gama-media", "Entrada de gama vs. gama media"],
    ["-gama-media-vs-alta", "Gama media vs. gama alta"],
  ].filter(([s]) => s !== slugSuffix);
  const sa = Number(String(a.rating).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
  const sb = Number(String(b.rating).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
  const better = sa === sb ? ((Number(a.reviews) || 0) >= (Number(b.reviews) || 0) ? a : b) : sa > sb ? a : b;
  const worse = better === a ? b : a;
  const verdict = better === a
    ? `Aquí la opción de ${labelA} sale reforzada: tiene igual o mejor valoración que la de ${labelB}, así que pagar más no garantiza más satisfacción. Solo compensa subir si necesitas algo concreto que ofrezca el otro modelo.`
    : `La opción de ${labelB} tiene mejor valoración de los compradores (${escapeHtml(better.rating || "")} frente a ${escapeHtml(worse.rating || "")}). Si usas ${topic} a menudo, la diferencia suele notarse; para un uso ocasional, la de ${labelA} cumple.`;
  return `
        <div class="content-section">
          <h2>¿Compensa pagar más?</h2>
          <p>${verdict}</p>
          <p>Ten en cuenta que las valoraciones de Amazon miden la satisfacción de quien ya compró, no una prueba técnica: un modelo sencillo que cumple lo que promete puede puntuar tan alto como uno de gama alta. Por eso conviene cruzar la nota con los criterios de abajo.</p>
        </div>
        ${g.checklist && g.checklist.length ? `<div class="content-section">
          <h2>Qué comprobar antes de elegir entre estos dos</h2>
          <ul>${g.checklist.map((c) => `<li>${c}</li>`).join("")}</ul>
          <p>Si alguno de estos puntos es decisivo para ti, revisa la ficha de cada modelo: <a href="${productUrl(a)}">${escapeHtml(altOfName(a.title))}</a> y <a href="${productUrl(b)}">${escapeHtml(altOfName(b.title))}</a>.</p>
        </div>` : ""}
        ${(g.faq || []).length ? `<div class="content-section">
          <h2>Dudas frecuentes sobre ${escapeHtml(topic)}</h2>
          ${g.faq.slice(0, 2).map((f) => `<h3>${f.q}</h3><p>${f.a}</p>`).join("")}
        </div>` : ""}
        <div class="content-section">
          <h2>Más comparativas y rankings</h2>
          <ul>
            ${others.map(([s, l]) => `<li><a href="/comparativas/${g.slug}${s}.html">${l} en ${escapeHtml(topic)}</a></li>`).join("")}
            <li><a href="/mejores/${g.slug}.html">Ranking completo de ${escapeHtml(topic)}</a></li>
            <li><a href="/mejores/${g.slug}-baratos.html">Opciones económicas de ${escapeHtml(topic)}</a></li>
          </ul>
        </div>`;
}
const altOfName = (t) => String(t).split(/,\s|\s[–-]\s|\s?\(/)[0].slice(0, 60);

function buildComparativa(g, a, b, slugSuffix, labelA, labelB, intro) {
  const rows = [
    ["Gama de precio", priceTier(a, g.products) || "—", priceTier(b, g.products) || "—"],
    ["Nº de opiniones", a.reviews ? Number(a.reviews).toLocaleString("es-ES") : "—", b.reviews ? Number(b.reviews).toLocaleString("es-ES") : "—"],
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
    updated: CMP_UPDATED,
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
        ${cmpExtra(g, a, b, slugSuffix, labelA, labelB)}
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
    title: `${labelA.charAt(0).toUpperCase() + labelA.slice(1)} vs. ${labelB}: ${shortName(a.title)} o ${shortName(b.title)}`,
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
  const sorted = [...g.products].sort((a, b) => priceNum(a) - priceNum(b));
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
