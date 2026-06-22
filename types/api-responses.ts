export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
  pagination?: PaginationMeta;
};

export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
};

export type Auth = {
  token: string;
  user: AppUser;
};

export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "ROOM"
  | "STUDIO"
  | "VILLA"
  | "CABIN"
  | "BEACH_HOUSE"
  | "COUNTRY_HOUSE"
  | "LOFT"
  | "CONDOMINIUM"
  | "HOSTEL"
  | "HOTEL"
  | "DUPLEX"
  | "PENTHOUSE";

export type PropertyStatus = "ACTIVE" | "RESERVED" | "UNAVAILABLE";

export type RatingResponse = {
  id: string;
  reservationId: string;
  reviewerId: string;
  reviewedId: string;
  score: number;
  comment: string;
  createdAt: string;
};

export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  propertiesCount: number;
  reservationsCount: number;
  completedReservationsCount: number;
  ratingsCount: number;
  averageScore: number | null;
  ratings: RatingResponse[];
};

export type ContractStatus = "SIGNED" | "PENDING_SIGNATURES";

export type ContractDetailResponse = {
  id: string;
  reservationId: string;
  contentUrl: string | null;
  contractStatus: ContractStatus;
  tenantSignatureId: string | null;
  landlordSignatureId: string | null;
  createdAtTimestamp: string | null;
  expiresAtTimestamp: string | null;
  propertyTitle: string;
  propertyCity: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  tenantName: string;
  landlordName: string;
};

export type Property = {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  department: string;
  country: string;
  basePricePerNight: number;
  cleaningFee: number;
  securityDepositAmount: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  propertyType: PropertyType;
  propertyStatus: PropertyStatus;
  rules: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
};
