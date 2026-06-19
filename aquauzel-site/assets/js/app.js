/* ===================================================================
   AquaUzel — interactions, catalog & price rendering
   =================================================================== */
(function () {
  "use strict";
  var DATA = window.AQUA_PRICES || { categories: [], currency: "₸" };
  var CUR = DATA.currency || "₸";
  var RAW_PRODUCTS = [];   // сырые товары из Supabase (нужны для фото в PDF-прайсе)

  /* ---- icon library (Lucide-style, stroke) ---- */
  var ICONS = {
    pipe:    '<rect x="2.5" y="9" width="19" height="6" rx="3"/><path d="M7 9v6M12 9v6M17 9v6"/>',
    fitting: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    pe:      '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5s2.5 2 5 2c1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2c1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2c1.3 0 1.9-.5 2.5-1"/>',
    drain:   '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    tools:   '<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16 4.6a5.56 5.56 0 0 0-3.93-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h.86c.85 0 1.65.32 2.25.92l1.25 1.25"/>',
    rubber:  '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84zM2 12.5l8.58 3.91a2 2 0 0 0 1.66 0L22 12.5M2 17.5l8.58 3.91a2 2 0 0 0 1.66 0L22 17.5"/>',
    roll:    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3"/>',
    shield:  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    tag:     '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.83 8.83a2 2 0 0 0 2.83 0l7.17-7.17a2 2 0 0 0 0-2.83z"/><path d="M7 7h.01"/>',
    truck:   '<path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v11h-3"/><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1"/><circle cx="7.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
    chat:    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
    arrow:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
    empty:   '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
  };
  function svg(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || "") + "</svg>";
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function isPriceCol(label) { return /цена/i.test(label); }
  function fmtPrice(v) {
    var s = String(v).replace(",", ".").trim();
    if (s === "" || s === "-") return '<span class="dim">—</span>';
    var n = Number(s);
    if (!isFinite(n)) return esc(v);
    var int = Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ");
    return int + ' <span class="cur">' + CUR + "</span>";
  }

  /* ---- static content: advantages ---- */
  var FEATURES = [
    { ic: "shield", t: "Надёжное качество", d: "Полипропилен PN20/25, латунная и нержавеющая фурнитура, проверенные производители." },
    { ic: "tag", t: "Опт и розница", d: "Выгодные цены за упаковку и коробку, гибкие условия для монтажников и магазинов." },
    { ic: "truck", t: "Доставка по РК", d: "Отгрузим со склада и доставим заказ в ваш город по Казахстану." },
    { ic: "chat", t: "Подбор и консультация", d: "Поможем рассчитать объём, подобрать диаметры, отводы и изоляцию под задачу." }
  ];

  function renderFeatures() {
    var wrap = $("#advantages-grid");
    if (!wrap) return;
    FEATURES.forEach(function (f) {
      var card = el("article", "feature");
      card.innerHTML = '<div class="f-ico">' + svg(f.ic) + "</div><h3>" + esc(f.t) + "</h3><p>" + esc(f.d) + "</p>";
      wrap.appendChild(card);
    });
  }

  /* ---- catalog ---- */
  function renderCatalog() {
    var wrap = $("#catalog-grid");
    if (!wrap) return;
    DATA.categories.forEach(function (cat, i) {
      var card = el("button", "cat-card");
      card.type = "button";
      card.setAttribute("aria-label", cat.name + " — перейти к ценам");
      card.innerHTML =
        '<span class="cat-go">' + svg("arrow") + "</span>" +
        '<div class="cat-ico">' + svg(cat.icon || "pipe") + "</div>" +
        "<h3>" + esc(cat.name) + "</h3>" +
        '<p class="cat-sub">' + esc(cat.subtitle || "") + "</p>" +
        '<span class="cat-count"><b>' + cat.count + "</b> позиций</span>";
      card.addEventListener("click", function () { selectCategory(i, true); });
      wrap.appendChild(card);
    });
  }

  /* ---- price tabs ---- */
  var activeCat = 0;
  function renderTabs() {
    var wrap = $("#price-tabs");
    if (!wrap) return;
    wrap.innerHTML = "";
    DATA.categories.forEach(function (cat, i) {
      var tab = el("button", "tab");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", i === activeCat ? "true" : "false");
      tab.innerHTML = svg(cat.icon || "pipe", "tab-ico") + "<span>" + esc(cat.name) +
        '</span><span class="tab-n">' + cat.count + "</span>";
      tab.addEventListener("click", function () { selectCategory(i, false); });
      wrap.appendChild(tab);
    });
  }

  function selectCategory(i, scroll) {
    activeCat = i;
    var search = $("#price-search");
    if (search && search.value) { search.value = ""; toggleClear(); }
    var tabs = document.querySelectorAll("#price-tabs .tab");
    tabs.forEach(function (t, idx) { t.setAttribute("aria-selected", idx === i ? "true" : "false"); });
    renderCategory(i);
    if (scroll) {
      var top = document.getElementById("prices");
      if (top) window.scrollTo({ top: top.offsetTop - 60, behavior: "smooth" });
    }
  }

  /* ---- build a price table for a group ---- */
  function buildGroup(group, query) {
    var card = el("section", "price-group");
    var head = el("div", "pg-head");
    head.innerHTML = '<span class="bar"></span><h3>' + esc(group.title) +
      '</h3><span class="pg-n">' + group.rows.length + " поз.</span>";
    card.appendChild(head);

    var scroll = el("div", "table-scroll");
    var table = el("table", "price price-zebra");
    var cols = group.columns;
    var priceIdx = cols.map(function (c, i) { return isPriceCol(c) ? i : -1; }).filter(function (i) { return i >= 0; });

    var thead = el("thead");
    var trh = el("tr");
    cols.forEach(function (c, i) {
      var th = el("th", (i === 0 ? "col-name" : (priceIdx.indexOf(i) >= 0 ? "price-col" : "")));
      th.textContent = c.replace(/·/g, "·");
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    var tbody = el("tbody");
    group.rows.forEach(function (row) {
      var tr = el("tr");
      cols.forEach(function (c, i) {
        var td = el("td");
        var val = row[i] == null ? "" : row[i];
        if (i === 0) {
          td.className = "col-name";
          td.innerHTML = query ? highlight(val) : esc(val);
        } else if (priceIdx.indexOf(i) >= 0) {
          td.className = "price-cell";
          td.innerHTML = fmtPrice(val);
        } else {
          td.innerHTML = query ? highlight(val) : esc(val);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    card.appendChild(scroll);
    return card;
  }

  function renderCategory(i) {
    var body = $("#price-body");
    body.innerHTML = "";
    var cat = DATA.categories[i];
    if (!cat) return;
    cat.groups.forEach(function (g) { body.appendChild(buildGroup(g, null)); });
  }

  /* ---- search ---- */
  var Q = "";
  function highlight(text) {
    var t = esc(text);
    if (!Q) return t;
    try {
      var re = new RegExp("(" + Q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      return t.replace(re, "<mark>$1</mark>");
    } catch (e) { return t; }
  }

  function runSearch(raw) {
    Q = raw.trim();
    var body = $("#price-body");
    var tabs = $("#price-tabs");
    if (!Q) { tabs.style.display = ""; renderCategory(activeCat); return; }
    tabs.style.display = "none";
    var needle = Q.toLowerCase();
    body.innerHTML = "";
    var total = 0;
    DATA.categories.forEach(function (cat) {
      cat.groups.forEach(function (g) {
        var matches = g.rows.filter(function (row) {
          return row.join(" ").toLowerCase().indexOf(needle) >= 0 ||
            g.title.toLowerCase().indexOf(needle) >= 0;
        });
        if (!matches.length) return;
        total += matches.length;
        var sub = { title: cat.name + " — " + g.title, columns: g.columns, rows: matches };
        body.appendChild(buildGroup(sub, Q));
      });
    });
    if (!total) {
      body.appendChild(el("div", "empty",
        svg("empty") + "<b>Ничего не найдено</b>Попробуйте другой запрос — например «труба 25» или «кран»."));
    }
  }

  function toggleClear() {
    var input = $("#price-search"), btn = $("#search-clear");
    if (btn) btn.hidden = !input.value;
  }

  function initSearch() {
    var input = $("#price-search"), btn = $("#search-clear");
    if (!input) return;
    var t;
    input.addEventListener("input", function () {
      toggleClear();
      clearTimeout(t);
      t = setTimeout(function () { runSearch(input.value); }, 160);
    });
    if (btn) btn.addEventListener("click", function () {
      input.value = ""; toggleClear(); input.focus(); runSearch("");
    });
  }

  /* ---- chrome: header, menu, to-top, year ---- */
  function initChrome() {
    var header = $(".site-header"), toTop = $("#toTop");
    function onScroll() {
      var y = window.scrollY;
      if (header) header.classList.toggle("scrolled", y > 12);
      if (toTop) toTop.classList.toggle("show", y > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // easter egg (публичная страница): 20 кликов по логотипу — «Вова» выглядывает снизу.
    // Картинка ВСЕГДА оригинальная; замена изображения доступна только в админке.
    var brand = $(".brand"), vova = $("#vova"), vovaClicks = 0, vovaBusy = false;
    if (brand && vova) {
      brand.addEventListener("click", function () {
        if (++vovaClicks >= 20 && !vovaBusy) { vovaClicks = 0; playVova(); }
      });
    }
    function playVova() {
      vovaBusy = true;
      if (vova.dataset.src && !vova.getAttribute("src")) vova.setAttribute("src", vova.dataset.src);
      var n = 0;
      (function peek() {
        vova.classList.add("peek");
        setTimeout(function () {
          vova.classList.remove("peek");
          if (++n < 3) setTimeout(peek, 520);
          else setTimeout(function () { vovaBusy = false; }, 800);
        }, 1400);
      })();
    }

    var burger = $("#burger"), menu = $("#mobileMenu");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!open));
        menu.hidden = open;
      });
      menu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          burger.setAttribute("aria-expanded", "false"); menu.hidden = true;
        });
      });
    }
    var year = $("#year");
    if (year) year.textContent = "© " + new Date().getFullYear();

    var statItems = $("#stat-items");
    if (statItems && DATA.totalItems) statItems.setAttribute("data-count", DATA.totalItems);
  }

  /* ---- effects: reveal, counters, spotlight, tilt, parallax, bubbles ---- */
  function initEffects() {
    var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var revealEls = document.querySelectorAll(
      ".section-head,.feature,.cat-card,.contact-card,.use-card,.about-visual,.about-copy,.cta-inner");
    revealEls.forEach(function (el, i) {
      el.setAttribute("data-reveal", "");
      el.style.transitionDelay = (i % 6) * 0.06 + "s";
    });
    if (RM || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    }

    var counters = document.querySelectorAll("[data-count]");
    function countUp(el) {
      var target = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "";
      if (RM) { el.textContent = target + suf; return; }
      var start = null;
      function step(ts) {
        start = start || ts;
        var p = Math.min((ts - start) / 1300, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (counters.length) {
      if (RM || !("IntersectionObserver" in window)) { counters.forEach(countUp); }
      else {
        var cio = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
        }, { threshold: 0.6 });
        counters.forEach(function (c) { cio.observe(c); });
      }
    }

    if (RM) return; // skip pointer/scroll motion when reduced-motion is on

    var hero = $(".hero"), spot = $(".spotlight");
    if (hero && spot) hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      spot.style.setProperty("--mx", (e.clientX - r.left) / r.width * 100 + "%");
      spot.style.setProperty("--my", (e.clientY - r.top) / r.height * 100 + "%");
    });

    if (window.matchMedia("(pointer:fine)").matches) {
      document.querySelectorAll(".cat-card,.use-card").forEach(function (card) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var rx = (e.clientX - r.left) / r.width - 0.5, ry = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "perspective(820px) rotateY(" + rx * 7 + "deg) rotateX(" + (-ry * 7) + "deg)";
        });
        card.addEventListener("pointerleave", function () { card.style.transform = ""; });
      });
    }

    var grid = $(".bg-grid"), hv = $(".hero-visual"), ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (grid) grid.style.transform = "translateY(" + y * 0.12 + "px)";
        if (hv && y < 1000) hv.style.transform = "translateY(" + y * 0.04 + "px)";
        ticking = false;
      });
    }, { passive: true });

    var bc = $(".bubbles");
    if (bc) for (var i = 0; i < 14; i++) {
      var d = document.createElement("span"), s = 6 + Math.random() * 22;
      d.className = "bubble";
      d.style.width = d.style.height = s + "px";
      d.style.left = Math.random() * 100 + "%";
      d.style.animationDuration = 9 + Math.random() * 12 + "s";
      d.style.animationDelay = -Math.random() * 12 + "s";
      bc.appendChild(d);
    }
  }

  /* ===================================================================
     Скачивание прайса в PDF.
     Делаем это средствами самого браузера (печать → «Сохранить как PDF»):
     без сторонних библиотек, корректная кириллица и любые фото (в т.ч. webp
     и удалённые ссылки Supabase) — браузер рендерит их сам. Документ строится
     по образцу фирменного прайса: сверху повторяющаяся «шапка» с логотипом,
     адресом, телефоном и QR; ниже — данные по категориям с фото слева и
     таблицей справа.
     =================================================================== */
  function absUrl(rel) { try { return new URL(rel, document.baseURI).href; } catch (e) { return rel; } }
  function priceText(v) {
    var s = String(v == null ? "" : v).replace(",", ".").trim();
    if (s === "" || s === "-") return "—";
    var n = Number(s);
    if (!isFinite(n)) return esc(v);
    return Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ");
  }
  // Карта «категория → фото» (берём первое товарное фото в категории — как в образце).
  function imagesByCategory(products) {
    var map = {};
    (products || []).forEach(function (p) {
      var c = p && p.category ? p.category : "";
      if (c && p.image && !map[c]) map[c] = p.image;
    });
    return map;
  }

  function priceDocCss() {
    return [
      "@page{size:A4 portrait;margin:9mm}",
      "*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
      "html,body{margin:0;padding:0}",
      "body{font-family:Arial,'Segoe UI',Roboto,'PT Sans',sans-serif;color:#0b1424;font-size:11px}",
      ".page{width:100%;border-collapse:collapse}",
      ".page>thead{display:table-header-group}.page>tfoot{display:table-footer-group}",
      ".page>thead>tr>td,.page>tbody>tr>td,.page>tfoot>tr>td{padding:0}",
      // шапка (повторяется на каждой странице через <thead>)
      ".banner{display:flex;align-items:center;gap:10px;background:#0a0e1a;border-top:3px solid #2a9df4;border-bottom:3px solid #2a9df4;padding:8px 12px;margin-bottom:8px;color:#fff}",
      ".bn-qr{display:flex;align-items:center;gap:6px;width:172px}",
      ".bn-qr img{width:56px;height:56px;background:#fff;padding:3px;border-radius:6px}",
      ".bn-qr span{font-size:10px;font-weight:700;color:#cfe0f5;line-height:1.15}",
      ".bn-qr.right{justify-content:flex-end;text-align:right}",
      ".bn-mid{flex:1;text-align:center}",
      ".bn-logo{height:42px;object-fit:contain}",
      ".bn-addr{font-weight:800;font-size:14px;margin-top:3px}",
      ".bn-tel{font-size:12px;color:#dbe7fb;margin-top:1px}",
      // категории
      ".content{padding:0 1px}",
      ".cat{margin:0 0 11px}",
      ".cat-title{background:linear-gradient(180deg,#163a72,#1b4b8f);color:#fff;font-weight:800;font-size:13px;text-align:center;padding:5px 8px;border-radius:4px 4px 0 0;letter-spacing:.2px;break-after:avoid;page-break-after:avoid}",
      ".cat-layout{width:100%;border-collapse:collapse}",
      ".cat-img-cell{width:132px;vertical-align:top;padding:6px 8px 6px 0}",
      ".cat-img-cell img{width:124px;height:124px;object-fit:cover;border:1px solid #cfe0f5;border-radius:8px;background:#fff}",
      ".cat-data-cell{vertical-align:top}",
      ".grp-title{background:#2f6fd0;color:#fff;font-weight:700;font-size:11px;padding:3px 8px;margin:6px 0 0;break-after:avoid;page-break-after:avoid}",
      ".price{width:100%;border-collapse:collapse;margin-bottom:2px}",
      ".price th{background:#1b4b8f;color:#fff;font-weight:700;font-size:10.5px;padding:4px 6px;border:1px solid #16407a;text-align:left}",
      ".price th.thp{text-align:right}",
      ".price td{padding:3px 6px;border:1px solid #cfe0f5;font-size:10.5px;vertical-align:top}",
      ".price tr.alt td{background:#eaf2fd}",
      ".price td.tdp{text-align:right;font-weight:800;color:#0a3d8f;white-space:nowrap}",
      ".price tr{break-inside:avoid;page-break-inside:avoid}",
      ".foot{text-align:center;color:#5b6b85;font-size:9px;padding:6px 4px 2px;border-top:1px solid #cfe0f5;margin-top:6px}",
      ".empty{text-align:center;padding:48px;color:#5b6b85}"
    ].join("");
  }

  function buildPriceHTML(products) {
    var imgs = imagesByCategory(products || RAW_PRODUCTS);
    var dateStr = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

    var banner =
      '<div class="banner">' +
        '<div class="bn-qr"><img src="' + absUrl("assets/img/qr-instagram.png") + '" alt=""><span>@aquauzel_02<br>Instagram</span></div>' +
        '<div class="bn-mid">' +
          '<img class="bn-logo" src="' + absUrl("assets/img/logo-full.png") + '" alt="AquaUzel">' +
          '<div class="bn-addr">г. Алматы, ул. Амангельды, 70</div>' +
          '<div class="bn-tel">тел: +7 700 520 12 01 · WhatsApp · Instagram</div>' +
        '</div>' +
        '<div class="bn-qr right"><img src="' + absUrl("assets/img/qr-whatsapp.png") + '" alt=""><span>WhatsApp<br>написать</span></div>' +
      '</div>';

    var body = "";
    (DATA.categories || []).forEach(function (cat) {
      var img = imgs[cat.name];
      body += '<section class="cat"><div class="cat-title">' + esc(cat.name) + '</div>';
      body += '<table class="cat-layout"><tr>';
      if (img) body += '<td class="cat-img-cell"><img src="' + esc(img) + '" alt=""></td>';
      body += '<td class="cat-data-cell">';
      (cat.groups || []).forEach(function (g) {
        var cols = g.columns || [];
        if (g.title && g.title !== cat.name) body += '<div class="grp-title">' + esc(g.title) + '</div>';
        // оставляем только непустые столбцы — таблица не «распухает» лишними колонками
        var keep = cols.map(function (c, i) {
          return (g.rows || []).some(function (r) { return r[i] != null && String(r[i]).trim() !== ""; }) ? i : -1;
        }).filter(function (i) { return i >= 0; });
        if (!keep.length) return;
        body += '<table class="price"><thead><tr>';
        keep.forEach(function (i) {
          var label = cols[i], price = isPriceCol(label);
          if (price && !/[₸]|тенге/i.test(label)) label = label + ", " + CUR;
          body += '<th class="' + (price ? "thp" : "") + '">' + esc(label) + '</th>';
        });
        body += '</tr></thead><tbody>';
        (g.rows || []).forEach(function (r, ri) {
          body += '<tr' + (ri % 2 ? ' class="alt"' : '') + '>';
          keep.forEach(function (i) {
            var price = isPriceCol(cols[i]);
            var val = price ? priceText(r[i]) : (r[i] == null ? "" : esc(r[i]));
            body += '<td class="' + (price ? "tdp" : "") + '">' + val + '</td>';
          });
          body += '</tr>';
        });
        body += '</tbody></table>';
      });
      body += '</td></tr></table></section>';
    });
    if (!body) body = '<p class="empty">Прайс пока пуст.</p>';

    return '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
      '<base href="' + esc(document.baseURI) + '">' +
      '<title>Прайс AquaUzel — ' + esc(dateStr) + '</title>' +
      '<style>' + priceDocCss() + '</style></head><body>' +
      '<table class="page">' +
        '<thead><tr><td>' + banner + '</td></tr></thead>' +
        '<tbody><tr><td><div class="content">' + body + '</div></td></tr></tbody>' +
        '<tfoot><tr><td><div class="foot">AquaUzel · сантехника и инженерные системы · г. Алматы, ул. Амангельды, 70 · +7 700 520 12 01 · Прайс от ' +
          esc(dateStr) + ' · цены в ' + esc(CUR) + ', указаны справочно и не являются публичной офертой</div></td></tr></tfoot>' +
      '</table></body></html>';
  }

  function restoreDlBtn(btn) {
    if (!btn) return;
    btn.disabled = false; btn.classList.remove("is-busy");
    var l = btn.querySelector(".dl-label"); if (l) l.textContent = "Скачать прайс (PDF)";
  }

  function downloadPricePDF(w, btn) {
    // Прайс печатаем в ОТДЕЛЬНОЙ вкладке (в ней только прайс). Важно для телефона:
    // на Android печать из скрытого iframe выводит весь сайт целиком, а отдельная
    // вкладка печатается как надо. Окно открыто синхронно в обработчике клика.
    var html = buildPriceHTML(RAW_PRODUCTS);
    if (!w) { printPriceViaIframe(html, btn); return; }     // попап заблокирован → запасной путь
    try { w.document.open(); w.document.write(html); w.document.close(); }
    catch (e) { restoreDlBtn(btn); printPriceViaIframe(html, btn); return; }
    restoreDlBtn(btn);
    try { w.onafterprint = function () { try { w.close(); } catch (x) {} }; } catch (e) {}
    var imgs = Array.prototype.slice.call(w.document.images || []);
    var pending = imgs.filter(function (im) { return !im.complete; });
    var fired = false;
    function go() { if (fired) return; fired = true; try { w.focus(); w.print(); } catch (e) {} }
    if (!pending.length) { setTimeout(go, 350); return; }   // дать вкладке отрисоваться
    var done = 0;
    pending.forEach(function (im) {
      im.addEventListener("load", function () { if (++done >= pending.length) go(); });
      im.addEventListener("error", function () { if (++done >= pending.length) go(); });
    });
    setTimeout(go, 6000);                                    // не ждём картинки вечно
  }

  // Запасной путь (десктоп или заблокированный попап): печать через скрытый iframe.
  function printPriceViaIframe(html, btn) {
    var iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(iframe);
    var removed = false;
    function cleanup() { if (removed) return; removed = true; if (iframe.parentNode) iframe.parentNode.removeChild(iframe); }
    var win = iframe.contentWindow, doc = win.document;
    doc.open(); doc.write(html); doc.close();
    function go() {
      restoreDlBtn(btn);
      try {
        win.focus();
        if ("onafterprint" in win) win.onafterprint = function () { setTimeout(cleanup, 300); };
        win.print();
        setTimeout(cleanup, 60000);
      } catch (e) { console.error("[price] печать не удалась:", e); cleanup(); }
    }
    var imgsEls = Array.prototype.slice.call(doc.images || []);
    var pending = imgsEls.filter(function (im) { return !im.complete; });
    if (!pending.length) { setTimeout(go, 80); return; }
    var done = 0, fired = false;
    function tick() { if (fired) return; if (++done >= pending.length) { fired = true; go(); } }
    pending.forEach(function (im) { im.addEventListener("load", tick); im.addEventListener("error", tick); });
    setTimeout(function () { if (!fired) { fired = true; go(); } }, 6000);
  }

  // небольшой публичный хук — удобно для отладки/перегенерации прайса
  window.AquaPricePDF = { html: buildPriceHTML };

  /* ---- boot ---- */
  function renderPrice() { renderCatalog(); renderTabs(); renderCategory(0); initSearch(); }
  async function boot() {
    if (window.AquaStore && AquaStore.isConfigured()) {
      try {
        var products = await AquaStore.getProducts();
        if (products && products.length) {
          // для прайса/PDF берём только товары «в наличии» (фото — тоже из них)
          RAW_PRODUCTS = products.filter(function (p) { return p && p.in_stock !== false; });
          DATA = AquaStore.toPriceData(products, CUR); window.AQUA_PRICES = DATA;
        }
      } catch (e) { /* откат на статический прайс */ }
    }
    renderPrice();
    var dl = document.getElementById("dlPrice");
    if (dl) dl.addEventListener("click", function () {
      if (dl.disabled) return;
      // окно открываем СИНХРОННО в обработчике клика, иначе мобильный браузер
      // заблокирует попап. Дальше заполняем его и печатаем.
      var w = window.open("", "_blank");
      dl.disabled = true; dl.classList.add("is-busy");
      var l = dl.querySelector(".dl-label"); if (l) l.textContent = "Готовим PDF…";
      downloadPricePDF(w, dl);
    });
    initEffects();
  }
  document.addEventListener("DOMContentLoaded", function () {
    renderFeatures();
    initChrome();
    boot();
  });
})();
