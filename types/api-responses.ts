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

export type FileUploadResponse = {
  url: string;
  publicId: string;
  resourceType: string;
};

export type UserRole = "ADMIN" | "LANDLORD" | "TENANT";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
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

export type UserRatingsResponse = {
  totalRatings: number;
  averageScore: number | null;
  ratings: RatingResponse[];
};

export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string | null;
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

export type MaintenanceStatus = "SCHEDULED" | "RESOLVING" | "RESOLVED"

export type Urgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export type MaintenanceResponse = {
  id: string;
  propertyId: string | null;
  reservationId: string | null;
  reportedId: string | null;
  title: string;
  description: string | null;
  urgency: Urgency;
  resolutionNotes: string | null;
  maintenanceStatus: MaintenanceStatus;
  photoUrls: string[];
}

export type MaintenanceScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
export type MaintenanceScheduleStatus = "SCHEDULED" | "ACTIVE" | "DONE"

export type MaintenanceScheduleResponse = {
  id: string;
  propertyId: string | null;
  scheduledBy: string | null;
  title: string;
  description: string | null;
  frequency: MaintenanceScheduleFrequency;
  interval: number;
  lastCompletedAt: string | null;
  nextScheduleDate: string;
  status: MaintenanceScheduleStatus;
}

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
