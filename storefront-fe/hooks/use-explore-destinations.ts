'use client';

import { useState, useCallback } from 'react';
import { aiChatService } from '@/modules/ai/service/ai-chat';
import type { ChatStructuredResult } from '@/modules/ai/types';
import { usePreferences } from '@/contexts/preferences-context';

export function useExploreDestinations() {
  const { locationInfo } = usePreferences();
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreResults, setExploreResults] = useState<ChatStructuredResult[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreMessage, setExploreMessage] = useState("");

  const handleExploreSearch = useCallback(async () => {
    if (!exploreQuery.trim()) return;
    
    setExploreLoading(true);
    setExploreMessage("");
    
    try {
      const userCountry = locationInfo?.country;
      const response = await aiChatService.exploreDestinations(exploreQuery, userCountry);
      
      setExploreMessage(response.aiResponse || "");
      setExploreResults(response.results || []);
    } catch (error) {
      console.error("Explore search error:", error);
      setExploreMessage("Xin lỗi, không thể tìm kiếm địa điểm lúc này.");
      setExploreResults([]);
    } finally {
      setExploreLoading(false);
    }
  }, [exploreQuery, locationInfo?.country]);

  const handleTrendingClick = useCallback(async () => {
    setExploreLoading(true);
    setExploreMessage("");
    setExploreQuery("Trending destinations");
    
    try {
      const userCountry = locationInfo?.country;
      const response = await aiChatService.getTrendingDestinations(userCountry);
      
      setExploreMessage(response.aiResponse || "");
      setExploreResults(response.results || []);
    } catch (error) {
      console.error("Trending error:", error);
      setExploreMessage("Xin lỗi, không thể tải địa điểm thịnh hành.");
      setExploreResults([]);
    } finally {
      setExploreLoading(false);
    }
  }, [locationInfo?.country]);

  const handleSeasonalClick = useCallback(async () => {
    setExploreLoading(true);
    setExploreMessage("");
    setExploreQuery("Seasonal destinations");
    
    try {
      const month = new Date().getMonth() + 1;
      let season = "summer";
      if (month >= 3 && month <= 5) season = "spring";
      else if (month >= 6 && month <= 8) season = "summer";
      else if (month >= 9 && month <= 11) season = "fall";
      else season = "winter";
      
      const userCountry = locationInfo?.country;
      const response = await aiChatService.getSeasonalDestinations(season, userCountry);
      
      setExploreMessage(response.aiResponse || "");
      setExploreResults(response.results || []);
    } catch (error) {
      console.error("Seasonal error:", error);
      setExploreMessage("Xin lỗi, không thể tải gợi ý theo mùa.");
      setExploreResults([]);
    } finally {
      setExploreLoading(false);
    }
  }, [locationInfo?.country]);

  const loadDefaultDestinations = useCallback(async () => {
    if (exploreResults.length > 0) return;
    
    setExploreLoading(true);
    setExploreMessage("");
    
    try {
      const response = await aiChatService.getDefaultDestinations();
      setExploreMessage(response.aiResponse || "Gợi ý điểm đến cho bạn");
      setExploreResults(response.results || []);
    } catch (error) {
      console.error("Default destinations error:", error);
      setExploreMessage("Chào mừng! Sử dụng tìm kiếm hoặc nút Thịnh hành để khám phá điểm đến.");
      setExploreResults([]);
    } finally {
      setExploreLoading(false);
    }
  }, [exploreResults.length]);

  return {
    exploreQuery,
    setExploreQuery,
    exploreResults,
    exploreLoading,
    exploreMessage,
    handleExploreSearch,
    handleTrendingClick,
    handleSeasonalClick,
    loadDefaultDestinations
  };
}
