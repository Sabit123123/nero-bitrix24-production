#!/usr/bin/env python3
"""Convert the AquaUzel price-list workbook into clean JSON for the website."""
import json
import re
import sys
from pathlib import Path

import openpyxl

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    str(Path(__file__).resolve().parent / "aquauzel-price.xlsx")
OUT = Path(__file__).resolve().parents[1] / "assets" / "data" / "prices.json"

# Friendly metadata per sheet (display name, short subtitle, icon key)
SHEET_META = {
    "Полипропилен · трубы":   ("Полипропилен — трубы",      "ППР трубы PN20/PN25, стекловолокно, тёплый пол, PEX", "pipe"),
    "Полипропилен · фитинги": ("Полипропилен — фитинги",    "Краны, муфты, адаптеры, настенные комплекты",        "fitting"),
    "ПЭ трубы":               ("Полиэтилен (ПЭ)",           "Трубы чёрные/синие, муфты, отводы, краны",           "pe"),
    "Канализация":            ("Канализация",               "ПВХ трубы и фитинги для канализации",                "drain"),
    "Изоляция · прочее":      ("Изоляция и комплектующие",  "Теплоизоляция, хомуты, шпильки, герметик, ФУМ",      "tools"),
    "Каучук · трубчатая":     ("Каучук — трубчатая",        "Трубчатая теплоизоляция из каучука",                 "rubber"),
    "Каучук · алюм.":         ("Каучук — алюминизированный","Трубчатая изоляция с алюминиевым покрытием",         "rubber"),
    "Рулоны · аксессуары":    ("Рулонная изоляция",         "Рулоны и каучуковые аксессуары",                     "roll"),
}


def clean(v):
    if v is None:
        return ""
    s = re.sub(r"\s+", " ", str(v).strip())
    if s in ("#VALUE!", "None", "nan"):
        return ""
    # normalise numbers like 293.0 -> 293
    if isinstance(v, float) and v.is_integer():
        s = str(int(v))
    return s


def is_upper_title(s):
    letters = [c for c in s if c.isalpha()]
    return bool(letters) and sum(1 for c in letters if c.isupper()) / len(letters) > 0.7


def is_number(s):
    return bool(re.fullmatch(r"-?\d+(?:[.,]\d+)?", s.strip()))


def parse_sheet(ws, friendly):
    rows = []
    for r in ws.iter_rows(values_only=True):
        rows.append([clean(c) for c in r])
    maxcol = max((len(r) for r in rows), default=0)
    rows = [r + [""] * (maxcol - len(r)) for r in rows]

    def has_price(cells):
        return any(c.strip().lower() == "цена" for c in cells)

    # index of next row that has content, or None
    def next_meaningful(start):
        for j in range(start + 1, len(rows)):
            if any(c != "" for c in rows[j]):
                return j
        return None

    def mm_range(super_row):
        labels = [c.strip() for c in super_row if re.search(r"\d\s*мм", c.lower())]
        if len(labels) >= 2:
            return f" · {labels[0]}–{labels[-1]}"
        return ""

    category_title = None
    section_title = None
    groups = []
    current = None
    pending_super = None
    seen_titles = {}

    def new_group(title):
        nonlocal current
        if title in seen_titles:
            seen_titles[title] += 1
            title = f"{title} ({seen_titles[title]})"
        else:
            seen_titles[title] = 1
        current = {"title": title, "header": None, "super": None, "rows": []}
        groups.append(current)
        return current

    for i, cells in enumerate(rows):
        nz = [c for c in cells if c != ""]
        if not nz:
            continue

        # sheet-level title (first ALL-CAPS single cell)
        if category_title is None and len(nz) == 1 and is_upper_title(nz[0]):
            category_title = nz[0]
            continue

        # column header row (contains "Цена") -> start a NEW sub-table when needed
        if has_price(cells):
            base = section_title or friendly
            if pending_super:
                base += mm_range(pending_super)
            if current is None or current["rows"] or current["header"]:
                new_group(base)
            else:
                current["title"] = base
            current["header"] = cells[:]
            current["super"] = pending_super
            pending_super = None
            continue

        # spanning super-header: multi-cell label row immediately above a price header
        nxt = next_meaningful(i)
        if len(nz) >= 2 and nxt is not None and has_price(rows[nxt]) \
                and not any(is_number(c) and len(c) <= 4 for c in nz):
            pending_super = cells[:]
            continue

        # group / sub-section title (single text cell, not numeric)
        if len(nz) == 1 and not is_number(nz[0]):
            section_title = nz[0]
            new_group(nz[0])
            continue

        # otherwise a data row
        if current is None:
            new_group(section_title or friendly)
        current["rows"].append(cells[:])

    # finalise: trim empty columns, merge headers
    out_groups = []
    for g in groups:
        if not g["rows"]:
            continue
        header = g["header"] or []
        super_row = g["super"] or []
        width = max([len(g["rows"][0])] + [len(header)] + [len(super_row)])

        def at(row, i):
            return row[i] if i < len(row) else ""

        # which columns carry any data
        keep = []
        for i in range(width):
            if any(at(r, i) for r in g["rows"]) or at(header, i):
                keep.append(i)

        # carry-forward the super (thickness/variant) labels across blanks
        carried, last = [], ""
        for i in range(width):
            s = at(super_row, i)
            if s:
                last = s
            carried.append(last)

        columns = []
        for i in keep:
            sub = at(header, i)
            sup = carried[i] if super_row else ""
            label = (f"{sup} · {sub}".strip(" ·")) if sup and sub else (sub or sup)
            if not label:
                label = "—"
            columns.append(label)

        data = [[at(r, i) for i in keep] for r in g["rows"]]
        # drop fully-empty rows
        data = [row for row in data if any(c for c in row)]
        if data:
            out_groups.append({"title": g["title"], "columns": columns, "rows": data})

    return category_title, out_groups


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    categories = []
    total_items = 0
    for ws in wb.worksheets:
        name, subtitle, icon = SHEET_META.get(ws.title, (ws.title, "", "pipe"))
        cat_title, groups = parse_sheet(ws, name)
        count = sum(len(g["rows"]) for g in groups)
        total_items += count
        categories.append({
            "id": re.sub(r"[^a-z0-9]+", "-", ws.title.lower()).strip("-") or f"cat{len(categories)}",
            "name": name,
            "subtitle": subtitle,
            "icon": icon,
            "count": count,
            "groups": groups,
        })

    data = {"currency": "₸", "categories": categories, "totalItems": total_items}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, ensure_ascii=False, indent=1)
    OUT.write_text(payload, encoding="utf-8")
    # Also emit a JS file so the page works without fetch (e.g. opened via file://)
    js_out = Path(__file__).resolve().parents[1] / "assets" / "js" / "prices-data.js"
    js_out.write_text("window.AQUA_PRICES = " + payload + ";\n", encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size//1024} KB) + {js_out.name}")
    print(f"Categories: {len(categories)} | Total items: {total_items}")
    for c in categories:
        print(f"  - {c['name']}: {len(c['groups'])} groups, {c['count']} items")


if __name__ == "__main__":
    main()
