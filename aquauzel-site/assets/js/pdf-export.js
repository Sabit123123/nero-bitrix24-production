/* ===================================================================
   AquaUzel — генерация СКАЧИВАЕМОГО PDF прайса (jsPDF + autotable).
   Кириллический шрифт (subset) и тяжёлые библиотеки грузятся лениво —
   только при нажатии «Скачать прайс (PDF)». На выходе — файл .pdf.
   API: window.AquaPdf.download({ categories, currency }) -> Promise
   =================================================================== */
(function () {
  "use strict";
  var V = "1"; // версия ассетов
  function absUrl(rel) { try { return new URL(rel, document.baseURI).href; } catch (e) { return rel; } }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (document.querySelector('script[data-pdf="' + src + '"]')) return res();
      var s = document.createElement("script");
      s.src = src; s.dataset.pdf = src; s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error("Не удалось загрузить " + src)); };
      document.head.appendChild(s);
    });
  }
  async function ensureLibs() {
    if (!(window.jspdf && window.jspdf.jsPDF)) await loadScript("assets/js/vendor/jspdf.umd.min.js?v=" + V);
    if (!window.AQUA_PDF_FONT) await loadScript("assets/js/pdf-font.js?v=" + V);
    // autotable должен подключаться ПОСЛЕ jspdf
    if (!(window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable)) {
      await loadScript("assets/js/vendor/jspdf.plugin.autotable.min.js?v=" + V);
    }
  }

  // загрузка картинки -> dataURL (через canvas). Удалённые фото Supabase отдаются с CORS.
  function imgToDataURL(url, mime) {
    return new Promise(function (resolve) {
      if (!url) return resolve(null);
      var im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = function () {
        try {
          var cv = document.createElement("canvas");
          cv.width = im.naturalWidth || 64; cv.height = im.naturalHeight || 64;
          var ctx = cv.getContext("2d");
          if (mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); }
          ctx.drawImage(im, 0, 0);
          resolve({ data: cv.toDataURL(mime || "image/png", 0.85), w: cv.width, h: cv.height });
        } catch (e) { resolve(null); } // tainted/CORS — пропускаем фото
      };
      im.onerror = function () { resolve(null); };
      im.src = url;
    });
  }

  function isPriceCol(label) { return /цена/i.test(label || ""); }
  function priceText(v, cur) {
    var s = String(v == null ? "" : v).replace(",", ".").trim();
    if (s === "" || s === "-") return "—";
    var n = Number(s);
    if (!isFinite(n)) return String(v);
    return Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ") + " " + cur;
  }

  async function download(opts) {
    opts = opts || {};
    var cats = opts.categories || [];
    var cur = opts.currency || "₸";
    await ensureLibs();

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: "pt", format: "a4", compress: true });

    // шрифт с кириллицей
    var F = window.AQUA_PDF_FONT;
    doc.addFileToVFS(F.file, F.b64);
    doc.addFont(F.file, F.name, "normal");
    doc.addFont(F.file, F.name, "bold"); // алиас, чтобы fontStyle:bold не падал
    doc.setFont(F.name, "normal");

    // предзагрузка картинок шапки + фото товаров
    var logo = await imgToDataURL(absUrl("assets/img/logo-full.png"), "image/png");
    var qrIg = await imgToDataURL(absUrl("assets/img/qr-instagram.png"), "image/png");
    var qrWa = await imgToDataURL(absUrl("assets/img/qr-whatsapp.png"), "image/png");
    var urls = {};
    cats.forEach(function (c) {
      (c.groups || []).forEach(function (g) {
        (g.images || []).forEach(function (u) { if (u) urls[u] = 1; });
      });
    });
    var imgMap = {};
    await Promise.all(Object.keys(urls).map(function (u) {
      return imgToDataURL(u, "image/jpeg").then(function (r) { if (r) imgMap[u] = r; });
    }));

    var pw = doc.internal.pageSize.getWidth();
    var ph = doc.internal.pageSize.getHeight();
    var BAN = 66, M = 24;

    function banner() {
      doc.setFillColor(10, 14, 26); doc.rect(0, 0, pw, BAN, "F");
      doc.setDrawColor(42, 157, 244); doc.setLineWidth(2); doc.line(0, BAN, pw, BAN);
      if (logo) { var lw = 46, lh = lw * (logo.h / logo.w || 0.62); doc.addImage(logo.data, "PNG", pw / 2 - lw / 2, 6, lw, lh); }
      doc.setTextColor(255, 255, 255); doc.setFontSize(12);
      doc.text("г. Алматы, ул. Амангельды, 70", pw / 2, 44, { align: "center" });
      doc.setTextColor(219, 231, 251); doc.setFontSize(9);
      doc.text("тел: +7 700 520 12 01 · WhatsApp · Instagram", pw / 2, 57, { align: "center" });
      if (qrIg) doc.addImage(qrIg.data, "PNG", 14, 8, 42, 42);
      if (qrWa) doc.addImage(qrWa.data, "PNG", pw - 56, 8, 42, 42);
      doc.setTextColor(207, 224, 245); doc.setFontSize(7.5);
      doc.text("@aquauzel_02", 60, 24); doc.text("WhatsApp", pw - 60, 24, { align: "right" });
    }

    function catTitle(name, y) {
      doc.setFillColor(22, 58, 114); doc.rect(M, y, pw - M * 2, 20, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(11);
      doc.text(String(name), pw / 2, y + 14, { align: "center" });
      return y + 20;
    }

    banner();
    var cursorY = BAN + 14;

    cats.forEach(function (cat) {
      if (cursorY + 20 + 30 > ph - 26) { doc.addPage(); banner(); cursorY = BAN + 14; }
      cursorY = catTitle(cat.name, cursorY) + 2;

      (cat.groups || []).forEach(function (g) {
        var cols = g.columns || [];
        var keep = cols.map(function (c, i) {
          return (g.rows || []).some(function (r) { return r[i] != null && String(r[i]).trim() !== ""; }) ? i : -1;
        }).filter(function (i) { return i >= 0; });
        if (!keep.length) return;
        var hasImg = g.images && g.images.some(function (u) { return !!u; });

        var head = [];
        if (hasImg) head.push("Фото");
        keep.forEach(function (i) {
          var label = cols[i];
          if (isPriceCol(label) && !/[₸]/.test(label)) label = label + ", " + cur;
          head.push(label);
        });

        var body = (g.rows || []).map(function (r, ri) {
          var cells = [];
          if (hasImg) cells.push("");
          keep.forEach(function (i) {
            cells.push(isPriceCol(cols[i]) ? priceText(r[i], cur) : (r[i] == null ? "" : String(r[i])));
          });
          cells._img = hasImg ? (g.images[ri] || "") : "";
          return cells;
        });

        var colStyles = {};
        if (hasImg) colStyles[0] = { cellWidth: 40, halign: "center" };
        // правая колонка с ценой — жирнее/синяя, по правому краю
        head.forEach(function (label, ci) {
          if (isPriceCol(label)) colStyles[ci] = { halign: "right", textColor: [10, 61, 143], cellWidth: 64 };
        });

        doc.autoTable({
          startY: cursorY,
          margin: { top: BAN + 12, left: M, right: M },
          head: [head],
          body: body,
          theme: "grid",
          styles: { font: F.name, fontSize: 8.5, cellPadding: 3, textColor: [11, 20, 36], lineColor: [207, 224, 245], lineWidth: 0.5, valign: "middle", overflow: "linebreak", minCellHeight: hasImg ? 36 : 0 },
          headStyles: { fillColor: [27, 75, 143], textColor: [255, 255, 255], lineColor: [22, 64, 122] },
          alternateRowStyles: { fillColor: [234, 242, 253] },
          columnStyles: colStyles,
          rowPageBreak: "avoid",
          didDrawPage: function () { banner(); },
          didDrawCell: function (d) {
            if (!hasImg || d.section !== "body" || d.column.index !== 0) return;
            var u = body[d.row.index] && body[d.row.index]._img;
            var im = u && imgMap[u];
            if (!im) return;
            var size = Math.min(d.cell.height - 4, 32);
            var x = d.cell.x + (d.cell.width - size) / 2;
            var y = d.cell.y + (d.cell.height - size) / 2;
            try { doc.addImage(im.data, "JPEG", x, y, size, size); } catch (e) {}
          }
        });
        cursorY = doc.lastAutoTable.finalY + 8;
      });
    });

    if (!cats.length) { doc.setFontSize(13); doc.text("Прайс пока пуст.", pw / 2, BAN + 60, { align: "center" }); }

    // футер с датой на каждой странице
    var dateStr = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
    var n = doc.internal.getNumberOfPages();
    for (var i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5); doc.setTextColor(120, 130, 150);
      doc.text("AquaUzel · г. Алматы, ул. Амангельды, 70 · +7 700 520 12 01 · Прайс от " + dateStr +
        " · цены в " + cur + ", не оферта · стр. " + i + "/" + n, pw / 2, ph - 12, { align: "center" });
    }

    var fileDate = new Date().toISOString().slice(0, 10);
    doc.save("Прайс AquaUzel " + fileDate + ".pdf");
  }

  window.AquaPdf = { download: download };
})();
