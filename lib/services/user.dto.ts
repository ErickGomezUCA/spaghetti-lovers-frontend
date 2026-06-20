export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
  phone?: string;
};
