export type SearchType = "flights" | "hotels" | "packages";

export interface SearchFormData {
  type: SearchType;
  // Flight/Package fields
  origin?: string;
  destination: string;
  departureDate: Date | undefined;
  returnDate?: Date | undefined;
  tripType?: "one-way" | "round-trip";
  // Hotel/Package fields
  checkIn?: Date | undefined;
  checkOut?: Date | undefined;
  // Common fields
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  rooms: {
    adults: number;
    children: number;
    childrenAges: number[];
  }[];
  class?: "economy" | "premium-economy" | "business" | "first";
}

export interface AdvancedSearchFormProps {
  initialData?: Partial<SearchFormData>;
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
  className?: string;
}
