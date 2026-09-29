"use strict";

// Texto ampliado de cada ficha de producto, generado SOLO a partir de datos reales:
// el título del fabricante, nuestra nota, la lista de comprobación de la guía y la
// posición de precio dentro de la guía (sin mostrar precios). No inventa datos:
// lo que la ficha no confirma se presenta como "qué comprobar antes de comprar".

const { escapeHtml, productUrl, priceNum, priceTier, altOf } = require("./lib");

let TOPICS = {};
try { TOPICS = require("./topics.json"); } catch (e) { TOPICS = {}; }

const STOP = new Set("para como cuando donde desde entre hasta sobre solo sólo pero porque tiene tienen este esta estos estas ese esa eso cada otro otra otros otras muy más menos mejor mejores bien buen buena bueno buenos buenas todo toda todos todas algo nada según suele suelen puede pueden debe deben hace hacen sino también aunque mientras antes después ahora siempre nunca quieres quiere vas usar uso modelo modelos producto productos opción opciones gama precio calidad incluye incluido compra comprar elegir tipo tipos forma parte lado caso casos veces menor mayor tamaño minimo mínimo máximo maximo".split(" "));

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const tokens = (s) => norm(s).split(/[^a-z0-9ñ]+/).filter((w) => (w.length >= 4 || /\d/.test(w) && w.length >= 2) && !STOP.has(w));
const stem = (w) => (w.length > 5 ? w.replace(/(es|s)$/, "") : w);

// Hash estable para alternar redacciones sin que todas las fichas digan lo mismo.
const pick = (key, arr) => { let h = 0; for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return arr[h % arr.length]; };

function titleFeatures(title) {
  const parts = String(title || "").split(/,\s*|\s[–|-]\s|\s\|\s?/).map((x) => x.trim()).filter(Boolean);
  const feats = parts.slice(1).filter((x) => x.length > 2 && x.length < 90);
  return [...new Set(feats)].slice(0, 6);
}

function brandOf(title) {
  const w = String(title || "").trim().split(/\s+/);
  if (!w.length) return "";
  // Marcas de dos palabras en mayúsculas ("K KNODEL") o con cifras ("Tapo C500").
  if (w[1] && (/^[A-ZÁÉÍÓÚÑ0-9&+.-]{2,}$/.test(w[1]) && /^[A-ZÁÉÍÓÚÑ0-9&+.-]+$/.test(w[0]))) return `${w[0]} ${w[1]}`;
  return w[0];
}

// Solo cuentan palabras distintivas: se descartan las del tema de la guía y las que
// aparecen en muchos productos (p. ej. "maletero" en todos los organizadores), para no
// atribuir a un modelo algo que su ficha no dice.
const GENERIC = new Map();
function genericWords(g) {
  if (GENERIC.has(g.slug)) return GENERIC.get(g.slug);
  const list = g.products || [];
  const df = new Map();
  for (const x of list) for (const w of new Set(tokens(`${x.title} ${x.note}`).map(stem))) df.set(w, (df.get(w) || 0) + 1);
  const gen = new Set(tokens(`${g.title} ${(TOPICS[g.slug] || []).join(" ")} ${g.slug.replace(/-/g, " ")}`).map(stem));
  for (const [w, n] of df) if (n > Math.max(2, list.length * 0.25)) gen.add(w);
  GENERIC.set(g.slug, gen);
  return gen;
}

// Para cada punto de la lista, busca si el título o nuestra nota mencionan literalmente
// alguna palabra clave del punto (solo de la parte afirmativa, antes de ", no ...").
// Devuelve la palabra tal cual aparece: se muestra como dato ("su ficha menciona «X»").
function checklistMatch(p, g) {
  const gen = genericWords(g);
  const words = String(`${p.title} ${p.note}`).split(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.]+/).filter(Boolean);
  const byStem = new Map();
  for (const w of words) { const k = tokens(w).map(stem)[0]; if (k && !gen.has(k) && !byStem.has(k)) byStem.set(k, w); }
  return (g.checklist || []).map((item) => {
    const core = String(item).split(/,?\s+no\s+(?:solo\s+)?|;\s*/)[0];
    // Palabras cortas y comunes ("modo", "base") no bastan por sí solas: se exige una
    // de 6+ letras o una cifra, y se muestran como mucho dos, en el orden del punto.
    const hits = [...new Set(tokens(core).map(stem).filter((w) => !gen.has(w) && byStem.has(w)))];
    const strong = hits.some((w) => w.length >= 6 || /\d/.test(w));
    return { item, word: strong ? hits.slice(0, 2).map((w) => byStem.get(w)).join("» y «") : null };
  });
}

function productCopy(p, g) {
  const list = g.products || [];
  const topic = TOPICS[g.slug] || [];
  const plural = topic[0] || "productos de esta categoría";
  const name = altOf(p.title);
  const brand = brandOf(p.title);
  const feats = titleFeatures(p.title);
  const checks = checklistMatch(p, g);
  const tier = priceTier(p, list);

  const priced = list.filter((x) => !isNaN(priceNum(x)) && priceNum(x) > 0).sort((a, b) => priceNum(a) - priceNum(b));
  const pos = priced.findIndex((x) => x.asin === p.asin);
  const cheaper = pos > 0 ? priced[pos - 1] : null;
  const dearer = pos >= 0 && pos < priced.length - 1 ? priced[pos + 1] : null;
  const sameBrand = list.filter((x) => x.asin !== p.asin && brandOf(x.title).toLowerCase() === brand.toLowerCase()).slice(0, 3);
  const firstClause = (x) => escapeHtml(String(x.note || "").split(/[.;]/)[0].trim());
  const link = (x) => `<a href="${productUrl(x)}">${escapeHtml(altOf(x.title))}</a>`;

  const out = [];

  // 1. Qué ofrece, según el fabricante.
  out.push(`<div class="content-section">
          <h2>Qué ofrece el ${escapeHtml(name)}</h2>
          <p>${pick(p.asin + "a", [
            `Este modelo de <strong>${escapeHtml(brand)}</strong> forma parte de nuestra selección de ${escapeHtml(plural)}.`,
            `Dentro de las ${list.length} opciones que comparamos en ${escapeHtml(plural)}, esta es la propuesta de <strong>${escapeHtml(brand)}</strong>.`,
            `<strong>${escapeHtml(brand)}</strong> es una de las marcas que incluimos en nuestra comparativa de ${escapeHtml(plural)}, y este es el modelo que hemos seleccionado.`,
          ])}</p>
          ${feats.length ? `<p>${pick(p.asin + "b", ["Según la ficha del fabricante, estos son sus puntos principales:", "Lo que el fabricante destaca de este modelo:", "Características que indica el fabricante en su ficha:"])}</p>
          <ul class="pc-list">${feats.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>` : ""}
        </div>`);

  // 2. Lista de comprobación de la guía aplicada a este modelo.
  if (checks.length) {
    const hits = checks.filter((c) => c.word).length;
    out.push(`<div class="content-section">
          <h2>Qué revisar antes de comprarlo</h2>
          <p>En nuestra guía <a href="/guias/${g.slug}.html">${escapeHtml(g.title)}</a> resumimos en una lista los puntos que más pesan al elegir. ${hits ? "Donde el título del fabricante o nuestra nota ya dicen algo sobre ese punto, lo indicamos:" : "Estos son los puntos que conviene comprobar en su ficha de Amazon:"}</p>
          <ul class="pc-list">${checks.map((c) => `<li>${escapeHtml(c.item)}${c.word ? ` <em>(su ficha menciona «${escapeHtml(c.word)}»)</em>` : ""}</li>`).join("")}</ul>
          <p>${pick(p.asin + "c", [
            "Ninguna ficha lo cuenta todo: si alguno de estos puntos es decisivo para ti, revisa la descripción completa y las preguntas de otros compradores en Amazon.",
            "Si un punto de la lista es imprescindible en tu caso, compruébalo en la descripción completa del producto antes de decidir.",
            "Tómalo como una guía rápida: lo importante es que cumpla los puntos que de verdad vas a usar a diario.",
          ])}</p>
        </div>`);
  }

  // 3. Precio relativo dentro de la guía (sin cifras: el precio cambia a menudo).
  if (tier && pos >= 0) {
    const n = priced.length;
    const rel = pos === 0 ? "el más económico" : pos === n - 1 ? "el de precio más alto" : `el ${pos + 1}.º más económico`;
    const advice = {
      "Entrada de gama": pick(p.asin + "d", [
        "Es una buena opción si buscas cubrir lo básico sin gastar de más, o si es para un uso ocasional.",
        "Encaja si priorizas el presupuesto y te basta con las funciones esenciales.",
      ]),
      "Gama media": pick(p.asin + "d", [
        "Se mueve en la zona de equilibrio: suele ser donde más se nota la relación entre lo que pagas y lo que obtienes.",
        "Es la franja que recomendamos mirar primero si no tienes claro cuánto gastar.",
      ]),
      "Gama alta": pick(p.asin + "d", [
        "Tiene sentido si vas a darle un uso intensivo o necesitas alguna de las funciones que lo diferencian de los modelos más baratos.",
        "Compensa sobre todo si lo vas a usar a menudo; para un uso ocasional, un modelo de gama media puede bastar.",
      ]),
    }[tier] || "";
    out.push(`<div class="content-section">
          <h2>Precio y para quién es</h2>
          <p>De los ${n} modelos de esta guía, es ${rel}, por lo que lo situamos en <strong>${tier.toLowerCase()}</strong>. ${advice}</p>
          <p>No publicamos precios porque cambian con frecuencia: consulta el precio actual y las ofertas en Amazon antes de comprar.</p>
        </div>`);
  }

  // 4. Alternativas cercanas: una más barata, una más cara y otras de la misma marca.
  const alts = [];
  if (cheaper) alts.push(`<li><strong>Si quieres gastar algo menos:</strong> ${link(cheaper)}${firstClause(cheaper) ? `. ${firstClause(cheaper)}.` : "."}</li>`);
  if (dearer) alts.push(`<li><strong>Si puedes subir un poco el presupuesto:</strong> ${link(dearer)}${firstClause(dearer) ? `. ${firstClause(dearer)}.` : "."}</li>`);
  const brandAlts = sameBrand.filter((x) => x !== cheaper && x !== dearer);
  if (brandAlts.length) alts.push(`<li><strong>Otros modelos de ${escapeHtml(brand)} en la guía:</strong> ${brandAlts.map(link).join(", ")}.</li>`);
  if (alts.length) {
    out.push(`<div class="content-section">
          <h2>Alternativas al ${escapeHtml(name)}</h2>
          <ul class="pc-list">${alts.join("")}</ul>
          <p>Si quieres ver todas las opciones ordenadas, tienes el <a href="/mejores/${g.slug}.html">ranking completo de ${escapeHtml(plural)}</a>.</p>
        </div>`);
  }

  return out.join("\n        ");
}

module.exports = { productCopy };
