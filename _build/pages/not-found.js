"use strict";

const { SITE } = require("../nav");
const { icon } = require("../lib");

function notFound() {
  const html = `
  <section class="section not-found">
    <div class="wrap">
      <p class="eyebrow">Error 404</p>
      <h1>Esta página no existe</h1>
      <p>El enlace puede estar roto o la página se ha movido. Prueba desde el inicio o desde las guías de compra.</p>
      <div class="hero-actions">
        <a class="btn btn-accent" href="/">Ir al inicio ${icon("arrow")}</a>
        <a class="btn btn-ghost" href="/guias/">Ver guías de compra</a>
      </div>
    </div>
  </section>
  `;

  return {
    route: "404.html",
    path: "/404.html",
    title: "Página no encontrada",
    description: `Página no encontrada en ${SITE.name}.`,
    noindex: true,
    html,
  };
}

module.exports = notFound;
