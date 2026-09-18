"use strict";

const { SITE } = require("../nav");
const { paragraphs } = require("../lib");
const { pageHero } = require("../layout");

function articuloPage(a) {
  const html = `
  ${pageHero({
    eyebrow: "Blog",
    title: a.title,
    dek: a.dek,
    updated: a.updated,
  })}
  <section class="section">
    <div class="wrap">
      <article class="prose prose-narrow">
        ${paragraphs(a.body)}
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
