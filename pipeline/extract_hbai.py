"""Extract UK poverty outturn from the DWP HBAI FYE 2025 summary tables.

Source: Households Below Average Income, FYE 1995 to FYE 2025 (DWP,
published 26 March 2026), summary-hbai-1994-95-2024-25-tables.ods,
tables 1.3a (all individuals), 1.4a (children), 1.5a (working-age adults),
1.6a (pensioners). Only 2021/22 onward is kept: that is the admin-linked
series, with the absolute line anchored to FYE 2025 (series break before).

Usage: uv run python pipeline/extract_hbai.py [path-to-ods]
Writes pipeline/data/hbai_outturn.json.
"""

import hashlib
import json
import sys
import urllib.request
from pathlib import Path

import pandas as pd

URL = (
    "https://assets.publishing.service.gov.uk/media/69c28ffcb920af63be1c7767/"
    "summary-hbai-1994-95-2024-25-tables.ods"
)
OUT = Path(__file__).parent / "data" / "hbai_outturn.json"
SHEETS = {"all": "1_3a", "children": "1_4a", "working_age": "1_5a", "pensioners": "1_6a"}
# Column positions in each sheet (row 8 header): BHC rel, BHC abs, AHC rel, AHC abs
COLUMNS = {"relative_bhc": 2, "absolute_bhc": 4, "relative_ahc": 7, "absolute_ahc": 9}
YEARS = ["2021/22", "2022/23", "2023/24", "2024/25"]


def main(path: str | None) -> None:
    if path is None:
        path = Path(__file__).parent / "data" / "summary-hbai-1994-95-2024-25-tables.ods"
        if not path.exists():
            urllib.request.urlretrieve(URL, path)
    path = Path(path)
    sha = hashlib.sha256(path.read_bytes()).hexdigest()
    out = {m: {} for m in COLUMNS}
    for group, sheet in SHEETS.items():
        df = pd.read_excel(path, engine="odf", sheet_name=sheet, header=None)
        # Header sanity: the measure labels sit in rows 7-8.
        assert "Before housing costs" in str(df.iloc[7, 3]), sheet
        assert "After housing costs" in str(df.iloc[7, 8]), sheet
        assert "Relative" in str(df.iloc[8, 2]) and "Absolute" in str(df.iloc[8, 4]), sheet
        assert "Relative" in str(df.iloc[8, 7]) and "Absolute" in str(df.iloc[8, 9]), sheet
        year_col = df[1].astype(str).str.strip()
        for measure, col in COLUMNS.items():
            series = []
            for y in YEARS:
                row = df[year_col == y]
                assert len(row) == 1, (sheet, y)
                value = float(row.iloc[0, col]) / 100
                series.append({"year": y.replace("/", "-"), "rate": round(value, 5)})
            out[measure][group] = series
    payload = {
        "source": {
            "release": "Households Below Average Income: FYE 1995 to FYE 2025 (DWP, 26 March 2026)",
            "url": "https://www.gov.uk/government/statistics/households-below-average-income-for-financial-years-ending-1995-to-2025",
            "file": URL,
            "file_sha256": sha,
            "tables": "1.3a, 1.4a, 1.5a, 1.6a",
        },
        "poverty": out,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
