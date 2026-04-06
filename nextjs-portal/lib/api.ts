const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

export interface HouseFeatures {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

export interface PredictionResponse {
  predicted_price: number;
  formatted_price: string;
  timestamp: string;
}

export interface BatchPredictionResponse {
  predictions: PredictionResponse[];
  total_properties: number;
  average_price: number;
}

export interface ModelInfo {
  model_type: string;
  features_used: string[];
  performance_metrics: {
    r_squared: number;
    rmse: number;
    mae: number;
    accuracy: string;
  };
  r_squared?: number;
  rmse?: number;
  mae?: number;
}

export async function predictPrice(features: HouseFeatures): Promise<PredictionResponse> {
  const response = await fetch(`${ML_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    
    body: JSON.stringify({ features: features }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Prediction failed: ${error}`);
  }
  
  return response.json();
}

export async function batchPredict(featuresList: HouseFeatures[]): Promise<BatchPredictionResponse> {
  const response = await fetch(`${ML_API_URL}/batch-predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ features: featuresList }),
  });
  
  if (!response.ok) {
    throw new Error('Batch prediction failed');
  }
  
  return response.json();
}

export async function getModelInfo(): Promise<ModelInfo> {
  const response = await fetch(`${ML_API_URL}/model-info`);
  
  if (!response.ok) {
    throw new Error('Failed to get model info');
  }
  
  return response.json();
}

export async function healthCheck(): Promise<{ status: string; model_loaded: boolean }> {
  const response = await fetch(`${ML_API_URL}/health`);
  return response.json();
}