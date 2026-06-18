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
  var entered = false;
  function enterApp(user) {
    if (entered) return;            // защита от повторного входа по событию onAuth
    entered = true;
    console.log("[admin] login success → переключаю интерфейс на админку");
    var ue = $("#userEmail"); if (ue) ue.textContent = (user && user.email) || "";
    // Показ админки и загрузка товаров разделены: даже если загрузка упадёт,
    // интерфейс уже виден, а ошибка показывается ВНУТРИ админки.
    console.log("[admin] before show admin");
    show("app");
    console.log("[admin] after show admin (app.hidden =",
      document.getElementById("app") && document.getElementById("app").hidden, ")");
    console.log("[admin] before load products");
    loadProducts().then(function () { console.log("[admin] after load products"); });
  }
  function resetLoginBtn() {
    var btn = $("#loginBtn"); if (btn) { btn.disabled = false; btn.textContent = "Войти"; }
  }

  function initAuth() {
    var ADMIN_EMAIL = (window.AQUA_SUPABASE && window.AQUA_SUPABASE.adminEmail) || "admin@aquauzel.kz";

    $("#loginForm").addEventListener("submit", async function (e) {
      e.preventDefault();                                   // не перезагружаем страницу
      var btn = $("#loginBtn"), err = $("#loginError");
      err.hidden = true; btn.disabled = true; btn.textContent = "Вход…";
      try {
        var data = await S.signIn(ADMIN_EMAIL, $("#password").value);
        console.log("[admin] вход выполнен:", data && data.user && data.user.email);
        resetLoginBtn();
        enterApp(data && data.user);                        // заходим сразу по результату
      } catch (ex) {
        console.error("[admin] ошибка входа:", ex);
        err.textContent = "Не удалось войти: " + (ex && ex.message ? ex.message : "проверьте пароль и настройки Supabase");
        err.hidden = false;
        resetLoginBtn();
      }
    });

    $("#logoutBtn").addEventListener("click", async function () {
      try { await S.signOut(); } catch (e) { console.error(e); }
      entered = false; resetLoginBtn(); show("login");
    });

    // Восстановление уже существующей сессии при загрузке. На null НЕ сбрасываем
    // на логин (это вызывало «мигание» формы во время входа) — выход делается явно.
    S.onAuth(function (user) { if (user) enterApp(user); });
  }

  /* ---------- загрузка и рендер ---------- */
  function showLoadError(msg) {
    var el = $("#loadError"); if (!el) return;
    if (msg) { el.textContent = msg; el.hidden = false; } else { el.textContent = ""; el.hidden = true; }
  }
  async function loadProducts() {
    showLoadError("");                                  // сбросить прошлую ошибку
    try {
      state.products = (await S.getProducts()) || [];
      state.cats = Array.from(new Set(state.products.map(function (p) { return p.category; }).filter(Boolean))).sort();
      fillCats();
      render();
    } catch (e) {
      // Админка уже показана — товары не загрузились, но входом это не ломаем.
      console.error("[admin] ошибка загрузки товаров:", e);
      var m = (e && e.message) ? e.message : "ошибка сети";
      toast("Ошибка загрузки товаров: " + m, true);
      showLoadError("Не удалось загрузить товары: " + m + ". Админка доступна — обновите страницу или повторите позже.");
    }
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
    var busy = $(".adm-photo-busy", node);
    function setPhoto(url) {
      node.dataset.image = url || "";
      if (url) { prev.src = url; prev.hidden = false; ph.hidden = true; del.hidden = false; }
      else { prev.removeAttribute("src"); prev.hidden = true; ph.hidden = false; del.hidden = true; }
    }
    if (p.image) setPhoto(p.image);
    $(".f-name", node).value = p.name || "";
    $(".f-pack", node).value = p.pack_quantity || "";
    $(".f-price", node).value = (p.price === 0 || p.price) ? p.price : "";
    $(".f-cat", node).value = p.category || "";
    $(".f-char", node).value = p.characteristics || "";
    $(".f-stock", node).checked = p.in_stock !== false;

    node.querySelectorAll("input,textarea").forEach(function (f) {
      f.addEventListener("input", function () { node.classList.add("dirty"); });
    });

    // фото: камера/галерея -> валидация/сжатие/загрузка -> превью (заменяет старое фото)
    async function handlePhotoFile(file) {
      if (!file) return;
      if (busy) busy.hidden = false;
      node.classList.add("photo-uploading");
      try {
        var oldUrl = node.dataset.image;
        var up = await S.uploadImage(file);
        setPhoto(up.url);
        node.classList.add("dirty");
        if (oldUrl && oldUrl !== up.url) S.deleteImageByUrl(oldUrl);   // удаляем заменённое фото из хранилища
        toast(oldUrl ? "Фото заменено — не забудьте «Сохранить»" : "Фото загружено — не забудьте «Сохранить»");
      } catch (ex) { toast(ex.message, true); }
      finally { if (busy) busy.hidden = true; node.classList.remove("photo-uploading"); }
    }
    node.querySelectorAll(".adm-photo-btn input").forEach(function (inp) {
      inp.addEventListener("change", function (e) { var f = e.target.files[0]; e.target.value = ""; handlePhotoFile(f); });
    });
    del.addEventListener("click", function () {
      if (!node.dataset.image) return;
      if (!confirm("Удалить фото товара?")) return;
      var u = node.dataset.image; setPhoto(""); node.classList.add("dirty");
      if (u) S.deleteImageByUrl(u);
      toast("Фото удалено — не забудьте «Сохранить»");
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

  /* ---------- пасхалка: 20 кликов по логотипу компании в админке ----------
     Логотип НЕ ведёт на сайт (это <button>), клики просто копятся; на 20-м
     показывается «Вова». Картинку можно заменить, если успеть кликнуть по ней,
     пока выглядывает — замена хранится только локально (у покупателей всегда
     оригинал, см. app.js). */
  function initEgg() {
    var trigger = $(".adm-brand"), vova = document.getElementById("vova"),
        file = document.getElementById("vovaFile"), clicks = 0, busy = false;
    if (!trigger || !vova) return;
    function eggSrc() { try { return localStorage.getItem("aqua_egg_img") || vova.dataset.src; } catch (e) { return vova.dataset.src; } }
    trigger.title = "🙂";
    trigger.addEventListener("click", function (e) { e.preventDefault(); if (++clicks >= 20 && !busy) { clicks = 0; play(); } });
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

  /* ---------- вид отображения: карточки / список / компактно ---------- */
  var VIEW_KEY = "aqua_admin_view";
  function getView() { try { return localStorage.getItem(VIEW_KEY) || "cards"; } catch (e) { return "cards"; } }
  function applyView(v) {
    v = (v === "list" || v === "compact") ? v : "cards";
    var wrap = $("#products");
    if (wrap) { wrap.classList.remove("view-cards", "view-list", "view-compact"); wrap.classList.add("view-" + v); }
    try { localStorage.setItem(VIEW_KEY, v); } catch (e) {}
  }

  /* ---------- старт ---------- */
  function start() {
    console.log("[admin] AQUA_SUPABASE найден:", !!window.AQUA_SUPABASE,
      "| Supabase SDK:", typeof window.supabase !== "undefined",
      "| client настроен:", !!(S && S.isConfigured()));
    if (!S || !S.isConfigured()) {
      console.warn("[admin] Supabase не настроен — проверьте url и anonKey в assets/js/supabase-config.js");
      show("needConfig"); return;
    }
    var em = $("#email");
    if (em) em.value = (window.AQUA_SUPABASE && window.AQUA_SUPABASE.adminEmail) || "admin@aquauzel.kz";
    initAuth();
    ["search", "filterCat", "filterStock", "sortBy"].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.addEventListener(id === "search" ? "input" : "change", render);
    });
    var add = $("#addBtn"); if (add) add.addEventListener("click", addBlank);
    var vm = $("#viewMode");
    if (vm) { vm.value = getView(); vm.addEventListener("change", function () { applyView(vm.value); }); }
    applyView(getView());
    initEgg();
    show("login");
  }
  // запускаемся надёжно, даже если DOMContentLoaded уже произошёл
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
