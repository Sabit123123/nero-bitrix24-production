/* ===================================================================
   AquaUzel — слой данных (Supabase).
   Используется и публичной частью (чтение), и админкой (CRUD + загрузка фото).
   Если Supabase не настроен — getProducts() возвращает null, и публичная
   часть откатывается на статический прайс (window.AQUA_PRICES).
   =================================================================== */
(function () {
  "use strict";
  var cfg = window.AQUA_SUPABASE || {};
  var BUCKET = cfg.bucket || "product-images";
  var client = null;

  function configured() {
    return !!(cfg.url && cfg.anonKey && /^https?:\/\//.test(cfg.url));
  }
  if (configured() && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  }

  /* ---- сопоставление категории и иконки (для публичных вкладок) ---- */
  function iconFor(cat) {
    var c = (cat || "").toLowerCase();
    if (/канализац/.test(c)) return "drain";
    if (/изоляц|каучук|рулон/.test(c)) return "rubber";
    if (/фитинг|кран|муфт|адаптер/.test(c)) return "fitting";
    if (/полиэтилен|пэ/.test(c)) return "pe";
    if (/инструм|крепёж|крепеж|комплект/.test(c)) return "tools";
    return "pipe";
  }
  function slug(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9а-я]+/gi, "-").replace(/^-|-$/g, "") || "cat";
  }

  /* ---- преобразование плоских товаров -> структура прайса для рендера ---- */
  function toPriceData(products, cur) {
    var byCat = {};
    var order = [];
    products.forEach(function (p) {
      var cat = p.category || "Без категории";
      if (!byCat[cat]) { byCat[cat] = []; order.push(cat); }
      byCat[cat].push(p);
    });
    var categories = order.map(function (cat, i) {
      var rows = byCat[cat].map(function (p) {
        return [
          p.name || "",
          p.pack_quantity || "",
          p.characteristics || "",
          p.in_stock ? "В наличии" : "Под заказ",
          (p.price === 0 || p.price) ? String(p.price) : ""
        ];
      });
      return {
        id: slug(cat) + "-" + i,
        name: cat,
        subtitle: "",
        icon: iconFor(cat),
        count: rows.length,
        groups: [{
          title: cat,
          columns: ["Наименование", "Упаковка", "Характеристики", "Наличие", "Цена"],
          rows: rows
        }]
      };
    });
    return { currency: cur || "₸", categories: categories, totalItems: products.length, __fromAdmin: true };
  }

  /* ---- публичное чтение ---- */
  async function getProducts() {
    if (!client) return null;
    var res = await client.from("products").select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (res.error) throw res.error;
    return res.data || [];
  }

  /* ---- auth (админка) ---- */
  async function signIn(email, password) {
    if (!client) throw new Error("Supabase не настроен");
    var res = await client.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw res.error;
    return res.data;
  }
  async function signOut() { if (client) await client.auth.signOut(); }
  async function getUser() {
    if (!client) return null;
    var res = await client.auth.getUser();
    return res.data ? res.data.user : null;
  }
  // Колбэк откладываем через setTimeout, чтобы НЕ вызывать методы Supabase
  // внутри onAuthStateChange (иначе возможен deadlock клиента gotrue-js).
  function onAuth(cb) {
    if (!client) return;
    client.auth.onAuthStateChange(function (ev, s) {
      setTimeout(function () { cb(s ? s.user : null, ev); }, 0);
    });
  }

  /* ---- CRUD (требует входа; запись разрешена политиками RLS только authenticated) ---- */
  async function saveProduct(p) {
    if (!client) throw new Error("Supabase не настроен");
    var row = {
      name: p.name, pack_quantity: p.pack_quantity, price: p.price === "" ? null : Number(p.price),
      characteristics: p.characteristics, category: p.category, in_stock: !!p.in_stock,
      image: p.image || null, sort_order: p.sort_order || 0, updated_at: new Date().toISOString()
    };
    var res;
    if (p.id) res = await client.from("products").update(row).eq("id", p.id).select().single();
    else res = await client.from("products").insert(row).select().single();
    if (res.error) throw res.error;
    return res.data;
  }
  async function deleteProduct(id) {
    if (!client) throw new Error("Supabase не настроен");
    var res = await client.from("products").delete().eq("id", id);
    if (res.error) throw res.error;
  }

  /* ---- загрузка фото: валидация + сжатие + upload в Storage ---- */
  var ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
  var MAX_BYTES = 8 * 1024 * 1024; // 8 МБ исходник

  function compress(file, maxSide, quality) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height, s = Math.min(1, maxSide / Math.max(w, h));
        var cw = Math.round(w * s), ch = Math.round(h * s);
        var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
        cv.getContext("2d").drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { b ? resolve(b) : reject(new Error("Не удалось обработать изображение")); },
          "image/webp", quality || 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Файл не является изображением")); };
      img.src = url;
    });
  }

  async function uploadImage(file) {
    if (!client) throw new Error("Supabase не настроен");
    if (!file) throw new Error("Файл не выбран");
    if (ALLOWED.indexOf(file.type) < 0) throw new Error("Разрешены только изображения (jpg, png, webp, gif, heic)");
    if (file.size > MAX_BYTES) throw new Error("Файл больше 8 МБ");
    var blob = await compress(file, 1280, 0.82);
    var path = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".webp";
    var up = await client.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", upsert: false });
    if (up.error) throw up.error;
    var pub = client.storage.from(BUCKET).getPublicUrl(path);
    return { url: pub.data.publicUrl, path: path };
  }
  async function deleteImageByUrl(url) {
    if (!client || !url) return;
    var marker = "/" + BUCKET + "/";
    var i = url.indexOf(marker);
    if (i < 0) return;
    var path = url.slice(i + marker.length).split("?")[0];
    try { await client.storage.from(BUCKET).remove([path]); } catch (e) { /* не критично */ }
  }

  window.AquaStore = {
    isConfigured: configured,
    getProducts: getProducts,
    toPriceData: toPriceData,
    signIn: signIn, signOut: signOut, getUser: getUser, onAuth: onAuth,
    saveProduct: saveProduct, deleteProduct: deleteProduct,
    uploadImage: uploadImage, deleteImageByUrl: deleteImageByUrl
  };
})();
