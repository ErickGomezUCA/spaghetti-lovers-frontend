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
