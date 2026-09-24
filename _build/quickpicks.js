"use strict";

// Bloques de conversión: "Elige rápido" (arriba de cada guía) y "Sigue con la
// guía" (al final de cada artículo). Todo sale de data.js, nada se escribe a mano.

const { GUIDES } = require("./data");
const { escapeHtml, amazonProductUrl, productUrl, ratingNumber, icon, priceTier, altOf, priceNum } = require("./lib");

const fmtPrice = (p) => `${String(p.price).replace(".", ",")} €`;

// Devuelve { choice, value, cheap } con productos distintos de la guía.
function pickWinners(products) {
  const list = (products || []).filter((p) => ratingNumber(p.rating) !== null && !isNaN(priceNum(p)));
  if (list.length < 3) return null;
  const prices = list.map((p) => priceNum(p)).sort((a, b) => a - b);
  const median = prices[Math.floor(prices.length / 2)];
  const used = new Set();
  const take = (arr, key) => {
    const c = arr.filter((p) => !used.has(p.asin)).sort(key)[0];
    if (c) used.add(c.asin);
    return c;
  };
  // Nuestra elección: la mejor valoración; si empatan, la más cercana a la gama media.
  const choice = take(
    list,
    (a, b) =>
      ratingNumber(b.rating) - ratingNumber(a.rating) ||
      Math.abs(priceNum(a) - median) - Math.abs(priceNum(b) - median)
  );
  // Mejor calidad-precio: más valoración por euro (con raíz para no premiar solo lo barato).
  const good = list.filter((p) => ratingNumber(p.rating) >= 4.2);
  const value = take(
    good.length ? good : list,
    (a, b) =>
      (ratingNumber(b.rating) - 3.5) / Math.sqrt(priceNum(b)) -
      (ratingNumber(a.rating) - 3.5) / Math.sqrt(priceNum(a))
  );
  // Más económico: el más barato con valoración decente.
  const okCheap = list.filter((p) => ratingNumber(p.rating) >= 4.0);
  const cheap = take(okCheap.length ? okCheap : list, (a, b) => priceNum(a) - priceNum(b));
  return choice && value && cheap ? { choice, value, cheap } : null;
}

function quickPicks(g) {
  const w = pickWinners(g.products);
  if (!w) return "";
  const rows = [
    ["Nuestra elección", w.choice],
    ["Mejor calidad-precio", w.value],
    ["Más económico", w.cheap],
  ]
    .map(
      ([label, p]) => `<tr>
          <td data-label="Elección"><span class="quickpick-badge">${label}</span></td>
          <td data-label="Producto"><a class="quickpick-product" href="${productUrl(p)}"><img src="${p.img}" alt="${escapeHtml(altOf(p.title))}" loading="lazy" width="56" height="56"><span>${escapeHtml(p.title)}</span></a></td>
          <td data-label="Valoración">${escapeHtml(p.rating)}</td>
          <td data-label="Gama">${escapeHtml(priceTier(p, g.products) || "—")}</td>
          <td class="quickpick-cta"><a class="btn btn-accent" href="${amazonProductUrl(p.asin)}" target="_blank" rel="nofollow sponsored noopener">Ver en Amazon ${icon("arrow")}</a></td>
        </tr>`
    )
    .join("\n");
  return `<div class="content-section quickpicks">
        <h2>Elige rápido</h2>
        <p class="quickpicks-note">Si tienes prisa: estas son las tres opciones que mejor se defienden en esta guía según su valoración en Amazon y su gama de precio. El precio actual, en Amazon.</p>
        <div class="quickpicks-scroll"><table class="quickpicks-table">
          <thead><tr><th>Elección</th><th>Producto</th><th>Valoración</th><th>Gama</th><th></th></tr></thead>
          <tbody>
        ${rows}
          </tbody>
        </table></div>
      </div>`;
}

// ---- Guías relacionadas con cada artículo (asignadas a mano por slug) ----
const ARTICLE_GUIDES = {
  "que-llevar-siempre-en-el-maletero": [
    "organizadores-de-maletero",
    "luces-y-accesorios-de-emergencia-para-coche"
  ],
  "errores-comunes-al-elegir-una-dash-cam": [
    "camaras-de-conduccion-dash-cams"
  ],
  "como-preparar-el-coche-para-un-viaje-largo": [
    "luces-y-accesorios-de-emergencia-para-coche",
    "cargadores-de-coche-usb"
  ],
  "cuanto-merece-la-pena-gastar-en-accesorios-de-coche": [
    "camaras-de-conduccion-dash-cams",
    "cargadores-de-coche-usb"
  ],
  "cargador-de-coche-o-power-bank-cual-conviene": [
    "cargadores-de-coche-usb"
  ],
  "como-elegir-dash-cam-resolucion-y-angulo-de-vision": [
    "camaras-de-conduccion-dash-cams"
  ],
  "arrancador-de-bateria-portatil-como-usarlo-de-forma-segura": [
    "cables-y-arrancadores-de-bateria"
  ],
  "como-mantener-tu-aspirador-de-coche-funcionando-bien": [
    "aspiradores-portatiles-para-coche"
  ],
  "donde-colocar-el-soporte-de-movil-en-el-coche": [
    "soportes-de-movil-para-coche"
  ],
  "como-eliminar-malos-olores-del-coche-sin-tapar-el-problema": [
    "purificadores-y-ambientadores-de-coche"
  ],
  "alfombrillas-de-goma-o-de-tela-segun-la-epoca-del-ano": [
    "alfombrillas-y-protectores-de-suelo-para-coche"
  ],
  "checklist-antes-de-un-viaje-largo-en-carretera": [
    "luces-y-accesorios-de-emergencia-para-coche",
    "cargadores-de-coche-usb"
  ],
  "como-limpiar-y-cuidar-las-fundas-de-los-asientos-del-coche": [
    "fundas-y-protectores-de-asiento"
  ],
  "que-hacer-si-se-te-queda-la-bateria-del-coche-sin-carga": [
    "cables-y-arrancadores-de-bateria"
  ],
  "accesorios-utiles-para-viajar-con-mascotas-en-el-coche": [
    "fundas-y-protectores-de-asiento",
    "alfombrillas-y-protectores-de-suelo-para-coche"
  ],
  "dash-cam-delantera-o-doble-cual-elegir": [
    "camaras-de-conduccion-dash-cams"
  ],
  "cuanto-cuesta-una-buena-dash-cam": [
    "camaras-de-conduccion-dash-cams"
  ],
  "soporte-movil-coche-rejilla-ventosa-o-iman": [
    "soportes-de-movil-para-coche"
  ],
  "mejor-cargador-de-coche-para-viajes-largos": [
    "cargadores-de-coche-usb"
  ],
  "como-elegir-arrancador-de-bateria-para-coche": [
    "cables-y-arrancadores-de-bateria"
  ],
  "arrancador-de-bateria-o-cables-de-pinza": [
    "cables-y-arrancadores-de-bateria"
  ],
  "como-elegir-aspirador-de-coche": [
    "aspiradores-portatiles-para-coche"
  ],
  "alfombrillas-universales-o-a-medida": [
    "alfombrillas-y-protectores-de-suelo-para-coche"
  ],
  "organizador-de-maletero-para-suv-o-utilitario": [
    "organizadores-de-maletero"
  ],
  "fundas-de-asiento-universales-errores-al-comprar": [
    "fundas-y-protectores-de-asiento"
  ],
  "baliza-v16-y-kit-de-emergencia-que-necesitas": [
    "luces-y-accesorios-de-emergencia-para-coche"
  ],
  "accesorios-para-coche-de-ciudad-que-merecen-la-pena": [
    "camaras-de-conduccion-dash-cams",
    "soportes-de-movil-para-coche"
  ],
  "accesorios-para-el-coche-con-ninos-que-necesitas": [
    "fundas-y-protectores-de-asiento",
    "aspiradores-portatiles-para-coche"
  ],
  "ambientador-o-purificador-de-coche-cual-elegir": [
    "purificadores-y-ambientadores-de-coche"
  ],
  "que-comprar-primero-para-un-coche-de-segunda-mano": [
    "luces-y-accesorios-de-emergencia-para-coche",
    "cables-y-arrancadores-de-bateria"
  ]
};

function relatedGuides(a, n = 2) {
  return (ARTICLE_GUIDES[a.slug] || [])
    .map((slug) => GUIDES.find((g) => g.slug === slug))
    .filter(Boolean)
    .slice(0, n);
}

function relatedBlock(a) {
  const gs = relatedGuides(a);
  if (!gs.length) return "";
  const items = gs
    .map((g) => {
      const w = pickWinners(g.products);
      return `<li>
          <a class="related-guide-title" href="/guias/${g.slug}.html">${escapeHtml(g.title)}</a>
          <span class="related-guide-dek">${escapeHtml(g.dek || "")}</span>
          ${w ? `<span class="related-guide-pick">Nuestra elección: <a href="${productUrl(w.choice)}">${escapeHtml(w.choice.title)}</a> (${escapeHtml(w.choice.rating)})</span>` : ""}
        </li>`;
    })
    .join("\n");
  return `<div class="content-section related-guides">
        <h2>¿Ya sabes qué necesitas? Mira las mejores opciones</h2>
        <ul class="related-guide-list">
        ${items}
        </ul>
      </div>`;
}

module.exports = { quickPicks, relatedBlock, relatedGuides, pickWinners };
