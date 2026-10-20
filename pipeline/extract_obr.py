"""Extract OBR real household disposable income (RHDI) per person.

Source: OBR Economic and fiscal outlook, March 2026, detailed forecast tables:
economy (published 3 March 2026), Table 1.5 "Per person", block "By total
population": real household disposable income, index 2008Q1=100 (column D)
and GBP thousands in 2023 prices (column G), fiscal-year rows. OBR defines it
as RHDI (chained volume measure, ONS NRJR) divided by total population (ONS
EBAQ). This is a national-accounts measure, not the survey-based HBAI income
the rest of the dashboard uses.

The xlsx needs openpyxl, which is not a pipeline dependency, so run with:
    uv run --no-project --with openpyxl --with pandas python \
        pipeline/extract_obr.py <path-to-xlsx>
Writes pipeline/data/obr_rhdi.json.
"""

import hashlib
import json
import sys
from pathlib import Path

import pandas as pd

URL = "https://obr.uk/download/march-2026-economic-and-fiscal-outlook-detailed-forecast-tables-economy/"
OUT = Path(__file__).parent / "data" / "obr_rhdi.json"
YEARS = [f"{y}-{str(y + 1)[-2:]}" for y in range(2021, 2031)]
LAST_OUTTURN = "2024-25"  # ONS data run to 2025Q3; 2025-26 includes forecast quarters


def main(path: str) -> None:
    p = Path(path)
    df = pd.read_excel(p, sheet_name="1.5", header=None)
    assert "Per person" in str(df.iloc[1, 1])
    assert "By total population" in str(df.iloc[2, 2])
    assert "Real household disposable income" in str(df.iloc[4, 3])
    assert "2008Q1=100" in str(df.iloc[3, 2])
    assert "Real household disposable income" in str(df.iloc[4, 6])
    assert "2023 prices" in str(df.iloc[3, 6])
    labels = df[1].astype(str).str.strip()
    rows = []
    prev = None
    for y in YEARS:
        r = df[labels == y]
        assert len(r) == 1, y
        excel_row = int(r.index[0]) + 1
        index = float(r.iloc[0, 3])
        level = float(r.iloc[0, 6]) * 1000
        rows.append({
            "year": y,
            "index_2008q1_100": round(index, 3),
            "gbp_2023_prices": round(level),
            "growth": None if prev is None else round(index / prev - 1, 5),
            "type": "outturn" if y <= LAST_OUTTURN else "forecast",
            "cell_row": excel_row,
        })
        prev = index
    payload = {
        "source": {
            "release": "OBR Economic and fiscal outlook, March 2026: detailed forecast tables, economy",
            "url": URL,
            "file_sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
            "table": "Table 1.5 (Per person), By total population: Real household disposable income, "
                     "columns D (index, 2008Q1=100) and G (£ thousands, 2023 prices), fiscal-year rows",
            "definition": "RHDI (chained volume measure, ONS NRJR) divided by total population (ONS EBAQ)",
        },
        "series": rows,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Wrote {OUT}")
    for r in rows:
        print(r)


if __name__ == "__main__":
    main(sys.argv[1])
