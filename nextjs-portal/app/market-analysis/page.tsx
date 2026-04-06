'use client';

import { useState, useEffect } from 'react';
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
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from 'recharts';

export default function MarketAnalysis() {
  const [whatIfParams, setWhatIfParams] = useState<HouseFeatures>({
    square_footage: 2000,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2010,
    lot_size: 8000,
    distance_to_city_center: 5,
    school_rating: 8,
  });
  const [whatIfResult, setWhatIfResult] = useState<PredictionResponse | null>(null);
  const [scenarioData, setScenarioData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 100000,
    maxPrice: 500000,
    minSqFt: 1000,
    maxSqFt: 3000,
  });

  const runWhatIfAnalysis = async () => {
    setLoading(true);
    try {
      const result = await predictPrice(whatIfParams);
      setWhatIfResult(result);
      
      const scenarios = [];
      for (let sqFt = 1000; sqFt <= 3000; sqFt += 500) {
        const testParams = { ...whatIfParams, square_footage: sqFt };
        const res = await predictPrice(testParams);
        scenarios.push({
          square_footage: sqFt,
          price: res.predicted_price,
        });
      }
      setScenarioData(scenarios);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMarketTrends = () => {
    const trends = [];
    for (let year = 2000; year <= 2024; year += 2) {
      trends.push({
        year,
        avgPrice: 150000 + (year - 2000) * 15000,
      });
    }
    return trends;
  };

  const schoolRatingData = [
    { rating: 5, price: 250000 },
    { rating: 6, price: 280000 },
    { rating: 7, price: 310000 },
    { rating: 8, price: 350000 },
    { rating: 9, price: 400000 },
    { rating: 10, price: 450000 },
  ];

  const exportToCSV = () => {
    const csv = scenarioData.map(d => `${d.square_footage},${d.price}`).join('\n');
    const blob = new Blob(['square_footage,price\n' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market_analysis.csv';
    a.click();
  };

  useEffect(() => {
    runWhatIfAnalysis();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Property Market Analysis</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">What-If Analysis</h2>
          <p className="text-gray-600 mb-4">Adjust parameters to see how property value changes</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Square Footage: {whatIfParams.square_footage}</label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={whatIfParams.square_footage}
                onChange={(e) => setWhatIfParams({ ...whatIfParams, square_footage: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">School Rating: {whatIfParams.school_rating}</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={whatIfParams.school_rating}
                onChange={(e) => setWhatIfParams({ ...whatIfParams, school_rating: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Distance to City Center (miles): {whatIfParams.distance_to_city_center}</label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={whatIfParams.distance_to_city_center}
                onChange={(e) => setWhatIfParams({ ...whatIfParams, distance_to_city_center: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <button onClick={runWhatIfAnalysis} disabled={loading} className="btn-primary w-full">
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>

            {whatIfResult && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                <div className="text-sm text-gray-600">Estimated Value</div>
                <div className="text-2xl font-bold text-green-600">{whatIfResult.formatted_price}</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Price vs Square Footage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="square_footage" name="Square Footage" />
              <YAxis dataKey="price" name="Price" tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Scatter data={scenarioData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Market Trends (2000-2024)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateMarketTrends()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="avgPrice" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">School Rating Impact</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schoolRatingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="price" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <div className="flex gap-4">
          <button onClick={exportToCSV} className="btn-secondary">
            Export as CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary">
            Export as PDF
          </button>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-4">Market Insights</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Price per Sq Ft Trend</div>
            <div className="text-lg font-bold text-blue-600">↑ +4.2% YoY</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Best School Rating ROI</div>
            <div className="text-lg font-bold text-green-600">+15% value</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600">Distance Impact</div>
            <div className="text-lg font-bold text-orange-600">-8% per mile</div>
          </div>
        </div>
      </div>
    </div>
  );
}