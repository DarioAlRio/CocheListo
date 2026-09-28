"use strict";

const { SITE } = require("../nav");
const { paragraphs } = require("../lib");
const { pageHero } = require("../layout");
const { relatedBlock } = require("../quickpicks");

// "Sigue leyendo": los 3 artículos siguientes en orden circular, para que todo
// artículo reciba enlaces internos además del índice del blog.
function moreArticles(a) {
  const { ARTICLES } = require("../data");
  const i = ARTICLES.findIndex((x) => x.slug === a.slug);
  if (i < 0 || ARTICLES.length < 2) return "";
  const next = [1, 2, 3].map((k) => ARTICLES[(i + k) % ARTICLES.length]).filter((x, j, arr) => x.slug !== a.slug && arr.indexOf(x) === j);
  return `<div class="content-section more-articles">
        <h2>Sigue leyendo</h2>
        <ul>${next.map((x) => `<li><a href="/blog/${x.slug}.html">${x.title}</a></li>`).join("")}</ul>
      </div>`;
}

function articuloPage(a) {
  const html = `
  ${pageHero({
    eyebrow: "Blog",
    title: a.title,
    dek: a.dek,
    updated: a.updated,
    image: a.img,
    imageAlt: a.title,
  })}
  <section class="section">
    <div class="wrap">
      <article class="prose prose-narrow">
        ${paragraphs(a.body)}
        ${relatedBlock(a)}
        ${moreArticles(a)}
      </article>
    </div>
  </section>
  `;

  return {
    route: `blog/${a.slug}.html`,
    path: `/blog/${a.slug}.html`,
    title: a.title,
    description: a.dek,
    breadcrumbsItems: [
      { label: "Inicio", href: "/" },
      { label: "Blog", href: "/blog/" },
      { label: a.title },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.domain + "/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: SITE.domain + "/blog/" },
          { "@type": "ListItem", position: 3, name: a.title, item: SITE.domain + `/blog/${a.slug}.html` },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.dek,
        datePublished: a.updated,
        dateModified: a.updated,
        author: { "@type": "Person", name: SITE.name },
      },
    ],
    html,
  };
}

module.exports = articuloPage;
