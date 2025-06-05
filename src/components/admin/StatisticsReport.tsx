'use client';

import { accountService } from '@/lib/api-services';
import { useState } from 'react';

interface StatisticsData {
  totalArticles: number;
  articlesByDate: { date: string; count: number }[];
  articlesByCategory: { categoryName: string; count: number }[];
  articlesByAuthor: { authorName: string; count: number }[];
  articlesByStatus: { status: string; count: number }[];
}

interface StatisticsReportProps {
  onClose?: () => void;
}

export function StatisticsReport({ onClose }: StatisticsReportProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StatisticsData | null>(null);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const reportData = await accountService.getStatisticsReport(startDate, endDate);
      setData(reportData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Statistics Report</h3>
            <p className="text-sm text-gray-600 mt-1">Generate news articles statistics by date range</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <span className="material-icons animate-spin text-sm mr-2">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-2">analytics</span>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-2">error</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Report Results */}
        {data && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Report Summary</h4>
              <p className="text-blue-700">
                <span className="font-medium">{data.totalArticles}</span> articles found 
                from <span className="font-medium">{formatDate(startDate)}</span> to <span className="font-medium">{formatDate(endDate)}</span>
              </p>
            </div>

            {/* Articles by Date */}
            {data.articlesByDate.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Articles by Date</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid gap-2">
                    {data.articlesByDate.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-gray-700">{formatDate(item.date)}</span>
                        <span className="font-medium text-gray-900">{item.count} articles</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Articles by Category */}
            {data.articlesByCategory.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Articles by Category</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid gap-2">
                    {data.articlesByCategory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-gray-700">{item.categoryName}</span>
                        <span className="font-medium text-gray-900">{item.count} articles</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Articles by Author */}
            {data.articlesByAuthor.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Articles by Author</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid gap-2">
                    {data.articlesByAuthor.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-gray-700">{item.authorName}</span>
                        <span className="font-medium text-gray-900">{item.count} articles</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Articles by Status */}
            {data.articlesByStatus.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Articles by Status</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid gap-2">
                    {data.articlesByStatus.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <span className="text-gray-700">{item.status}</span>
                        <span className="font-medium text-gray-900">{item.count} articles</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatisticsReport; 