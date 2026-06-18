export interface ValidationError {
  field: string;
  message: string;
}

export interface RegisterValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation: +503 1234-5678 format
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+\d{1,3}\s\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

// Format phone number: adds space after country code and hyphen before last 4 digits
export const formatPhone = (value: string): string => {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, "");

  // If it starts with +, keep it; otherwise add it
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  // Extract the parts
  const match = cleaned.match(/^(\+)(\d{1,3})(\d{0,4})(\d{0,4})$/);

  if (!match) return value;

  const [, plus, countryCode, firstPart, secondPart] = match;

  if (!firstPart) return plus + countryCode;
  if (!secondPart) return `${plus}${countryCode} ${firstPart}`;
  return `${plus}${countryCode} ${firstPart}-${secondPart}`;
};

// Password validation
// Requirements: at least one uppercase, one digit, one special character, minimum 12 characters
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
  return passwordRegex.test(password);
};

// Get password validation requirements
export const getPasswordRequirements = (password: string) => {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    hasMinLength: password.length >= 12,
  };
};

// Validate registration form
export const validateRegistration = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): RegisterValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: "name", message: "El nombre es requerido" });
  }

  if (!data.email.trim()) {
    errors.push({ field: "email", message: "El correo es requerido" });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Formato de correo inválido" });
  }

  if (!data.phone.trim()) {
    errors.push({ field: "phone", message: "El teléfono es requerido" });
  } else if (!validatePhone(data.phone)) {
    errors.push({
      field: "phone",
      message: "Formato: +503 1234-5678",
    });
  }

  if (!data.password) {
    errors.push({ field: "password", message: "La contraseña es requerida" });
  } else if (!validatePassword(data.password)) {
    errors.push({
      field: "password",
      message:
        "Mínimo 12 caracteres, una mayúscula, un número y un carácter especial",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
