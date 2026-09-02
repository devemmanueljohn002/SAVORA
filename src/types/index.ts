export type UserRole = "CUSTOMER" | "VENDOR" | "RIDER" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface Vendor {
  id: string;
  name: string;
  logoUrl?: string;
  coverImageUrl?: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes: [number, number]; // [min, max]
  deliveryFee: number;
  distanceKm?: number;
  isOpen: boolean;
  isFavorite?: boolean;
  address?: string;
  about?: string;
  openingHours?: string;
}

export interface ProductOptionChoice {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string; // e.g. "Protein"
  required: boolean;
  multiSelect: boolean;
  choices: ProductOptionChoice[];
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  category: string; // e.g. "Popular", "Rice", "Soups"
  rating?: number;
  reviewCount?: number;
  isAvailable: boolean;
  isFavorite?: boolean;
  optionGroups?: ProductOptionGroup[];
}

export interface SearchFilters {
  distance?: number;
  minRating?: number;
  maxPrice?: number;
  maxDeliveryFee?: number;
  maxDeliveryTime?: number;
  cuisine?: string;
  openNow?: boolean;
  sortBy?: "relevance" | "rating" | "deliveryTime" | "deliveryFee";
}

export interface SearchResult {
  vendors: Vendor[];
  products: Product[];
}

export interface CartSelectedOption {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceLabel: string;
  priceDelta: number;
}

export interface CartLineItem {
  id: string; // client-generated line id, distinct from productId (same product can appear twice with different options)
  productId: string;
  vendorId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number; // base price + sum of selected option deltas
  quantity: number;
  selectedOptions: CartSelectedOption[];
  notes?: string;
}

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  fullAddress: string;
  city: string;
  state: string;
  landmark?: string;
  phone: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export type PaymentMethodType = "paystack" | "flutterwave" | "bank_transfer" | "ussd" | "cash_on_delivery";

export type OrderStatus =
  | "PLACED"
  | "PAYMENT_CONFIRMED"
  | "VENDOR_ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "RIDER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
}

export interface Order extends OrderTotals {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  items: CartLineItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethodType;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  deliveryAddress: Address;
  estimatedDeliveryAt?: string;
  createdAt: string;
  hasReview?: boolean;
}

export interface Rider {
  id: string;
  name: string;
  photoUrl?: string;
  rating: number;
  phone: string;
  vehicle: string;
}

export interface OrderTrackingUpdate {
  orderId: string;
  status: OrderStatus;
  rider?: Rider;
  estimatedDeliveryAt?: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  vendorRating: number;
  foodRating: number;
  deliveryRating: number;
  comment?: string;
  photoUrls?: string[];
  createdAt: string;
}

export type NotificationType =
  | "ORDER_UPDATE"
  | "PROMOTION"
  | "DISCOUNT"
  | "CATERING_UPDATE"
  | "PAYMENT"
  | "ACCOUNT";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  relatedOrderId?: string;
}

export type CateringServiceType =
  | "Weddings"
  | "Birthdays"
  | "Corporate Events"
  | "Parties"
  | "Meetings"
  | "Religious Events"
  | "School Events"
  | "Outdoor Events";

export interface CateringPackage {
  id: string;
  name: string;
  description?: string;
  pricePerHead?: number;
  flatPrice?: number;
  minGuests?: number;
}

export interface CateringProvider {
  id: string;
  name: string;
  logoUrl?: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
  serviceTypes: CateringServiceType[];
  location: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  description?: string;
  packages: CateringPackage[];
  contactPhone?: string;
}

export type CateringBookingStatus = "REQUESTED" | "QUOTED" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export interface CateringBooking {
  id: string;
  providerId: string;
  providerName: string;
  eventType: CateringServiceType;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventLocation: string;
  budget?: number;
  foodPreferences?: string;
  additionalRequirements?: string;
  status: CateringBookingStatus;
  quotedPrice?: number;
  createdAt: string;
}

export interface VendorDashboardSummary {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  averageRating: number;
  reviewCount: number;
  pendingCateringRequests: number;
}

export interface VendorEarningsTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: "PAID" | "PENDING";
  date: string;
}

export interface VendorEarningsSummary {
  totalEarnings: number;
  pendingPayout: number;
  lastPayoutAt?: string;
  transactions: VendorEarningsTransaction[];
}

export interface VendorStoreSettings {
  isOpen: boolean;
  openingHours: string;
  preparationTimeMinutes: number;
}

/** Customer-facing CateringBooking, seen from the provider/vendor side. */
export interface VendorCateringRequest {
  id: string;
  customerName: string;
  eventType: CateringServiceType;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventLocation: string;
  budget?: number;
  foodPreferences?: string;
  additionalRequirements?: string;
  status: CateringBookingStatus;
  createdAt: string;
}
