"use strict";
// Opinión editorial propia por producto (_build/editorial.json): resumen, pros y contras
// redactados a partir de las especificaciones del fabricante, su posición en la guía y el
// perfil de comprador al que encaja. No es una prueba en mano ni copia valoraciones de Amazon.
const { escapeHtml } = require("./lib");
let ED = {};
try { ED = require("./editorial.json"); } catch (e) { ED = {}; }
const li = (a) => a.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
function editorialHtml(p, compact) {
  const e = ED[p.asin];
  if (!e) return "";
  if (compact) return `<div class="ed-pc ed-compact"><ul class="ed-pros">${li(e.pros.slice(0, 2))}</ul><ul class="ed-cons">${li(e.contras.slice(0, 1))}</ul></div>`;
  return `<div class="content-section">
          <h2>Nuestra opinión</h2>
          ${e.resumen.map((x) => `<p>${escapeHtml(x)}</p>`).join("")}
          <div class="ed-pc">
            <div><h3>Lo que nos gusta</h3><ul class="ed-pros">${li(e.pros)}</ul></div>
            <div><h3>Lo que debes saber</h3><ul class="ed-cons">${li(e.contras)}</ul></div>
          </div>
          ${e.para ? `<p><strong>Para quién es:</strong> ${escapeHtml(e.para)}</p>` : ""}
          <p class="seo-meta">Valoración editorial basada en las especificaciones del fabricante y en cómo se sitúa frente al resto de la guía; no es una prueba de laboratorio.</p>
        </div>`;
}
module.exports = { editorialHtml, hasEditorial: (p) => !!ED[p.asin] };
