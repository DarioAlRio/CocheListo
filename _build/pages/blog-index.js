"use strict";

const { ARTICLES } = require("../data");
const { articleCard } = require("../lib");
const { pageHero } = require("../layout");

function blogIndex() {
  const html = `
  ${pageHero({
    eyebrow: "Blog",
    title: "Blog",
    dek: "Notas más cortas sobre instalación, montaje y criterios de seguridad para el hogar, entre guía y guía.",
  })}
  <section class="section">
    <div class="wrap">
      <h2 class="sr-only">Todos los artículos</h2>
      <div class="card-grid">
        ${ARTICLES.map(articleCard).join("\n")}
      </div>
    </div>
  </section>
  `;

  return {
    route: "blog/index.html",
    path: "/blog/",
    title: "Blog",
    description: "Artículos de CocheListo sobre accesorios de coche, mantenimiento básico y cómo viajar más cómodo y seguro.",
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Blog" }],
    html,
  };
}

module.exports = blogIndex;
