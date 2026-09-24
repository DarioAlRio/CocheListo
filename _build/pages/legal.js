"use strict";

// Textos legales. Generado por _tools/legal-template.js: para cambiar la
// redacción común, edita esa plantilla y vuelve a ejecutarla. Los datos del
// titular salen de SITE.legal (nav.js) y solo se muestran si están rellenados.

const { SITE } = require("../nav");
const { pageHero } = require("../layout");

const UPDATED = "24 de septiembre de 2026";
const OBJETO = `${SITE.name} es un sitio de contenido editorial (guías de compra y artículos) sobre
        cámaras de vigilancia y seguridad inteligente para el hogar. No es una tienda: no vende
        productos ni gestiona pagos ni envíos. Cuando se menciona un producto o categoría, puede
        incluir enlaces a tiendas de terceros, incluido Amazon.`;
const mail = `<a href="mailto:${SITE.email}">${SITE.email}</a>`;
const filled = (v) => v && !/PENDIENTE/i.test(v);
const L = SITE.legal || {};

function wrap(title, body) {
  return `
  ${pageHero({ eyebrow: "Legal", title })}
  <section class="section">
    <div class="wrap prose">
      <p class="updated">Última actualización: ${UPDATED}</p>
${body}
    </div>
  </section>
  `;
}

function avisoLegal() {
  const titular = [
    filled(L.titular) && `<li><strong>Titular:</strong> ${L.titular}</li>`,
    filled(L.nif) && `<li><strong>NIF:</strong> ${L.nif}</li>`,
    filled(L.domicilio) && `<li><strong>Domicilio:</strong> ${L.domicilio}</li>`,
    filled(L.registro) && `<li><strong>Datos registrales:</strong> ${L.registro}</li>`,
  ].filter(Boolean).join("\n        ");
  const html = wrap("Aviso legal", `
      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los datos
        de este sitio web:
      </p>
      <ul>
        <li><strong>Nombre comercial:</strong> ${SITE.name}</li>
        ${titular}
        <li><strong>Sitio web:</strong> ${SITE.domain}</li>
        <li><strong>Correo electrónico de contacto:</strong> ${mail}</li>
        <li><strong>Actividad:</strong> publicación de contenido editorial (guías de compra, comparativas y artículos) con enlaces de afiliado</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        ${OBJETO}
      </p>

      <h2>3. Programa de Afiliados de Amazon</h2>
      <p>
        ${SITE.name} participa en el Programa de Afiliados de Amazon EU, un programa de
        publicidad para afiliados diseñado para ofrecer a los sitios web un modo de obtener
        comisiones por publicidad, publicitando e incluyendo enlaces a Amazon.es.
        ${SITE.amazonDisclaimer}
      </p>
      <p>
        Comprar a través de estos enlaces no tiene ningún coste adicional para quien compra.
        Los precios, la disponibilidad, los envíos y las devoluciones de los productos son
        responsabilidad exclusiva de Amazon o del vendedor correspondiente, y pueden cambiar en
        cualquier momento. Por eso este sitio no muestra precios: consulta siempre el precio
        vigente en la ficha de Amazon.
      </p>

      <h2>4. Independencia editorial</h2>
      <p>
        La selección de productos se basa en criterios propios que se explican en cada guía
        (valoraciones y número de opiniones de compradores reales, características y relación
        calidad-precio). Ningún fabricante paga por aparecer ni por su posición en los rankings.
        La comisión de afiliado no influye en qué productos se recomiendan.
      </p>

      <h2>5. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, guías y artículos publicados en ${SITE.name} son de elaboración propia,
        salvo que se indique lo contrario, y están protegidos por la normativa de propiedad
        intelectual. Se permite citar y enlazar su contenido indicando la fuente; no se permite
        su reproducción total o parcial con fines comerciales sin autorización previa. Las
        marcas y nombres de productos citados pertenecen a sus respectivos titulares y se
        mencionan solo con fines informativos.
      </p>

      <h2>6. Condiciones de uso</h2>
      <p>
        El acceso a este sitio es gratuito y no requiere registro. Quien lo visita se compromete
        a hacer un uso adecuado de los contenidos y a no emplearlos para fines ilícitos o
        lesivos para terceros.
      </p>

      <h2>7. Responsabilidad</h2>
      <p>
        Los contenidos tienen carácter informativo y se revisan periódicamente, pero pueden
        quedar desactualizados (por ejemplo, si un fabricante cambia un modelo). ${SITE.name}
        no se responsabiliza de las decisiones de compra tomadas a partir de ellos ni garantiza
        la disponibilidad ininterrumpida del sitio. Si detectas un error, puedes comunicarlo en
        ${mail} y se corregirá lo antes posible.
      </p>

      <h2>8. Enlaces a terceros</h2>
      <p>
        Este sitio contiene enlaces a páginas de terceros, principalmente Amazon.es.
        ${SITE.name} no controla ni se hace responsable del contenido, las políticas de
        privacidad o las prácticas de esos sitios externos.
      </p>

      <h2>9. Legislación aplicable y jurisdicción</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia,
        las partes se someterán a los juzgados y tribunales que correspondan conforme a la
        normativa vigente; cuando quien visita el sitio tenga la condición de consumidor, serán
        competentes los de su domicilio.
      </p>`);

  return {
    route: "legal/aviso-legal.html",
    path: "/legal/aviso-legal.html",
    title: "Aviso legal",
    description: `Aviso legal de ${SITE.name}: datos del sitio, condiciones de uso, afiliación a Amazon e independencia editorial.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Aviso legal" }],
    html,
  };
}

function politicaPrivacidad() {
  const quien = filled(L.titular) ? `${L.titular}${filled(L.nif) ? ` (NIF ${L.nif})` : ""}, titular de ${SITE.name}` : `el titular de ${SITE.name}`;
  const html = wrap("Política de privacidad", `
      <p>
        En ${SITE.name} tratamos los mínimos datos posibles. Esta política explica cuáles, para
        qué y qué derechos tienes, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley
        Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales
        (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento es ${quien}. Puedes contactar para cualquier cuestión
        sobre privacidad en ${mail}.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><strong>Correos electrónicos que nos envíes:</strong> tu dirección y lo que incluyas en el mensaje.</li>
        <li><strong>Datos técnicos de navegación:</strong> el servidor que aloja la web registra de forma automática datos como la dirección IP, el navegador y la página visitada, necesarios para servir el sitio y protegerlo frente a abusos.</li>
        <li><strong>Tu elección sobre el aviso de cookies</strong>, guardada solo en tu propio navegador.</li>
      </ul>
      <p>
        Este sitio no tiene formularios de registro, no pide datos para acceder a los
        contenidos y no utiliza herramientas de analítica ni de publicidad personalizada.
      </p>

      <h2>3. Finalidad y base legal</h2>
      <ul>
        <li><strong>Responder a tus mensajes:</strong> base legal, tu consentimiento al escribirnos (art. 6.1.a RGPD).</li>
        <li><strong>Servir el sitio web y mantener su seguridad:</strong> base legal, el interés legítimo en ofrecer un servicio que funcione y sea seguro (art. 6.1.f RGPD).</li>
      </ul>

      <h2>4. Conservación</h2>
      <p>
        Los correos se conservan el tiempo necesario para atender tu consulta y, después,
        durante los plazos en que pudieran derivarse responsabilidades legales. Los registros
        técnicos del servidor se eliminan de forma automática tras un periodo breve fijado por
        el proveedor de alojamiento.
      </p>

      <h2>5. Destinatarios y proveedores</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Para funcionar, el sitio se
        apoya en estos proveedores, que actúan como encargados del tratamiento:
      </p>
      <ul>
        <li><strong>Vercel Inc.</strong>: alojamiento de la web.</li>
        <li><strong>Google LLC (Gmail)</strong>: gestión del correo electrónico de contacto.</li>
      </ul>
      <p>
        Ambos pueden tratar datos fuera del Espacio Económico Europeo. Estas transferencias
        están amparadas por el Marco de Privacidad de Datos UE-EE. UU. y por las cláusulas
        contractuales tipo aprobadas por la Comisión Europea.
      </p>

      <h2>6. Enlaces a Amazon</h2>
      <p>
        Al hacer clic en un enlace de afiliado sales de este sitio. A partir de ese momento,
        Amazon trata tus datos como responsable independiente conforme a su propia política de
        privacidad y de cookies. ${SITE.name} no recibe ningún dato personal tuyo de Amazon:
        solo informes agregados de ventas sin identificar a quien compra.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación
        del tratamiento y portabilidad, así como retirar tu consentimiento en cualquier momento,
        escribiendo a ${mail}. Si consideras que no se han atendido correctamente, puedes
        presentar una reclamación ante la Agencia Española de Protección de Datos
        (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).
      </p>

      <h2>8. Menores de edad</h2>
      <p>
        Este sitio no está dirigido a menores de 14 años ni recoge conscientemente datos de
        ellos. Si eres padre, madre o tutor y crees que un menor nos ha facilitado datos,
        escríbenos y los eliminaremos.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        El sitio se sirve siempre mediante conexión cifrada (HTTPS) y aplicamos medidas
        razonables para proteger la información que nos confías.
      </p>

      <h2>10. Cambios en esta política</h2>
      <p>
        Si cambia la forma en que tratamos los datos (por ejemplo, al incorporar una
        herramienta de analítica), actualizaremos esta política y la fecha de revisión que
        aparece al principio, y pediremos tu consentimiento cuando sea necesario.
      </p>`);

  return {
    route: "legal/politica-privacidad.html",
    path: "/legal/politica-privacidad.html",
    title: "Política de privacidad",
    description: `Política de privacidad de ${SITE.name}: qué datos se tratan, con qué finalidad, proveedores y cómo ejercer tus derechos.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Política de privacidad" }],
    html,
  };
}

function politicaCookies() {
  const html = wrap("Política de cookies", `
      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies y tecnologías similares (como el almacenamiento local del navegador) son
        pequeños archivos o datos que un sitio web guarda en tu dispositivo para recordar
        información sobre tu visita.
      </p>

      <h2>2. Qué utiliza este sitio</h2>
      <p>
        ${SITE.name} no utiliza cookies de analítica, de publicidad ni de seguimiento. Solo
        guarda un dato técnico en el almacenamiento local de tu navegador para recordar tu
        elección sobre el aviso de cookies y no volver a mostrártelo en cada visita. Al ser
        estrictamente necesario, no requiere consentimiento (art. 22.2 LSSI-CE).
      </p>
      <table class="table">
        <thead>
          <tr><th scope="col">Nombre</th><th scope="col">Tipo</th><th scope="col">Titular</th><th scope="col">Finalidad</th><th scope="col">Duración</th></tr>
        </thead>
        <tbody>
          <tr><td>cookie_consent</td><td>Técnica (almacenamiento local)</td><td>Propia</td><td>Recordar tu elección sobre el aviso de cookies</td><td>Hasta que la borres desde tu navegador</td></tr>
        </tbody>
      </table>

      <h2>3. Cookies de Amazon al hacer clic en un enlace</h2>
      <p>
        Cuando pulsas un enlace a Amazon.es sales de este sitio. Amazon puede instalar entonces
        sus propias cookies, entre otras cosas para saber que la visita procede de ${SITE.name}
        y atribuir la compra al programa de afiliados. Esas cookies las gestiona Amazon como
        responsable, conforme a su
        <a href="https://www.amazon.es/cookies" target="_blank" rel="noopener nofollow">aviso de cookies</a>.
      </p>

      <h2>4. Cómo gestionar o eliminar las cookies</h2>
      <p>
        Puedes aceptar o rechazar desde el aviso que aparece en tu primera visita. También
        puedes borrar o bloquear las cookies y el almacenamiento local en cualquier momento
        desde la configuración de tu navegador:
        <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener nofollow">Chrome</a>,
        <a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" rel="noopener nofollow">Firefox</a>,
        <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener nofollow">Safari</a> y
        <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener nofollow">Edge</a>.
      </p>

      <h2>5. Cambios</h2>
      <p>
        Si en el futuro se incorporan cookies de analítica u otras no esenciales, se
        actualizará esta política y no se activarán hasta que las aceptes expresamente.
        Para cualquier duda, escribe a ${mail}.
      </p>`);

  return {
    route: "legal/politica-cookies.html",
    path: "/legal/politica-cookies.html",
    title: "Política de cookies",
    description: `Política de cookies de ${SITE.name}: qué se guarda en tu navegador, cookies de Amazon y cómo gestionarlas.`,
    breadcrumbsItems: [{ label: "Inicio", href: "/" }, { label: "Política de cookies" }],
    html,
  };
}

module.exports = { avisoLegal, politicaPrivacidad, politicaCookies };
