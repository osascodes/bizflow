export type AuthFormData = {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
};

export type AuthError = {
  message: string;
  code?: string;
};