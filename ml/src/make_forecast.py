"""Generate a short-horizon energy forecast for AuraGrid demos.
This script stitches together the load data and renewable series using Prophet
and writes the results to `data/forecast.json` so the Cloudflare Worker can
serve it via `/api/forecast`.
"""

from __future__ import annotations
import pandas as pd
from pathlib import Path
from prophet import Prophet

CARBON_INTENSITY_BASELINE = 450.0  # kg CO₂ / MWh when renewables are negligible
CARBON_INTENSITY_MIN = 80.0        # kg CO₂ / MWh in a fully renewable hour

# Paths
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
FORECAST_PATH = DATA_DIR / "forecast.json"
LOAD_FILE = DATA_DIR / "ercot_load_for_hr_2025_october.csv"  # Path to ERCOT load data
RENEWABLE_FILE = DATA_DIR / "renewable_energy_data_2025_october.csv"  # Path to renewable data

# Load and clean ERCOT load data
df_load = pd.read_csv(LOAD_FILE)

# Convert to datetime and adjust to hourly UTC time
df_load['ds'] = pd.to_datetime(df_load['UTC Timestamp (Interval Ending)'], utc=True)

# Remove timezone info to make it naive (Prophet does not support timezones)
df_load['ds'] = df_load['ds'].dt.tz_localize(None)  # This removes timezone information

df_load['y'] = pd.to_numeric(df_load['SystemTotal Forecast Load (MW)'], errors='coerce')

# Keep only necessary columns: 'ds' and 'y' (Prophet format)
df_load = df_load[['ds', 'y']].dropna()

# Load and clean renewable energy data (solar and wind)
df_renewable = pd.read_csv(RENEWABLE_FILE)

# Assuming 'ds' column in renewable data matches the format in load data
df_renewable['ds'] = pd.to_datetime(df_renewable['ds'], utc=True)

# Remove timezone info from the renewable data as well
df_renewable['ds'] = df_renewable['ds'].dt.tz_localize(None)

# Merge load and renewable datasets on 'ds' (timestamp)
df = pd.merge(df_load, df_renewable, on='ds', how='left')

# Ensure no missing data
df = df.dropna(subset=['solar_mw', 'wind_mw'])

# Ensure the data is continuous by filling any gaps
full_idx = pd.date_range(df['ds'].min(), df['ds'].max(), freq='h', tz=None)
df = df.set_index('ds')
df = df.reindex(full_idx)
df = df.reset_index().rename(columns={'index': 'ds'})  # Reset the index to get the 'ds' column back

# Ensure the dataframe is sorted by 'ds'
df = df.sort_values('ds')

# Fill renewable gaps introduced by reindexing so Prophet sees a continuous series
df[['solar_mw', 'wind_mw']] = (
    df[['solar_mw', 'wind_mw']]
    .interpolate(limit_direction='both')
    .fillna(method='ffill')
    .fillna(method='bfill')
)

# Create Prophet model
prophet = Prophet()

# Add renewable data as regressors (solar and wind)
prophet.add_regressor('solar_mw')
prophet.add_regressor('wind_mw')

# Train the model
prophet.fit(df)

# Ensure 'ds' is in datetime format and remove timezone info (if not already done)
df['ds'] = pd.to_datetime(df['ds']).dt.tz_localize(None)

# Prophet expects continuous datetime range
# Make sure there's no missing data in 'ds' column
full_idx = pd.date_range(df['ds'].min(), df['ds'].max(), freq='h', tz=None)
df = df.set_index('ds')
df = df.reindex(full_idx)
df = df.reset_index().rename(columns={'index': 'ds'})  # Reset the index to get the 'ds' column back

# Now create the future dataframe
future = prophet.make_future_dataframe(periods=48, freq='h')

# Preserve historical regressors and supply simple hold-forward values for new horizon
future = future.merge(df[['ds', 'solar_mw', 'wind_mw']], on='ds', how='left')
future[['solar_mw', 'wind_mw']] = (
    future[['solar_mw', 'wind_mw']]
    .fillna(method='ffill')
    .fillna(method='bfill')
)

# Check the structure of future DataFrame
print(future.head())

# For future horizon, carry the latest observed renewable values as a simple baseline
future_mask = future['ds'] > df['ds'].max()
if future_mask.any():
    future.loc[future_mask, 'solar_mw'] = df['solar_mw'].iloc[-1]
    future.loc[future_mask, 'wind_mw'] = df['wind_mw'].iloc[-1]

# 5) Make forecast predictions
forecast = prophet.predict(future)

# 6) Shape output to match the worker's KV schema
result = future[['ds', 'solar_mw', 'wind_mw']].copy()
result['load_pred_mw'] = forecast['yhat']

# Compute renewable share + carbon intensity signal for the worker heuristic
renewable_total = result['solar_mw'] + result['wind_mw']
result['renewable_share'] = (
    renewable_total.div(result['load_pred_mw'].where(result['load_pred_mw'] > 0, pd.NA))
).fillna(0).clip(0, 1)
result['carbon_intensity_kg_per_mwh'] = (
    CARBON_INTENSITY_MIN
    + (CARBON_INTENSITY_BASELINE - CARBON_INTENSITY_MIN) * (1 - result['renewable_share'])
).round(2)

# Ensure deterministic column order and ISO timestamps
result = result[
    [
        'ds',
        'load_pred_mw',
        'solar_mw',
        'wind_mw',
        'renewable_share',
        'carbon_intensity_kg_per_mwh',
    ]
]
result['ds'] = pd.to_datetime(result['ds']).dt.strftime('%Y-%m-%d %H:%M:%S+00:00')

# Save the forecast as a JSON file (for the Cloudflare Worker)
result.to_json(FORECAST_PATH, orient="records")
print(f"✓ Wrote forecast to {FORECAST_PATH}")
