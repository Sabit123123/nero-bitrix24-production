import { PlacedObject, Project } from '@/types';
import { EQUIPMENT } from '@/lib/equipment-catalog';

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

export function buildEquipmentSummary(objects: PlacedObject[]) {
  const counts: Record<string, number> = {};
  objects.forEach(o => { counts[o.name] = (counts[o.name] || 0) + 1; });
  const totalWeight = objects.reduce((sum, o) => {
    const item = EQUIPMENT.find(e => e.id === o.itemId);
    return sum + (item?.weight || 0);
  }, 0);
  return { counts, totalWeight, total: objects.length };
}

export function exportProjectPDF(project: Project, objects: PlacedObject[]) {
  const imgData = getCanvasDataURL('jpeg', 0.85);
  const { counts, totalWeight } = buildEquipmentSummary(objects);

  const printWin = window.open('', '_blank');
  if (!printWin) return;
  printWin.document.write(`
    <!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>New Direction — ${project.name}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
      h1 { color: #C9A227; margin-bottom: 4px; }
      .meta { color: #666; font-size: 13px; margin-bottom: 20px; }
      img { width: 100%; max-height: 400px; object-fit: contain; margin-bottom: 20px; border: 1px solid #ddd; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #111; color: #C9A227; padding: 8px; text-align: left; }
      td { padding: 7px 8px; border-bottom: 1px solid #eee; }
      .total { font-weight: bold; background: #f5f5f5; }
      .footer { margin-top: 30px; font-size: 11px; color: #999; text-align: center; }
    </style>
    </head><body>
    <h1>New Direction — ${project.name}</h1>
    <div class="meta">Клиент: ${project.client || '—'} &nbsp;|&nbsp; Площадка: ${project.venue || '—'} &nbsp;|&nbsp; ${project.date}</div>
    ${imgData ? `<img src="${imgData}" />` : ''}
    <table>
      <tr><th>Оборудование</th><th>Кол-во</th></tr>
      ${Object.entries(counts).map(([name, cnt]) => `<tr><td>${name}</td><td>${cnt} шт</td></tr>`).join('')}
      <tr class="total"><td>Всего объектов</td><td>${objects.length} шт</td></tr>
      <tr class="total"><td>Общий вес</td><td>~${Math.round(totalWeight)} кг</td></tr>
    </table>
    <div class="footer">Создано в New Direction Stage Configurator · ${new Date().toLocaleDateString('ru')}</div>
    </body></html>
  `);
  printWin.document.close();
  setTimeout(() => printWin.print(), 500);
}
