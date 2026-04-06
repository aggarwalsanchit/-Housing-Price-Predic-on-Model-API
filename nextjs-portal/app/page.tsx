'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { healthCheck, getModelInfo } from '@/lib/api';

export default function Home() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const health = await healthCheck();
      if (health.status === 'healthy') {
        setApiStatus('online');
        const info = await getModelInfo();
        setModelInfo(info);
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <div className={`mb-6 p-4 rounded-lg ${apiStatus === 'online' ? 'bg-green-100 text-green-800' : apiStatus === 'offline' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <strong>ML API Status:</strong>{' '}
            {apiStatus === 'online' ? 'Online - Ready to predict' : apiStatus === 'offline' ? 'Offline - Start ML API on port 8000' : 'Checking...'}
          </div>
          {apiStatus === 'offline' && (
            <button onClick={checkApiHealth} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
              Retry
            </button>
          )}
        </div>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Smart Housing Price Predictions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get accurate property valuations using our advanced machine learning model
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">

        <Link href="/property-estimator">
          <div className="card hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="text-5xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition">Property Value Estimator</h2>
            <p className="text-gray-600 mb-4">
              Get instant property valuations. Input property details and receive accurate price predictions with visualizations and history tracking.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Try Estimator →
            </div>
          </div>
        </Link>

        <Link href="/market-analysis">
          <div className="card hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition">Property Market Analysis</h2>
            <p className="text-gray-600 mb-4">
              Analyze market trends, compare properties, run "what-if" scenarios, and export insights.
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Analyze Market →
            </div>
          </div>
        </Link>
      </div>

      {modelInfo && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">📈 Model Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{modelInfo.performance_metrics?.accuracy || 'N/A'}</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">R² {modelInfo.r_squared?.toFixed(4) || 'N/A'}</div>
              <div className="text-sm text-gray-600">R-Squared</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">${modelInfo.rmse?.toLocaleString() || 'N/A'}</div>
              <div className="text-sm text-gray-600">RMSE</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${modelInfo.mae?.toLocaleString() || 'N/A'}</div>
              <div className="text-sm text-gray-600">MAE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}