export type RegisterFormData = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export type UpdateProfileFormData = {
  name: string;
  phone: string;
  email: string;
};

export type ChangePasswordFormData = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
