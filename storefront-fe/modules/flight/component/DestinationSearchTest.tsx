'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDestinationSearch } from '../../destination/hooks/useDestinationSearch';
import type { DestinationSearchResult } from '../../destination/type';

/**
 * Test component to demonstrate destination search integration on flight page
 */
export const DestinationSearchTest: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the debounced destination search hook
  const {
    destinations: results,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations: loadPopularDestinations
  } = useDestinationSearch({
    debounceMs: 300,
    minQueryLength: 2,
    limit: 20
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchDestinations(searchQuery);
    } else {
      clearSearch();
    }
  };

  const handlePopularDestinations = () => {
    loadPopularDestinations();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Destination Search Test (Vietnamese Administrative Units API)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search destinations (e.g., hanoi, ho chi minh)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePopularDestinations} disabled={loading}>
            Load Popular Destinations
          </Button>
          <Button variant="outline" onClick={clearSearch}>
            Clear Results
          </Button>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">
              Results ({results.length}):
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="font-medium">{result.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {result.type} • {result.country}
                    </span>
                    {result.iataCode && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                        {result.iataCode}
                      </span>
                    )}
                  </div>
                  {result.relevanceScore && result.relevanceScore > 0.8 && (
                    <span className="text-yellow-500">★</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>This test demonstrates the Vietnamese Administrative Units API integration:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Search destinations using the /api/v1/search-address endpoint</li>
            <li>Get popular Vietnamese destinations</li>
            <li>Fallback to backend API if external service fails</li>
            <li>Consistent data format across flight and hotel searches</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationSearchTest;
