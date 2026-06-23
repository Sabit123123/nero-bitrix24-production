import { PlacedObject, Project } from '@/types';
import { EQUIPMENT } from '@/lib/equipment-catalog';

// ─── Canvas helpers ───────────────────────────────────────────────────────

export function getCanvasDataURL(format: 'png' | 'jpeg' = 'png', quality = 0.85): string {
  const canvas = document.querySelector('canvas');
  if (!canvas) return '';
  return canvas.toDataURL(`image/${format}`, quality);
}

export function exportPNG(name: string) {
  const url = getCanvasDataURL('png');
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = `nd-${name}-${Date.now()}.png`;
  a.click();
}

// ─── Equipment summary ────────────────────────────────────────────────────

interface EquipmentRow {
  name: string;
  brand: string;
  qty: number;
  weight: number;
  cat: string;
  emoji: string;
}

/** @deprecated use buildEquipmentRows */
export function buildEquipmentSummary(objects: PlacedObject[]) {
  const counts: Record<string, number> = {};
  objects.forEach(o => { counts[o.name] = (counts[o.name] || 0) + 1; });
  const totalWeight = objects.reduce((sum, o) => {
    const item = EQUIPMENT.find(e => e.id === o.itemId);
    return sum + (item?.weight || 0);
  }, 0);
  return { counts, totalWeight, total: objects.length };
}

export function buildEquipmentRows(objects: PlacedObject[]): EquipmentRow[] {
  const map = new Map<string, EquipmentRow>();
  for (const o of objects) {
    const item = EQUIPMENT.find(e => e.id === o.itemId);
    const key  = item ? item.id : o.name;
    if (map.has(key)) {
      const r = map.get(key)!;
      r.qty   += 1;
      r.weight += (item?.weight ?? 0) * o.scale;
    } else {
      map.set(key, {
        name:   item?.name  ?? o.name,
        brand:  item?.brand ?? '—',
        qty:    1,
        weight: (item?.weight ?? 0) * o.scale,
        cat:    item?.cat   ?? 'custom',
        emoji:  item?.emoji ?? '📦',
      });
    }
  }
  return Array.from(map.values());
}

const CAT_ORDER = ['audio', 'light', 'led', 'truss', 'stage', 'structure', 'custom'];
const CAT_LABEL: Record<string, string> = {
  audio: 'Звук', light: 'Свет', led: 'LED', truss: 'Фермы',
  stage: 'Сцена', structure: 'Конструкции', custom: 'Импортировано',
};

// ─── Full PDF rider ───────────────────────────────────────────────────────

export function exportProjectPDF(project: Project, objects: PlacedObject[]) {
  const imgData = getCanvasDataURL('jpeg', 0.82);
  const rows    = buildEquipmentRows(objects);
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const totalItems  = rows.reduce((s, r) => s + r.qty, 0);

  // Group rows by category
  const grouped: Record<string, EquipmentRow[]> = {};
  for (const row of rows) {
    if (!grouped[row.cat]) grouped[row.cat] = [];
    grouped[row.cat].push(row);
  }

  const tableRows = CAT_ORDER.flatMap(cat => {
    const catRows = grouped[cat];
    if (!catRows?.length) return [];
    return [
      `<tr class="cat-header"><td colspan="4">${CAT_LABEL[cat] ?? cat}</td></tr>`,
      ...catRows.map(r => `
        <tr>
          <td>${r.emoji} ${r.name}</td>
          <td class="center">${r.brand}</td>
          <td class="center">${r.qty} шт</td>
          <td class="center">${Math.round(r.weight)} кг</td>
        </tr>`),
    ];
  }).join('');

  const printWin = window.open('', '_blank');
  if (!printWin) return;

  printWin.document.write(`<!DOCTYPE html><html lang="ru"><head>
<meta charset="UTF-8">
<title>Райдер — ${project.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Arial', sans-serif; padding: 36px 44px; color: #111; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
  .logo { font-size: 22px; font-weight: 900; color: #C9A227; letter-spacing: 4px; }
  .logo span { font-size: 11px; display: block; color: #888; font-weight: 400; letter-spacing: 1px; margin-top: 2px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .meta { color: #555; font-size: 12px; margin-bottom: 6px; }
  .meta b { color: #111; }
  .room { display: inline-flex; gap: 16px; background: #f6f6f6; padding: 6px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 18px; }
  .room b { color: #C9A227; }
  .scene-img { width: 100%; max-height: 320px; object-fit: contain; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 22px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #111; color: #C9A227; padding: 8px 10px; text-align: left; font-size: 12px; letter-spacing: 0.5px; }
  th.center, td.center { text-align: center; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; }
  tr:hover td { background: #fafafa; }
  .cat-header td { background: #f0ede6; color: #8a6a20; font-weight: 700; font-size: 11px; padding: 5px 10px; letter-spacing: 1px; text-transform: uppercase; }
  .total-row td { font-weight: 700; background: #f6f6f6; padding: 9px 10px; border-top: 2px solid #ddd; }
  .footer { margin-top: 28px; text-align: center; font-size: 10px; color: #bbb; border-top: 1px solid #eee; padding-top: 14px; }
  @media print { body { padding: 20px; } }
</style>
</head><body>
<div class="header">
  <div>
    <h1>${project.name || 'Без названия'}</h1>
    <div class="meta">
      <b>Клиент:</b> ${project.client || '—'} &nbsp;·&nbsp;
      <b>Площадка:</b> ${project.venue || '—'} &nbsp;·&nbsp;
      <b>Дата:</b> ${project.date}
    </div>
    <div class="room">
      <span>Зал <b>${project.roomW} × ${project.roomD} м</b></span>
      <span>Высота <b>${project.wallH} м</b></span>
      <span>Позиций <b>${totalItems}</b></span>
      <span>Вес <b>~${Math.round(totalWeight)} кг</b></span>
    </div>
  </div>
  <div class="logo">ND<span>Stage Configurator</span></div>
</div>

${imgData ? `<img class="scene-img" src="${imgData}" alt="3D план" />` : ''}

<table>
  <thead>
    <tr>
      <th>Оборудование</th>
      <th class="center">Бренд</th>
      <th class="center">Кол-во</th>
      <th class="center">Вес</th>
    </tr>
  </thead>
  <tbody>
    ${tableRows}
    <tr class="total-row">
      <td>Итого позиций</td>
      <td></td>
      <td class="center">${totalItems} шт</td>
      <td class="center">~${Math.round(totalWeight)} кг</td>
    </tr>
  </tbody>
</table>

${project.notes ? `<div style="margin-top:18px;padding:12px;background:#fffef5;border:1px solid #e8d89a;border-radius:6px;font-size:12px"><b>Примечания:</b><br/>${project.notes}</div>` : ''}

<div class="footer">
  Создано в New Direction Stage Configurator &nbsp;·&nbsp; ${new Date().toLocaleDateString('ru-RU')}
</div>
</body></html>`);

  printWin.document.close();
  setTimeout(() => printWin.print(), 600);
}
