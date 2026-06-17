#!/usr/bin/env python3
"""Convert the rich matrix price (prices.json) into flat products -> seed-products.sql.

Each price column becomes a product row (matrix tables with several thickness
columns expand into one product per thickness). Prices and categories are kept.
Run:  python3 build/migrate_to_products.py
Then run the produced supabase/seed-products.sql in Supabase SQL Editor (once).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "data" / "prices.json"
OUT = ROOT / "supabase" / "seed-products.sql"

PRICE_RE = re.compile(r"цена", re.I)
PACK_RE = re.compile(r"упаковк|пакет|коробк|в\s*рулоне|кол", re.I)


def num(s):
    s = re.sub(r"[^\d.,]", "", str(s)).replace(",", ".")
    if not s:
        return None
    try:
        v = float(s)
        return int(v) if v.is_integer() else v
    except ValueError:
        return None


def q(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''").strip() + "'"


def prefix(label):
    return label.split("·")[0].strip() if "·" in label else ""


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    rows_sql = []
    order = 0
    for cat in data["categories"]:
        cat_name = cat["name"]
        for g in cat["groups"]:
            cols = g["columns"]
            price_idx = [i for i, c in enumerate(cols) if PRICE_RE.search(c)]
            pack_idx = [i for i, c in enumerate(cols) if PACK_RE.search(c) and i not in price_idx]
            other_idx = [i for i in range(len(cols)) if i not in price_idx and i not in pack_idx and i != 0]
            for row in g["rows"]:
                size = row[0] if row else ""
                for pi in price_idx:
                    if pi >= len(row):
                        continue
                    price = num(row[pi])
                    if price is None:
                        continue
                    pref = prefix(cols[pi])
                    # pack value: prefer same-prefix pack column, else first pack column
                    pack = ""
                    for qi in pack_idx:
                        if qi < len(row) and (not pref or prefix(cols[qi]) == pref):
                            pack = row[qi]
                            if not pref or prefix(cols[qi]) == pref:
                                break
                    name = g["title"]
                    if size:
                        name += " — " + size
                    if pref:
                        name += " · " + pref
                    chars = []
                    if size:
                        chars.append(cols[0] + ": " + size)
                    if pref:
                        chars.append("Размер/толщина: " + pref)
                    for oi in other_idx:
                        if oi < len(row) and row[oi]:
                            chars.append(cols[oi] + ": " + row[oi])
                    characteristics = "; ".join(chars)
                    order += 1
                    rows_sql.append("({name}, {pack}, {price}, {ch}, {cat}, true, {ord})".format(
                        name=q(name), pack=q(pack or None), price=price,
                        ch=q(characteristics or None), cat=q(cat_name), ord=order))

    header = (
        "-- AquaUzel — миграция текущего прайса в товары (сгенерировано migrate_to_products.py)\n"
        "-- Запустите ОДИН раз в Supabase → SQL Editor ПОСЛЕ schema.sql.\n"
        "-- Колонки: name, pack_quantity, price, characteristics, category, in_stock, sort_order\n\n"
        "insert into public.products\n"
        "  (name, pack_quantity, price, characteristics, category, in_stock, sort_order)\nvalues\n")
    body = ",\n".join(rows_sql) + ";\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(header + body, encoding="utf-8")
    print("Wrote", OUT, "—", len(rows_sql), "products")


if __name__ == "__main__":
    main()
