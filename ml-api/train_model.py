import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import joblib
import os

print("Loading data...")
df = pd.read_csv('data/House Price Dataset.csv')
print(f"Loaded {len(df)} records")

features = ['square_footage', 'bedrooms', 'bathrooms', 'year_built', 
            'lot_size', 'distance_to_city_center', 'school_rating']
X = df[features]
y = df['price']

X['house_age'] = 2024 - X['year_built']
X['rooms_per_sqft'] = (X['bedrooms'] + X['bathrooms']) / X['square_footage']

print("Training model...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

predictions = model.predict(X)

r2 = r2_score(y, predictions)
rmse = np.sqrt(mean_squared_error(y, predictions))
mae = mean_absolute_error(y, predictions)

print("\n" + "="*50)
print("MODEL PERFORMANCE")
print("="*50)
print(f"R² Score: {r2:.4f}")
print(f"RMSE: ${rmse:,.2f}")
print(f"MAE: ${mae:,.2f}")
print(f"Accuracy: {r2*100:.2f}%")
print("="*50)

os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/house_price_model.pkl')
print("\nModel saved to: models/house_price_model.pkl")