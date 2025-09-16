'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Clock, Star } from 'lucide-react';
import { useDestinationSearch } from '../hooks/useDestinationSearch';
import type { DestinationSearchResult } from '../type';

interface DestinationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (destination: DestinationSearchResult) => void;
  title?: string;
  placeholder?: string;
  recentSearches?: DestinationSearchResult[];
  onRecentSearchRemove?: (destination: DestinationSearchResult) => void;
  onRecentSearchClear?: () => void;
}

const DestinationSearchModal: React.FC<DestinationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Chọn điểm đến",
  placeholder = "Tìm kiếm thành phố hoặc khách sạn...",
  recentSearches = [],
  onRecentSearchRemove,
  onRecentSearchClear
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  
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
    limit: 20
  });

  // Load popular destinations when modal opens
  useEffect(() => {
    if (isOpen && !searchQuery) {
      getPopularDestinations();
      setShowRecentSearches(true);
    }
  }, [isOpen, searchQuery, getPopularDestinations]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      searchDestinations(query);
      setShowRecentSearches(false);
    } else {
      clearSearch();
      setShowRecentSearches(true);
      getPopularDestinations();
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (destination: DestinationSearchResult) => {
    onSelect(destination);
    onClose();
    setSearchQuery('');
  };

  // Handle recent search removal
  const handleRecentSearchRemove = (e: React.MouseEvent, destination: DestinationSearchResult) => {
    e.stopPropagation();
    onRecentSearchRemove?.(destination);
  };

  // Handle clear recent searches
  const handleClearRecentSearches = () => {
    onRecentSearchClear?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {showRecentSearches && recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">Tìm kiếm gần đây</h3>
                </div>
                <button
                  onClick={handleClearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((destination, index) => (
                  <div
                    key={`recent-${index}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                    onClick={() => handleDestinationSelect(destination)}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{destination.name}</p>
                        <p className="text-xs text-gray-500">{destination.type} • {destination.country}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleRecentSearchRemove(e, destination)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {!showRecentSearches && (
            <div className="p-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Đang tìm kiếm...</span>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!loading && !error && destinations.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Không tìm thấy điểm đến nào</p>
                </div>
              )}

              {!loading && !error && destinations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Kết quả tìm kiếm</h3>
                  {destinations.map((destination, index) => (
                    <div
                      key={`search-${index}`}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{destination.name}</p>
                        <p className="text-xs text-gray-500">{destination.type} • {destination.country}</p>
                      </div>
                      {destination.relevanceScore > 0.8 && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Destinations */}
              {!loading && !error && destinations.length > 0 && !searchQuery && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Điểm đến phổ biến</h3>
                  {destinations.map((destination, index) => (
                    <div
                      key={`popular-${index}`}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{destination.name}</p>
                        <p className="text-xs text-gray-500">{destination.type} • {destination.country}</p>
                      </div>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationSearchModal;
