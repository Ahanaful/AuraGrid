"""Generate a short-horizon energy forecast for AuraGrid demos.

This script stitches together synthetic load and renewable series using Prophet
and writes the results to `data/forecast.json` so the Cloudflare Worker can
serve it via `/api/forecast`.
"""

from __future__ import annotations

from pathlib import Path
from typing import List

import json
import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
FORECAST_PATH = DATA_DIR / "forecast.json"
DEFAULT_HORIZON_HOURS = 48


def build_stub_dataset(hours: int = DEFAULT_HORIZON_HOURS) -> pd.DataFrame:
    """Create a synthetic dataset while the Prophet model is under development."""

    date_range = pd.date_range(start=pd.Timestamp.utcnow(), periods=hours, freq="H")
    base_load = 220 + 35 * pd.Series(np.sin(np.linspace(0, 3.14, hours)))
    solar = 40 * pd.Series(np.clip(np.sin(np.linspace(-1.5, 1.5, hours)), 0, None))
    wind = 55 + 20 * pd.Series(np.sin(np.linspace(0, 4.2, hours)))

    return pd.DataFrame(
        {
            "ds": date_range,
            "load_pred_mw": base_load.round(2),
            "solar_mw": solar.round(2),
            "wind_mw": wind.round(2),
        }
    )


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    forecast = build_stub_dataset()
    export_records: List[dict] = forecast.to_dict(orient="records")
    FORECAST_PATH.write_text(json.dumps(export_records, default=str))
    try:
        display_path = FORECAST_PATH.relative_to(Path.cwd())
    except ValueError:
        display_path = FORECAST_PATH
    print(f"Wrote {len(export_records)} points to {display_path}")


if __name__ == "__main__":
    main()
