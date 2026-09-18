(function () {
  "use strict";

  // --- Correo ofuscado -------------------------------------------------
  // Los enlaces de correo no llevan la dirección en el HTML (data-correo
  //="usuario|dominio") para frenar a los robots recolectores sin romper
  // el mailto real ni la accesibilidad: sin JS se ve el texto de aviso.
  function initMail() {
    var links = document.querySelectorAll(".js-mail");
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      var parts = (el.getAttribute("data-correo") || "").split("|");
      if (parts.length !== 2) continue;
      var address = parts[0] + "@" + parts[1];
      el.setAttribute("href", "mailto:" + address);
      el.textContent = address;
    }
  }

  // --- Menú móvil --------------------------------------------------------
  // El menú es un <details>/<summary> nativo (funciona sin JS). Con JS se
  // cierra solo al elegir un enlace o al pulsar Escape.
  function initMobileNav() {
    var wrap = document.querySelector(".nav-mobile-wrap");
    if (!wrap) return;
    var links = wrap.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        wrap.removeAttribute("open");
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && wrap.hasAttribute("open")) {
        wrap.removeAttribute("open");
      }
    });
  }

  // --- Aviso de cookies ----------------------------------------------------
  var COOKIE_KEY = "ei_cookie_consent"; // "accepted" | "rejected"

  function initCookieBanner() {
    var bar = document.getElementById("cookiebar");
    if (!bar) return;
    var stored = null;
    try {
      stored = window.localStorage.getItem(COOKIE_KEY);
    } catch (err) {
      stored = null;
    }
    if (!stored) bar.hidden = false;

    var accept = document.getElementById("cookie-accept");
    var reject = document.getElementById("cookie-reject");
    if (accept) {
      accept.addEventListener("click", function () {
        try {
          window.localStorage.setItem(COOKIE_KEY, "accepted");
        } catch (err) {}
        bar.hidden = true;
      });
    }
    if (reject) {
      reject.addEventListener("click", function () {
        try {
          window.localStorage.setItem(COOKIE_KEY, "rejected");
        } catch (err) {}
        bar.hidden = true;
      });
    }
  }

  function initProductFilter() {
    var bar = document.querySelector("[data-product-filter]");
    if (!bar) return;
    var buttons = bar.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".product-card-wrap[data-category]");
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var filter = btn.getAttribute("data-filter");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("is-active", buttons[i] === btn);
      }
      for (var j = 0; j < cards.length; j++) {
        var show = filter === "all" || cards[j].getAttribute("data-category") === filter;
        cards[j].style.display = show ? "" : "none";
      }
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initMail();
    initMobileNav();
    initCookieBanner();
    initProductFilter();
  });
})();
