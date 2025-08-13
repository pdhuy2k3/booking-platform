// Common types used across multiple domains
export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
}

export interface PaymentMethod {
  type: "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | "WALLET";
  provider?: string;
  details?: PaymentDetails;
}

export interface PaymentDetails {
  // Credit/Debit Card
  cardNumber?: string;
  expiryDate?: string;
  cardholderName?: string;
  cardType?: string;
  
  // PayPal
  paypalEmail?: string;
  
  // Bank Transfer
  bankAccount?: string;
  bankName?: string;
  
  // Wallet
  walletType?: string;
  walletId?: string;
}
