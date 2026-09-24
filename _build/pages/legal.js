"use strict";

const { SITE } = require("../nav");
const { pageHero } = require("../layout");

function avisoLegal() {
  const html = `
  ${pageHero({ eyebrow: "Legal", title: "Aviso legal" })}
  <section class="section">
    <div class="wrap prose">
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los
        siguientes datos identificativos del titular de este sitio web: Sitio web:
        ${SITE.domain}. Correo electrónico de contacto: <a href="mailto:${SITE.email}">${SITE.email}</a>.
      </p>

      <h2>2. Objeto</h2>
      <p>
        ${SITE.name} es un sitio de contenido editorial (guías de compra y artículos) sobre
        cámaras de vigilancia y seguridad inteligente para el hogar. No es una tienda: no vende
        productos ni gestiona pagos ni envíos. Cuando se menciona un producto o categoría, puede
        incluir enlaces a tiendas de terceros, incluido Amazon.
      </p>

      <h2>3. Programa de Afiliados de Amazon</h2>
      <p>
        ${SITE.name} participa en el Programa de Afiliados de Amazon EU, un programa de
        publicidad para afiliados diseñado para ofrecer a los sitios web un modo de obtener
        comisiones por publicidad, publicitando e incluyendo enlaces a Amazon.es.
        ${SITE.amazonDisclaimer} Los precios y la disponibilidad de los productos mostrados en
        Amazon son responsabilidad exclusiva de Amazon y pueden variar en cualquier momento.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Los textos, guías y artículos publicados en ${SITE.name} son de elaboración propia,
        salvo que se indique lo contrario, y están protegidos por derechos de propiedad
        intelectual. Se permite citar y enlazar contenido indicando la fuente; no se permite su
        reproducción total sin autorización previa.
      </p>

      <h2>5. Condiciones de uso</h2>
      <p>
        El acceso a este sitio es gratuito y no requiere registro. El usuario se compromete a
        hacer un uso adecuado de los contenidos y a no emplearlos para fines ilícitos o
        lesivos para terceros. ${SITE.name} no garantiza la disponibilidad continua del sitio
        ni se responsabiliza de las decisiones de compra tomadas a partir de su contenido.
      </p>

      <h2>6. Enlaces a terceros</h2>
      <p>
        Este sitio puede contener enlaces a páginas de terceros (Amazon y otras tiendas).
        ${SITE.name} no se hace responsable del contenido, políticas de privacidad o prácticas
        de esos sitios externos.
      </p>

      <h2>7. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia se
        someterán las partes a los juzgados y tribunales del domicilio del usuario, cuando la
        normativa de consumo así lo permita.
      </p>
    </div>
  </section>
  `;

  return {
    route: "legal/aviso-legal.html",
    path: "/legal/aviso-legal.html",
    title: "Aviso legal",
    description: `Aviso legal de ${SITE.name}.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Aviso legal" }],
    html,
  };
}

function politicaPrivacidad() {
  const html = `
  ${pageHero({ eyebrow: "Legal", title: "Política de privacidad" })}
  <section class="section">
    <div class="wrap prose">
      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales recabados a través de
        ${SITE.domain} es el titular de este sitio web, con quien puedes contactar en <a href="mailto:${SITE.email}">${SITE.email}</a>.
      </p>

      <h2>2. Qué datos se tratan</h2>
      <p>
        Esta web no tiene formularios de registro ni de contacto propio: el contacto se hace
        por correo electrónico externo (Gmail u otro proveedor), fuera de este sitio. Si en el
        futuro se incorpora analítica de tráfico, se informará aquí del proveedor, la
        finalidad y la base legal antes de activarla, y se solicitará el consentimiento
        correspondiente a través del panel de cookies.
      </p>

      <h2>3. Finalidad</h2>
      <p>
        Los únicos datos que puede tratar este sitio hoy son los derivados de las cookies
        técnicas y, si se aceptan, analíticas descritas en la
        <a href="/legal/politica-cookies.html">política de cookies</a>: medir el uso del sitio
        y, en su caso, la interacción con los enlaces de afiliado.
      </p>

      <h2>4. Conservación</h2>
      <p>
        Los datos de cookies se conservan según los plazos indicados en la política de
        cookies. Los correos electrónicos recibidos se conservan mientras sean necesarios para
        atender la consulta.
      </p>

      <h2>5. Derechos de las personas usuarias</h2>
      <p>
        Cualquier persona tiene derecho a acceder, rectificar y suprimir sus datos, así como a
        otros derechos reconocidos por el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica
        3/2018 (LOPDGDD): limitación, oposición y portabilidad. Puede ejercerlos escribiendo a
        <a href="mailto:${SITE.email}">${SITE.email}</a>, y presentar una reclamación ante la Agencia Española de
        Protección de Datos (aepd.es) si lo considera necesario.
      </p>

      <h2>6. Terceros</h2>
      <p>
        Este sitio enlaza a Amazon como parte del Programa de Afiliados. Amazon trata los datos
        de quienes hacen clic en esos enlaces conforme a su propia política de privacidad,
        ajena a este sitio.
      </p>
    </div>
  </section>
  `;

  return {
    route: "legal/politica-privacidad.html",
    path: "/legal/politica-privacidad.html",
    title: "Política de privacidad",
    description: `Política de privacidad de ${SITE.name}.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Política de privacidad" }],
    html,
  };
}

function politicaCookies() {
  const html = `
  ${pageHero({ eyebrow: "Legal", title: "Política de cookies" })}
  <section class="section">
    <div class="wrap prose">
      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies son pequeños archivos que un sitio web guarda en tu navegador para
        recordar información sobre tu visita, como tus preferencias o si ya has aceptado este
        aviso.
      </p>

      <h2>2. Cookies que usa esta web</h2>
      <p>
        Hoy, ${SITE.domain} solo utiliza una cookie técnica propia para recordar tu decisión
        sobre este aviso (aceptar o rechazar) durante 12 meses. No se instala ninguna cookie de
        analítica ni de publicidad hasta que aceptes expresamente, ni existe ninguna todavía
        activa a la espera de esa integración.
      </p>
      <table class="table">
        <thead>
          <tr><th scope="col">Cookie</th><th scope="col">Tipo</th><th scope="col">Finalidad</th><th scope="col">Duración</th></tr>
        </thead>
        <tbody>
          <tr><td>cookieconsent</td><td>Técnica</td><td>Recordar tu elección sobre este aviso</td><td>12 meses</td></tr>
        </tbody>
      </table>

      <h2>3. Cookies de terceros al hacer clic en Amazon</h2>
      <p>
        Al pulsar un enlace hacia Amazon.es, Amazon puede instalar sus propias cookies para
        identificar que la visita procede de ${SITE.name} y, en su caso, atribuir la compra
        al programa de afiliados. Esas cookies las gestiona Amazon conforme a su propia
        política de cookies, no esta.
      </p>

      <h2>4. Cómo gestionar las cookies</h2>
      <p>
        Puedes aceptar o rechazar las cookies no esenciales con el aviso que aparece en tu
        primera visita, y también puedes borrarlas o bloquearlas en cualquier momento desde la
        configuración de tu navegador. Bloquear todas las cookies puede afectar al
        funcionamiento de partes del sitio.
      </p>
    </div>
  </section>
  `;

  return {
    route: "legal/politica-cookies.html",
    path: "/legal/politica-cookies.html",
    title: "Política de cookies",
    description: `Política de cookies de ${SITE.name}.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Política de cookies" }],
    html,
  };
}

module.exports = { avisoLegal, politicaPrivacidad, politicaCookies };
