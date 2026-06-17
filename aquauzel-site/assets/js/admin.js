/* ===================================================================
   AquaUzel — логика админки (вход, CRUD товаров, загрузка фото).
   Безопасность: вход через Supabase Auth (серверная проверка пароля),
   запись в БД/Storage разрешена политиками RLS только авторизованным.
   =================================================================== */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var S = window.AquaStore;
  var state = { products: [], cats: [] };

  function show(id) {
    ["needConfig", "login", "app"].forEach(function (s) {
      var n = document.getElementById(s); if (n) n.hidden = (s !== id);
    });
  }
  function toast(msg, err) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.toggle("err", !!err); t.hidden = false;
    requestAnimationFrame(function () { t.classList.add("show"); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.hidden = true; }, 300); }, 2600);
  }

  /* ---------- вход ---------- */
  function initAuth() {
    $("#loginForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = $("#loginBtn"), err = $("#loginError");
      err.hidden = true; btn.disabled = true; btn.textContent = "Вход…";
      try {
        await S.signIn($("#email").value.trim(), $("#password").value);
      } catch (ex) {
        err.textContent = "Не удалось войти: " + (ex.message || "проверьте email и пароль");
        err.hidden = false;
      } finally { btn.disabled = false; btn.textContent = "Войти"; }
    });
    $("#logoutBtn").addEventListener("click", function () { S.signOut(); });

    S.onAuth(function (user) {
      if (user) { $("#userEmail").textContent = user.email || ""; show("app"); loadProducts(); }
      else { show("login"); }
    });
  }

  /* ---------- загрузка и рендер ---------- */
  async function loadProducts() {
    try {
      state.products = (await S.getProducts()) || [];
      state.cats = Array.from(new Set(state.products.map(function (p) { return p.category; }).filter(Boolean))).sort();
      fillCats();
      render();
    } catch (e) { toast("Ошибка загрузки: " + e.message, true); }
  }

  function fillCats() {
    var dl = $("#catList"), sel = $("#filterCat");
    dl.innerHTML = state.cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join("");
    var cur = sel.value;
    sel.innerHTML = '<option value="">Все категории</option>' +
      state.cats.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + "</option>"; }).join("");
    sel.value = cur;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function filtered() {
    var q = $("#search").value.trim().toLowerCase();
    var cat = $("#filterCat").value, st = $("#filterStock").value, by = $("#sortBy").value;
    var list = state.products.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (st === "1" && !p.in_stock) return false;
      if (st === "0" && p.in_stock) return false;
      if (q) { var hay = (p.name + " " + p.category + " " + (p.characteristics || "")).toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    });
    list.sort(function (a, b) {
      if (by === "price") return (a.price || 0) - (b.price || 0);
      if (by === "category") return (a.category || "").localeCompare(b.category || "", "ru") || (a.name || "").localeCompare(b.name || "", "ru");
      if (by === "updated") return (b.updated_at || "").localeCompare(a.updated_at || "");
      return (a.name || "").localeCompare(b.name || "", "ru");
    });
    return list;
  }

  function render() {
    var wrap = $("#products"); wrap.innerHTML = "";
    var list = filtered();
    list.forEach(function (p) { wrap.appendChild(buildCard(p)); });
    $("#count").textContent = "Показано: " + list.length + " из " + state.products.length;
    $("#empty").hidden = state.products.length !== 0;
  }

  /* ---------- карточка товара ---------- */
  function buildCard(p) {
    var node = $("#cardTpl").content.firstElementChild.cloneNode(true);
    node.dataset.id = p.id || "";
    node.dataset.image = p.image || "";
    var prev = $(".adm-prev", node), ph = $(".adm-photo-ph", node), del = $(".adm-photo-del", node);
    if (p.image) { prev.src = p.image; prev.hidden = false; ph.hidden = true; del.hidden = false; }
    $(".f-name", node).value = p.name || "";
    $(".f-pack", node).value = p.pack_quantity || "";
    $(".f-price", node).value = (p.price === 0 || p.price) ? p.price : "";
    $(".f-cat", node).value = p.category || "";
    $(".f-char", node).value = p.characteristics || "";
    $(".f-stock", node).checked = p.in_stock !== false;

    node.querySelectorAll("input,textarea").forEach(function (f) {
      f.addEventListener("input", function () { node.classList.add("dirty"); });
    });

    // фото: выбор -> валидация/сжатие/загрузка -> превью
    $(".adm-photo-btn input", node).addEventListener("change", async function (e) {
      var file = e.target.files[0]; if (!file) return;
      var label = $(".adm-photo-btn span", node), old = label.textContent;
      label.textContent = "Загрузка…";
      try {
        var oldUrl = node.dataset.image;
        var up = await S.uploadImage(file);
        node.dataset.image = up.url;
        prev.src = up.url; prev.hidden = false; ph.hidden = true; del.hidden = false;
        node.classList.add("dirty");
        if (oldUrl && oldUrl !== up.url) S.deleteImageByUrl(oldUrl);
        toast("Фото загружено — не забудьте «Сохранить»");
      } catch (ex) { toast(ex.message, true); }
      finally { label.textContent = old; e.target.value = ""; }
    });
    del.addEventListener("click", function () {
      var u = node.dataset.image; node.dataset.image = "";
      prev.hidden = true; ph.hidden = false; del.hidden = true; node.classList.add("dirty");
      if (u) S.deleteImageByUrl(u);
    });

    // сохранить
    $(".f-save", node).addEventListener("click", async function () {
      var name = $(".f-name", node).value.trim();
      if (!name) { toast("Укажите наименование", true); return; }
      var prod = {
        id: node.dataset.id || null, name: name,
        pack_quantity: $(".f-pack", node).value.trim(),
        price: $(".f-price", node).value,
        characteristics: $(".f-char", node).value.trim(),
        category: $(".f-cat", node).value.trim() || "Без категории",
        in_stock: $(".f-stock", node).checked,
        image: node.dataset.image || null
      };
      var btn = this; btn.disabled = true;
      try {
        var saved = await S.saveProduct(prod);
        node.dataset.id = saved.id; node.classList.remove("dirty");
        toast("Сохранено");
        loadProducts();
      } catch (ex) { toast("Ошибка сохранения: " + ex.message, true); }
      finally { btn.disabled = false; }
    });

    // удалить
    $(".f-del", node).addEventListener("click", async function () {
      var id = node.dataset.id;
      if (!id) { node.remove(); return; }
      if (!confirm("Удалить позицию «" + ($(".f-name", node).value || "товар") + "»? Действие необратимо.")) return;
      try {
        if (node.dataset.image) S.deleteImageByUrl(node.dataset.image);
        await S.deleteProduct(id);
        toast("Удалено");
        loadProducts();
      } catch (ex) { toast("Ошибка удаления: " + ex.message, true); }
    });

    return node;
  }

  function addBlank() {
    var node = buildCard({ in_stock: true, category: $("#filterCat").value || "" });
    $("#products").prepend(node);
    $(".f-name", node).focus();
  }

  /* ---------- пасхалка: на админке можно заменить картинку «Вовы» ---------- */
  function initEgg() {
    var trigger = $(".adm-title"), vova = document.getElementById("vova"),
        file = document.getElementById("vovaFile"), clicks = 0, busy = false;
    if (!trigger || !vova) return;
    function eggSrc() { try { return localStorage.getItem("aqua_egg_img") || vova.dataset.src; } catch (e) { return vova.dataset.src; } }
    trigger.title = "🙂";
    trigger.addEventListener("click", function () { if (++clicks >= 20 && !busy) { clicks = 0; play(); } });
    vova.addEventListener("click", function () { if (vova.classList.contains("peek") && file) file.click(); });
    if (file) file.addEventListener("change", function (e) {
      var f = e.target.files[0]; e.target.value = "";
      if (!f || f.type.indexOf("image/") !== 0) return;
      var r = new FileReader();
      r.onload = function () { vova.setAttribute("src", r.result); try { localStorage.setItem("aqua_egg_img", r.result); } catch (x) {} };
      r.readAsDataURL(f);
    });
    function play() {
      busy = true; var s = eggSrc(); if (s && vova.getAttribute("src") !== s) vova.setAttribute("src", s);
      var n = 0;
      (function peek() {
        vova.classList.add("peek");
        setTimeout(function () { vova.classList.remove("peek");
          if (++n < 3) setTimeout(peek, 520); else setTimeout(function () { busy = false; }, 800);
        }, 1400);
      })();
    }
  }

  /* ---------- старт ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!S || !S.isConfigured()) { show("needConfig"); return; }
    var em = $("#email");
    if (em) em.value = (window.AQUA_SUPABASE && window.AQUA_SUPABASE.adminEmail) || "admin@aquauzel.kz";
    initAuth();
    ["search", "filterCat", "filterStock", "sortBy"].forEach(function (id) {
      var n = document.getElementById(id);
      n.addEventListener(id === "search" ? "input" : "change", render);
    });
    $("#addBtn").addEventListener("click", addBlank);
    initEgg();
    show("login");
  });
})();
