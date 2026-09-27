import api from './axiosInstance';

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const response = await api.post('/auth/register', input);
  return response.data;
}

export async function loginUser(input: LoginInput) {
  const response = await api.post('/auth/login', input);
  return response.data;
}

export async function verifyEmail(email: string, code: string) {
  const response = await api.post('/auth/verify-email', { email, code });
  return response.data;
}