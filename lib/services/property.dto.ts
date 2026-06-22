import { PropertyStatus, PropertyType } from "@/types/api-responses";

export type CreatePropertyRequest = {
  title: string;
  description?: string;
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
  rules?: string;
  photoUrls?: string[];
};

export type UpdatePropertyRequest = {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  department?: string;
  country?: string;
  basePricePerNight?: number;
  cleaningFee?: number;
  securityDepositAmount?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  propertyType?: PropertyType;
  propertyStatus?: PropertyStatus;
  rules?: string;
};

export type AttachPhotoRequest = {
  photoUrls: string[];
};
