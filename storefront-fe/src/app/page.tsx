"use client";

import { useRouter } from "next/navigation";
import { AdvancedSearchForm } from "@/components/search/advanced-search-form";
import { format } from "date-fns";

export default function Home() {
  const router = useRouter();

  const handleSearch = (searchData: Record<string, unknown>) => {
    const params = new URLSearchParams();

    params.set("type", searchData.type);
    if (searchData.origin) params.set("from", searchData.origin);
    params.set("to", searchData.destination);

    if (searchData.type === "hotels") {
      if (searchData.checkIn) params.set("checkin", format(searchData.checkIn, "yyyy-MM-dd"));
      if (searchData.checkOut) params.set("checkout", format(searchData.checkOut, "yyyy-MM-dd"));
    } else {
      if (searchData.departureDate) params.set("depart", format(searchData.departureDate, "yyyy-MM-dd"));
      if (searchData.returnDate) params.set("return", format(searchData.returnDate, "yyyy-MM-dd"));
      if (searchData.tripType) params.set("tripType", searchData.tripType);
    }

    params.set("adults", searchData.passengers.adults.toString());
    params.set("children", searchData.passengers.children.toString());
    params.set("infants", searchData.passengers.infants.toString());

    if (searchData.rooms) params.set("rooms", JSON.stringify(searchData.rooms));
    if (searchData.class) params.set("class", searchData.class);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Your Journey Starts Here
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover amazing destinations, book flights, hotels, and create unforgettable travel experiences with BookingSmart.
          </p>

          {/* Advanced Search Form */}
          <div className="max-w-4xl mx-auto">
            <AdvancedSearchForm
              onSearch={handleSearch}
              className="bg-white/80 backdrop-blur-sm shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose BookingSmart?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✈️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Flight Deals</h3>
              <p className="text-muted-foreground">
                Compare prices from hundreds of airlines to find the best deals for your journey.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Hotels</h3>
              <p className="text-muted-foreground">
                Book from a wide selection of hotels, from budget-friendly to luxury accommodations.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Travel Packages</h3>
              <p className="text-muted-foreground">
                Save more with our curated travel packages that combine flights, hotels, and activities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
