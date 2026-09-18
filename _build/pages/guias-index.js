"use strict";

const { GUIDES } = require("../data");
const { guideCard } = require("../lib");
const { pageHero } = require("../layout");

function guiasIndex() {
  const html = `
  ${pageHero({
    eyebrow: "Guías de compra",
    title: "Todas las guías",
    dek: "Criterios para elegir cámaras de vigilancia, timbres inteligentes, cerraduras conectadas y sensores para el hogar, sin recomendar una marca concreta.",
  })}
  <section class="section">
    <div class="wrap">
      <div class="card-grid">
        ${GUIDES.map(guideCard).join("\n")}
      </div>
    </div>
  </section>
  `;

  return {
    route: "guias/index.html",
    path: "/guias/",
    title: "Guías de compra",
    description: "Todas las guías de compra de HogarSeguro: cámaras WiFi interior y exterior, timbres con cámara, cerraduras inteligentes, sensores, cámaras de batería, kits de videovigilancia y enchufes/luces inteligentes.",
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Guías de compra" }],
    html,
  };
}

module.exports = guiasIndex;
