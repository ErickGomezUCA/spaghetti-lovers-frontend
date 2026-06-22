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
