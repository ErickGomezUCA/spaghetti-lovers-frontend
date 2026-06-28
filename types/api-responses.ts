export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hastNext: boolean;
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
  verificationStatus: string | null;
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
  scheduledStart: string | null;
  scheduledEnd: string | null;
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
  nextScheduledDate: string;
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

export type ReservationStatus = "PENDING" | "RESERVED" | "ACTIVE" | "COMPLETED" | "CANCELLED";


export type ReservationResponse = {
    id: string;
    propertyId?: string;
    tenantId?: string;
    propertyName: string;
    tenantName: string;
    tenantEmail: string;
    checkInDate: string;
    checkOutDate: string;
    totalNights: number;
    guestsCount: number;
    totalPrice: number;
    reservationStatus: ReservationStatus;
    propertyCity: string;
    propertyDepartment: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hastNext: boolean;
}

export type LandlordReservationSummaryResponse = {
  reserved: number;
  active: number;
  completed: number;
  cancelled: number;
};

export type ReservationDetailResponse = {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalNights: number;
  baseTotal: number;
  cleaningFee: number;
  securityDepositAmount: number;
  longStayDiscount: number;
  totalPrice: number;
  reservationStatus: ReservationStatus;
  tenantName: string;
  tenantEmail: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    department: string;
    basePricePerNight: number;
  };
};

export type PaymentResponse = {
  id: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  refundAmount: number;
  createdAt: string;
  refundedAt?: string;
};

export type ReservationExtensionResponse = {
  reservation: ReservationResponse;
  extensionPayment: PaymentResponse;
};
export type AccessCode = {
    id: string;
    propertyId: string;
    reservationId: string;
    code: string;
    codeType: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
};

export type AccessCodeStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "INACTIVE";

export type CodeType = "ACCESS_CODE" | "RECOVERY_CODE";

export type AccessCodeDetailResponse = {
    accessCodeId: string;
    reservationId: string;
    propertyId: string;
    propertyTitle: string;
    propertyCity: string;
    propertyDepartment: string;
    tenantId: string;
    tenantName: string;
    code: string;
    codeType: CodeType;
    checkInDate: string;
    checkOutDate: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    accessCodeStatus: AccessCodeStatus;
    reservationStatus: string;
};

export type ReservationCancellationPreviewResponse = {
    reservationId: string;
    reservationStatus: ReservationStatus;
    checkInDate: string;
    checkOutDate: string;
    daysUntilCheckIn: number;
    cancellationPenalty: number;
    reservationRefundAmount: number;
    cleaningFeeRefundAmount: number;
    guaranteeDepositRefundAmount: number;
    totalRefundAmount: number;
};

export type ReservationCancellationResponse = {
    reservationId: string;
    reservationStatus: ReservationStatus;
    cancellationPenalty: number;
    reservationRefundAmount: number;
    cleaningFeeRefundAmount: number;
    guaranteeDepositRefundAmount: number;
    totalRefundAmount: number;
    cancelledAt: string;
};

export type NotificationType = "INFO" | "REMINDER" | "MAINTENANCE"

export type NotificationResponse = {
    id: string
    userId: string
    reservationId: string | null
    type: NotificationType
    title: string
    message: string
    isRead: boolean
    createdAt: string
}

export type BlockType = 'RESERVATION' | 'MAINTENANCE' | 'PREVENTIVE_MAINTENANCE'

export type ConflictResponse = {
  id: string
  blockType: BlockType
  timestampStart: string
  timestampEnd: string
  blockedReason: string | null
}

export type AvailabilityResponse = {
  available: boolean
  conflicts: ConflictResponse[]
}

export type ReservationCompletionResponse = {
    reservationId: string
    reservationStatus: ReservationStatus
    guaranteeDepositAmount: number
    retainedAmount: number
    guaranteeDepositRefundAmount: number
    additionalFinePaymentAmount: number
    completedAt: string
}

export type LandlordDashboardStats = {
    monthlyIncome: number
    averageOccupation: number
}

export type AdminMonthlySummary = {
    reservationsThisMonth: number
    incomeThisMonth: number
    averageOccupation: number
}



