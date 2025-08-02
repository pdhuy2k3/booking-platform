"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { FlightOffer } from "@/types/api/flight";
import { Plane } from "lucide-react";

interface FlightCardProps {
  flight: FlightOffer;
  onSelect?: (flight: FlightOffer) => void;
  className?: string;
}

export function FlightCard({ flight, onSelect, className }: FlightCardProps) {
  const outboundSegment = flight.outbound[0];
  const lastOutboundSegment = flight.outbound[flight.outbound.length - 1];
  const totalStops = flight.outbound.reduce((acc, segment) => acc + segment.stops, 0);

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTotalDuration = () => {
    const departure = new Date(outboundSegment.departure.dateTime);
    const arrival = new Date(lastOutboundSegment.arrival.dateTime);
    const durationMs = arrival.getTime() - departure.getTime();
    return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Flight Route Info */}
          <div className="flex-1 space-y-4">
            {/* Outbound Flight */}
            <div className="flex items-center space-x-4">
              {/* Departure */}
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatTime(outboundSegment.departure.dateTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {outboundSegment.departure.airport.code}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(outboundSegment.departure.dateTime)}
                </div>
              </div>

              {/* Flight Path */}
              <div className="flex-1 flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{formatDuration(getTotalDuration())}</span>
                </div>
                <div className="w-full flex items-center">
                  <div className="h-px bg-border flex-1"></div>
                  <Plane className="h-4 w-4 text-primary mx-2" />
                  <div className="h-px bg-border flex-1"></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalStops === 0 ? "Direct" : `${totalStops} stop${totalStops > 1 ? "s" : ""}`}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatTime(lastOutboundSegment.arrival.dateTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {lastOutboundSegment.arrival.airport.code}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(lastOutboundSegment.arrival.dateTime)}
                </div>
              </div>
            </div>

            {/* Return Flight (if round-trip) */}
            {flight.inbound && flight.inbound.length > 0 && (
              <div className="flex items-center space-x-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatTime(flight.inbound[0].departure.dateTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {flight.inbound[0].departure.airport.code}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(flight.inbound[0].departure.dateTime)}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{formatDuration(flight.inbound.reduce((acc, seg) => acc + seg.duration, 0))}</span>
                  </div>
                  <div className="w-full flex items-center">
                    <div className="h-px bg-border flex-1"></div>
                    <Plane className="h-4 w-4 text-primary mx-2 rotate-180" />
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {flight.inbound.length === 1 ? "Direct" : `${flight.inbound.length - 1} stop${flight.inbound.length > 2 ? "s" : ""}`}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatTime(flight.inbound[flight.inbound.length - 1].arrival.dateTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {flight.inbound[flight.inbound.length - 1].arrival.airport.code}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(flight.inbound[flight.inbound.length - 1].arrival.dateTime)}
                  </div>
                </div>
              </div>
            )}

            {/* Airline and Flight Details */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>{outboundSegment.airline.name}</span>
                <span>•</span>
                <span>{outboundSegment.flightNumber}</span>
                <span>•</span>
                <span className="capitalize">{outboundSegment.class}</span>
              </div>
              {!flight.pricingOptions.refundable && (
                <span className="text-xs text-warning">Non-refundable</span>
              )}
            </div>
          </div>

          {/* Price and Select Button */}
          <div className="ml-6 text-right space-y-2">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(flight.price.total.amount, flight.price.total.currency)}
            </div>
            <div className="text-sm text-muted-foreground">
              per person
            </div>
            <Button 
              onClick={() => onSelect?.(flight)}
              className="w-full"
            >
              Select Flight
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
