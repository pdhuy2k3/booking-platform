'use client';

import React, { useState } from 'react';
import { DestinationSearchModal, useDestinationSearch } from '../index';
import type { DestinationSearchResult } from '../type';

/**
 * Example component demonstrating how to use the destination search module
 * with the Vietnamese Administrative Units API integration
 */
export const DestinationSearchExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DestinationSearchResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<DestinationSearchResult[]>([]);

  // Use the destination search hook
  const {
    destinations,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations
  } = useDestinationSearch({
    debounceMs: 300,
    minQueryLength: 1,
    limit: 10
  });

  const handleDestinationSelect = (destination: DestinationSearchResult) => {
    setSelectedDestination(destination);
    
    // Add to recent searches (simple implementation)
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.name !== destination.name);
      return [destination, ...filtered].slice(0, 5); // Keep only last 5
    });
  };

  const handleRecentSearchRemove = (destination: DestinationSearchResult) => {
    setRecentSearches(prev => prev.filter(item => item.name !== destination.name));
  };

  const handleRecentSearchClear = () => {
    setRecentSearches([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Destination Search Example
      </h1>
      
      <p className="text-gray-600">
        This example demonstrates the Vietnamese Administrative Units API integration
        using the simplified <code>/api/v1/search-address</code> endpoint for destination search functionality.
      </p>

      {/* Selected Destination Display */}
      {selectedDestination && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Selected Destination:</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-green-900">
              {selectedDestination.name}
            </span>
            <span className="text-sm text-green-700">
              {selectedDestination.type} • {selectedDestination.country}
            </span>
            {selectedDestination.iataCode && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {selectedDestination.iataCode}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search Destinations
      </button>

      {/* Direct Search Input (Alternative to Modal) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Direct Search:</h3>
        <input
          type="text"
          placeholder="Type to search destinations (e.g., hanoi, ho chi minh)..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={(e) => searchDestinations(e.target.value)}
        />
        
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Searching...</span>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">
            Error: {error}
          </div>
        )}

        {destinations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Search Results:</h4>
            <div className="space-y-1">
              {destinations.map((destination, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleDestinationSelect(destination)}
                >
                  <div>
                    <span className="font-medium text-gray-900">{destination.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {destination.type} • {destination.country}
                    </span>
                  </div>
                  {destination.relevanceScore && destination.relevanceScore > 0.8 && (
                    <span className="text-yellow-500">★</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular Destinations Button */}
      <button
        onClick={getPopularDestinations}
        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Load Popular Destinations
      </button>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Recent Searches:</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((destination, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
              >
                <span>{destination.name}</span>
                <button
                  onClick={() => handleRecentSearchRemove(destination)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destination Search Modal */}
      <DestinationSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleDestinationSelect}
        title="Choose Destination"
        placeholder="Search city or province..."
        recentSearches={recentSearches}
        onRecentSearchRemove={handleRecentSearchRemove}
        onRecentSearchClear={handleRecentSearchClear}
      />
    </div>
  );
};

export default DestinationSearchExample;
