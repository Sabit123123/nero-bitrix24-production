/* ===================================================================
   AquaUzel — interactions, catalog & price rendering
   =================================================================== */
(function () {
  "use strict";
  var DATA = window.AQUA_PRICES || { categories: [], currency: "₸" };
  var CUR = DATA.currency || "₸";

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
    if (statItems && DATA.totalItems) statItems.textContent = DATA.totalItems + "+";
  }

  /* ---- boot ---- */
  document.addEventListener("DOMContentLoaded", function () {
    renderFeatures();
    renderCatalog();
    renderTabs();
    renderCategory(0);
    initSearch();
    initChrome();
  });
})();
