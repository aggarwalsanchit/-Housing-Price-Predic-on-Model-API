'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { predictPrice, HouseFeatures, PredictionResponse } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface HistoryItem extends PredictionResponse {
  features: HouseFeatures;
  id: string;
}

export default function PropertyEstimator() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [comparisonItems, setComparisonItems] = useState<HistoryItem[]>([]);
  const [showBatchMode, setShowBatchMode] = useState(false);
  const [batchFeatures, setBatchFeatures] = useState<HouseFeatures[]>([
    {
      square_footage: 2000,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2010,
      lot_size: 8000,
      distance_to_city_center: 5,
      school_rating: 8,
    }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<HouseFeatures>({
    defaultValues: {
      square_footage: 2000,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2010,
      lot_size: 8000,
      distance_to_city_center: 5,
      school_rating: 8,
    },
  });

  const formValues = watch();

  useEffect(() => {
    const savedHistory = localStorage.getItem('propertyHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const onSubmit = async (data: HouseFeatures) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await predictPrice(data);
      setPrediction(result);
      
      const historyItem: HistoryItem = {
        ...result,
        features: data,
        id: Date.now().toString(),
      };
      const newHistory = [historyItem, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('propertyHistory', JSON.stringify(newHistory));
    } catch (err) {
      setError('Failed to get prediction. Make sure ML API is running on port 8000');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addBatchProperty = () => {
    setBatchFeatures([...batchFeatures, {
      square_footage: 2000,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2010,
      lot_size: 8000,
      distance_to_city_center: 5,
      school_rating: 8,
    }]);
  };

  const updateBatchProperty = (index: number, field: keyof HouseFeatures, value: number) => {
    const updated = [...batchFeatures];
    updated[index] = { ...updated[index], [field]: value };
    setBatchFeatures(updated);
  };

  const runBatchPrediction = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(batchFeatures.map(f => predictPrice(f)));
      results.forEach((result, i) => {
        const historyItem: HistoryItem = {
          ...result,
          features: batchFeatures[i],
          id: Date.now() + i.toString(),
        };
        setHistory(prev => [historyItem, ...prev].slice(0, 10));
      });
      localStorage.setItem('propertyHistory', JSON.stringify(history));
      alert(`Predicted ${results.length} properties!`);
    } catch (err) {
      setError('Batch prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const addToComparison = (item: HistoryItem) => {
    if (!comparisonItems.find(i => i.id === item.id)) {
      setComparisonItems([...comparisonItems, item]);
    }
  };

  const removeFromComparison = (id: string) => {
    setComparisonItems(comparisonItems.filter(i => i.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('propertyHistory');
  };

  const chartData = [
    ...comparisonItems.map((item, i) => ({
      name: `Property ${i + 1}`,
      price: item.predicted_price,
    })),
    ...(prediction && !comparisonItems.find(i => i.id === prediction.timestamp) ? [{
      name: 'Current',
      price: prediction.predicted_price,
    }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Property Value Estimator</h1>
        <button
          onClick={() => setShowBatchMode(!showBatchMode)}
          className="btn-secondary"
        >
          {showBatchMode ? 'Single Mode' : 'Batch Mode'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            {showBatchMode ? 'Batch Properties' : 'Property Details'}
          </h2>

          {!showBatchMode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Square Footage *</label>
                  <input type="number" {...register('square_footage', { required: true, min: 300 })} className="input-field" />
                  {errors.square_footage && <span className="text-red-500 text-sm">Required (300-10000)</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bedrooms *</label>
                  <input type="number" {...register('bedrooms', { required: true, min: 1, max: 10 })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bathrooms *</label>
                  <input type="number" step="0.5" {...register('bathrooms', { required: true, min: 0.5 })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year Built *</label>
                  <input type="number" {...register('year_built', { required: true, min: 1800, max: 2024 })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lot Size (sq ft)</label>
                  <input type="number" {...register('lot_size')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Distance to City (miles)</label>
                  <input type="number" step="0.1" {...register('distance_to_city_center')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">School Rating (1-10)</label>
                  <input type="number" step="0.1" {...register('school_rating')} className="input-field" />
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Predicting...' : 'Predict Price'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {batchFeatures.map((feature, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Property {idx + 1}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Sq Ft" value={feature.square_footage} onChange={(e) => updateBatchProperty(idx, 'square_footage', Number(e.target.value))} className="input-field text-sm" />
                    <input type="number" placeholder="Beds" value={feature.bedrooms} onChange={(e) => updateBatchProperty(idx, 'bedrooms', Number(e.target.value))} className="input-field text-sm" />
                    <input type="number" placeholder="Baths" value={feature.bathrooms} onChange={(e) => updateBatchProperty(idx, 'bathrooms', Number(e.target.value))} className="input-field text-sm" />
                    <input type="number" placeholder="Year" value={feature.year_built} onChange={(e) => updateBatchProperty(idx, 'year_built', Number(e.target.value))} className="input-field text-sm" />
                  </div>
                </div>
              ))}
              <button onClick={addBatchProperty} className="btn-secondary w-full">+ Add Property</button>
              <button onClick={runBatchPrediction} disabled={loading} className="btn-primary w-full">
                {loading ? 'Processing...' : `Predict ${batchFeatures.length} Properties`}
              </button>
            </div>
          )}
        </div>

        {prediction && !showBatchMode && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Prediction Result</h2>
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">{prediction.formatted_price}</div>
              <div className="text-gray-600">Estimated Property Value</div>
              <div className="text-sm text-gray-500 mt-4">{new Date(prediction.timestamp).toLocaleString()}</div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Value Comparison</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{ name: 'Current', value: prediction.predicted_price }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {comparisonItems.length > 0 && (
        <div className="card mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Property Comparison</h2>
            <button onClick={() => setComparisonItems([])} className="text-red-600 text-sm">Clear All</button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonItems.map((item, i) => ({ name: `Property ${i + 1}`, price: item.predicted_price }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="price" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {comparisonItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{item.formatted_price}</span>
                  <span className="text-sm text-gray-500 ml-2">{item.features.square_footage} sq ft</span>
                </div>
                <button onClick={() => removeFromComparison(item.id)} className="text-red-500 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Estimates</h2>
            <button onClick={clearHistory} className="text-red-600 text-sm">Clear History</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Sq Ft</th>
                  <th className="p-3 text-left">Beds/Baths</th>
                  <th className="p-3 text-left">Year</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-green-600">{item.formatted_price}</td>
                    <td className="p-3">{item.features.square_footage}</td>
                    <td className="p-3">{item.features.bedrooms}/{item.features.bathrooms}</td>
                    <td className="p-3">{item.features.year_built}</td>
                    <td className="p-3">
                      <button onClick={() => addToComparison(item)} className="text-blue-600 text-sm hover:underline">
                        Compare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}