"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { useDateFormatter } from "@/hooks/use-date-formatter";

interface FlightCardProps {
  flight: {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    departureDateTime?: string;
    arrivalDateTime?: string;
    duration?: string;
    stops?: string | number;
    price: number;
    currency?: string;
    seatClass?: string;
    class?: string;
    logo?: string;
    rating?: number;
    scheduleId?: string;
    fareId?: string;
    raw?: any;
    originLatitude?: number;
    originLongitude?: number;
    destinationLatitude?: number;
    destinationLongitude?: number;
  };
  onViewDetails?: (flight: any) => void;
  onBook?: (flight: any) => void;
  onLocationClick?: (location: {
    lat: number;
    lng: number;
    title: string;
    description?: string;
  }) => void;
  showBookButton?: boolean;
  compact?: boolean;
  className?: string;
}

export const FlightCard = ({
  flight,
  onViewDetails,
  onBook,
  onLocationClick,
  showBookButton = true,
  compact = false,
  className = "",
}: FlightCardProps) => {
  const { formatTimeOnly } = useDateFormatter();
  const [imageError, setImageError] = useState(false);

  const getDisplayTime = (time: string) => {
    try {
      let date = new Date(time);
      if (Number.isNaN(date.getTime())) {
        date = new Date(`1970-01-01 ${time}`);
      }
      if (!isNaN(date.getTime())) {
        return formatTimeOnly(date.toISOString());
      }
    } catch (e) {
      // Fallback to original format
    }
    return time;
  };

  const departureTimeDisplay = getDisplayTime(flight.departureTime);
  const arrivalTimeDisplay = getDisplayTime(flight.arrivalTime);

  const stopsDisplay = (() => {
    if (typeof flight.stops === "number") {
      return flight.stops === 0 ? "Bay thẳng" : `${flight.stops} điểm dừng`;
    }

    if (typeof flight.stops === "string") {
      const trimmed = flight.stops.trim();
      if (!trimmed || trimmed === "0") {
        return "Bay thẳng";
      }

      const numeric = Number(trimmed);
      if (!Number.isNaN(numeric)) {
        return numeric === 0 ? "Bay thẳng" : `${numeric} điểm dừng`;
      }

      return trimmed;
    }

    return "Bay thẳng";
  })();

  return (
    <Card
      className={`hover:shadow-lg transition-shadow overflow-hidden ${className}`}
    >
      <CardContent className={`${compact ? "p-4" : "p-6"}`}>
        <div className="space-y-4">
          {/* Airline */}
          <div className="flex items-center gap-3 min-w-0">
            {flight.logo && (
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src={imageError ? "/airplane-generic.png" : flight.logo}
                  alt={flight.airline}
                  width={32}
                  height={32}
                  className="rounded object-contain"
                  onError={() => {
                    if (!imageError) {
                      setImageError(true);
                    }
                  }}
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate text-sm">
                {flight.airline}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {flight.flightNumber}
              </p>
            </div>
            {flight.seatClass && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {flight.seatClass}
              </Badge>
            )}
          </div>

          {/* Route */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center min-w-0">
            {/* Departure */}
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {departureTimeDisplay}
              </p>
              <p
                className={`text-xs sm:text-sm text-gray-600 truncate ${
                  flight.originLatitude &&
                  flight.originLongitude &&
                  onLocationClick
                    ? "cursor-pointer hover:text-blue-600 hover:underline"
                    : ""
                }`}
                onClick={() => {
                  if (
                    flight.originLatitude &&
                    flight.originLongitude &&
                    onLocationClick
                  ) {
                    onLocationClick({
                      lat: flight.originLatitude,
                      lng: flight.originLongitude,
                      title: flight.origin,
                      description: `Điểm khởi hành - ${flight.airline} ${flight.flightNumber}`,
                    });
                  }
                }}
              >
                {flight.origin}
              </p>
            </div>

            {/* Flight Info */}
            <div className="flex flex-col items-center gap-1 px-2 shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-gray-400">
                <div className="h-px w-4 sm:w-6 bg-gray-300" />
                <Plane className="h-3 w-3 sm:h-4 sm:w-4" />
                <div className="h-px w-4 sm:w-6 bg-gray-300" />
              </div>
              {flight.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] sm:text-xs">
                    {flight.duration}
                  </span>
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                {stopsDisplay}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-right min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {arrivalTimeDisplay}
              </p>
              <p
                className={`text-xs sm:text-sm text-gray-600 truncate ${
                  flight.destinationLatitude &&
                  flight.destinationLongitude &&
                  onLocationClick
                    ? "cursor-pointer hover:text-blue-600 hover:underline"
                    : ""
                }`}
                onClick={() => {
                  if (
                    flight.destinationLatitude &&
                    flight.destinationLongitude &&
                    onLocationClick
                  ) {
                    onLocationClick({
                      lat: flight.destinationLatitude,
                      lng: flight.destinationLongitude,
                      title: flight.destination,
                      description: `Điểm đến - ${flight.airline} ${flight.flightNumber}`,
                    });
                  }
                }}
              >
                {flight.destination}
              </p>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex sm:flex-row gap-3 border-t border-gray-100 pt-4 items-start sm:items-center justify-between min-w-0">
            <div className="min-w-0">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size={compact ? "sm" : "default"}
                  onClick={() => onViewDetails(flight)}
                  className="text-xs sm:text-sm"
                >
                  Chi tiết
                </Button>
              )}
            </div>

            {showBookButton && onBook && (
              <Button
                size={compact ? "sm" : "default"}
                onClick={() => onBook(flight)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center text-xs sm:text-sm px-4 py-2"
              >
                <span className="font-semibold">
                  {formatCurrency(flight.price, flight.currency || "VND")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
