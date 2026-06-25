// Mock data for Tenant Dashboard

export interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  department: string
  country: string
  basePricePerNight: number
  cleaningFee: number
  securityDepositAmount: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  areaSqm: number
  propertyType: string
  propertyStatus: 'active' | 'reserved' | 'inactive' | 'unavailable'
  rules: string
  photos: string[]
  landlordId: string
  landlordName: string
  landlordRating: number
}

export interface Reservation {
  id: string
  propertyId: string
  property: Property
  tenantId: string
  checkInDate: string
  checkOutDate: string
  guestsCount: number
  totalNights: number
  baseTotal: number
  cleaningFee: number
  longStayDiscount: number
  totalPrice: number
  reservationStatus: 'reserved' | 'active' | 'completed' | 'cancelled'
  cancellationPenalty: number
  paymentMethod: string
  createdAt: string
  accessCode?: string
}

export interface Contract {
  id: string
  reservationId: string
  contentUrl: string
  contractStatus: 'pending_signatures' | 'signed'
  tenantSigned: boolean
  landlordSigned: boolean
  expiresAt: string
  createdAt: string
}

export interface MaintenanceRequest {
  id: string
  propertyId: string
  reservationId: string
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  maintenanceStatus: 'scheduled' | 'resolving' | 'resolved'
  photos: string[]
  resolutionNotes?: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'info' | 'remainder' | 'maintenance'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface Fine {
  id: string
  reservationId: string
  fineType: 'property_damage' | 'noise_violation' | 'late_checkout' | 'late_payment'
  description: string
  amount: number
  issuedAt: string
  resolvedAt?: string
}

export interface Rating {
  id: string
  reservationId: string
  reviewerId: string
  reviewedId: string
  score: number
  comment: string
  createdAt: string
}

export interface IdentityDocument {
  id: string
  userId: string
  documentUrl: string
  documentStatus: 'pending' | 'verified' | 'rejected'
  createdAt: string
}

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno en Zona Rosa',
    description: 'Hermoso apartamento totalmente amueblado con vista a la ciudad. Cuenta con todas las comodidades modernas, aire acondicionado, WiFi de alta velocidad y estacionamiento privado.',
    address: 'Calle La Mascota #123',
    city: 'San Salvador',
    department: 'San Salvador',
    country: 'El Salvador',
    basePricePerNight: 75,
    cleaningFee: 25,
    securityDepositAmount: 150,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 85,
    propertyType: 'apartamento',
    propertyStatus: 'active',
    rules: 'No fumar, no mascotas, no fiestas. Check-in después de las 3PM, check-out antes de las 11AM.',
    photos: ['/placeholder.svg?height=400&width=600'],
    landlordId: 'l1',
    landlordName: 'María González',
    landlordRating: 4.8
  },
  {
    id: '2',
    title: 'Casa de Playa en Costa del Sol',
    description: 'Espectacular casa frente al mar con piscina privada. Perfecta para vacaciones familiares o con amigos.',
    address: 'Km 65 Costa del Sol',
    city: 'La Paz',
    department: 'La Paz',
    country: 'El Salvador',
    basePricePerNight: 150,
    cleaningFee: 50,
    securityDepositAmount: 300,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 200,
    propertyType: 'casa_playa',
    propertyStatus: 'active',
    rules: 'Respetar horarios de piscina (6AM-10PM). No música alta después de las 10PM.',
    photos: ['/placeholder.svg?height=400&width=600'],
    landlordId: 'l2',
    landlordName: 'Carlos Mejía',
    landlordRating: 4.5
  },
  {
    id: '3',
    title: 'Cabaña en Apaneca',
    description: 'Acogedora cabaña en las montañas con chimenea y vista panorámica. Ideal para escapar del calor.',
    address: 'Finca El Ciprés, Apaneca',
    city: 'Apaneca',
    department: 'Ahuachapán',
    country: 'El Salvador',
    basePricePerNight: 95,
    cleaningFee: 30,
    securityDepositAmount: 180,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 120,
    propertyType: 'cabaña',
    propertyStatus: 'active',
    rules: 'Cuidado con la chimenea. No dejar fogatas encendidas sin supervisión.',
    photos: ['/placeholder.svg?height=400&width=600'],
    landlordId: 'l3',
    landlordName: 'Ana Portillo',
    landlordRating: 4.9
  }
]

// Mock Reservations
// export const mockReservations: Reservation[] = [
//     {
//         id: '4d4da334-dfa8-409c-ba6d-7d55a3b47744',
//         propertyId: 'b66cd464-c738-4e1b-b6de-e9aaa4387d83',
//         property: mockProperties[0],
//         tenantId: 'ca09c576-3d08-4791-b6b3-83c3f6f589e7',
//         checkInDate: '2026-06-24',
//         checkOutDate: '2026-06-29',
//         guestsCount: 2,
//         totalNights: 5,
//         baseTotal: 325,
//         cleaningFee: 15,
//         longStayDiscount: 0,
//         totalPrice: 440,
//         reservationStatus: 'active',
//         cancellationPenalty: 0,
//         paymentMethod: 'card',
//         createdAt: '2026-06-24'
//     },
//   {
//     id: 'r2',
//     propertyId: '2',
//     property: mockProperties[1],
//     tenantId: 't1',
//     checkInDate: '2026-05-01',
//     checkOutDate: '2026-05-05',
//     guestsCount: 4,
//     totalNights: 4,
//     baseTotal: 600,
//     cleaningFee: 50,
//     longStayDiscount: 0,
//     totalPrice: 950,
//     reservationStatus: 'completed',
//     cancellationPenalty: 0,
//     paymentMethod: 'transfer',
//     createdAt: '2026-04-20'
//   },
//   {
//     id: 'r3',
//     propertyId: '3',
//     property: mockProperties[2],
//     tenantId: 't1',
//     checkInDate: '2026-06-05',
//     checkOutDate: '2026-06-08',
//     guestsCount: 3,
//     totalNights: 3,
//     baseTotal: 285,
//     cleaningFee: 30,
//     longStayDiscount: 0,
//     totalPrice: 495,
//     reservationStatus: 'active',
//     cancellationPenalty: 0,
//     paymentMethod: 'cash',
//     createdAt: '2026-05-28',
//     accessCode: 'RF2024C3'
//   }
// ]

export const mockReservations = [
    {
        id: "61d88f4e-e533-4218-ba91-58715bc5a504",
        property: {
            id: "b66cd464-c738-4e1b-b6de-e9aaa4387d83",
            title: "Apartamento Moderno en Zona Rosa",
            description: "Apartamento cómodo y moderno, ideal para estadías cortas.",
            address: "Colonia San Benito, Zona Rosa",
            city: "San Salvador",
            department: "San Salvador",
            country: "El Salvador",
            basePricePerNight: 65,
            cleaningFee: 15,
            securityDepositAmount: 100,
            maxGuests: 4,
            bedrooms: 2,
            bathrooms: 1,
            areaSqm: 75.5,
            propertyType: "APARTMENT",
            rules: "No fumar. No fiestas. No mascotas.",
            photos: ["/placeholder.svg"],
        },
        checkInDate: "2026-06-30",
        checkOutDate: "2026-07-02",
        guestsCount: 2,
        totalNights: 2,
        baseTotal: 130,
        cleaningFee: 15,
        longStayDiscount: 0,
        totalPrice: 245,
        reservationStatus: "reserved",
        accessCode: "TEST-001",
    },
    {
        id: "1765aa65-7bf9-476f-99c2-24d66dc2b122",
        property: {
            id: "b66cd464-c738-4e1b-b6de-e9aaa4387d83",
            title: "Apartamento Moderno en Zona Rosa",
            description: "Apartamento cómodo y moderno, ideal para estadías cortas.",
            address: "Colonia San Benito, Zona Rosa",
            city: "San Salvador",
            department: "San Salvador",
            country: "El Salvador",
            basePricePerNight: 65,
            cleaningFee: 15,
            securityDepositAmount: 100,
            maxGuests: 4,
            bedrooms: 2,
            bathrooms: 1,
            areaSqm: 75.5,
            propertyType: "APARTMENT",
            rules: "No fumar. No fiestas. No mascotas.",
            photos: ["/placeholder.svg"],
        },
        checkInDate: "2026-07-20",
        checkOutDate: "2026-07-25",
        guestsCount: 2,
        totalNights: 5,
        baseTotal: 325,
        cleaningFee: 15,
        longStayDiscount: 0,
        totalPrice: 440,
        reservationStatus: "reserved",
        accessCode: "TEST-002",
    },
    {
        id: "4d4da334-dfa8-409c-ba6d-7d55a3b47744",
        property: {
            id: "050465ac-a009-4ce5-b5dc-254ccd94c448",
            title: "Cabaña con Vista al Lago de Coatepeque",
            description: "Cabaña acogedora con vista al lago, ideal para descansar durante el fin de semana.",
            address: "Calle al Lago de Coatepeque",
            city: "El Congo",
            department: "Santa Ana",
            country: "El Salvador",
            basePricePerNight: 95,
            cleaningFee: 25,
            securityDepositAmount: 200,
            maxGuests: 5,
            bedrooms: 2,
            bathrooms: 2,
            areaSqm: 90,
            propertyType: "CABIN",
            rules: "No fiestas grandes. No fumar dentro de la cabaña. Respetar las áreas comunes.",
            photos: ["/placeholder.svg"],
        },
        checkInDate: "2026-06-27",
        checkOutDate: "2026-06-28",
        guestsCount: 1,
        totalNights: 1,
        baseTotal: 95,
        cleaningFee: 25,
        longStayDiscount: 0,
        totalPrice: 320,
        reservationStatus: "reserved",
        accessCode: "TEST-003",
    },
];

// Mock Contracts
export const mockContracts: Contract[] = [
  {
    id: 'c1',
    reservationId: 'r1',
    contentUrl: '/contracts/contract-r1.pdf',
    contractStatus: 'pending_signatures',
    tenantSigned: false,
    landlordSigned: true,
    expiresAt: '2026-06-14T12:00:00Z',
    createdAt: '2026-06-01'
  },
  {
    id: 'c3',
    reservationId: 'r3',
    contentUrl: '/contracts/contract-r3.pdf',
    contractStatus: 'signed',
    tenantSigned: true,
    landlordSigned: true,
    expiresAt: '2026-06-04T12:00:00Z',
    createdAt: '2026-05-28'
  }
]

// Mock Maintenance Requests
export const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'm1',
    propertyId: '3',
    reservationId: 'r3',
    title: 'Fuga de agua en baño principal',
    description: 'Hay una fuga de agua en el grifo del lavamanos del baño principal. El goteo es constante.',
    urgency: 'high',
    maintenanceStatus: 'resolving',
    photos: ['/placeholder.svg?height=200&width=300'],
    createdAt: '2026-06-06'
  }
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'info',
    title: 'Reserva confirmada',
    message: 'Tu reserva en Apartamento Moderno en Zona Rosa ha sido confirmada para el 15-20 de junio.',
    read: false,
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'n2',
    type: 'info',
    title: 'Contrato pendiente de firma',
    message: 'Tienes un contrato pendiente de firma para tu próxima reserva. Firma antes del 14 de junio.',
    read: false,
    createdAt: '2026-06-01T10:05:00Z'
  },
  {
    id: 'n3',
    type: 'maintenance',
    title: 'Solicitud de mantenimiento actualizada',
    message: 'Tu solicitud de mantenimiento "Fuga de agua en baño principal" está siendo atendida.',
    read: true,
    createdAt: '2026-06-06T14:00:00Z'
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Código de acceso generado',
    message: 'Tu código de acceso RF2024C3 está activo para la propiedad Cabaña en Apaneca.',
    read: true,
    createdAt: '2026-06-05T08:00:00Z'
  }
]

// Mock Fines
export const mockFines: Fine[] = []

// Mock Identity Document
export const mockIdentityDocument: IdentityDocument | null = {
  id: 'id1',
  userId: 't1',
  documentUrl: '/documents/dui-tenant.pdf',
  documentStatus: 'verified',
  createdAt: '2026-01-15'
}

// Current User
export const currentUser = {
  id: 't1',
  name: 'Juan Pérez',
  email: 'juan.perez@email.com',
  phone: '+503 7890-1234',
  role: 'Tenant' as const,
  averageRating: 4.7,
  totalRatings: 5
}
