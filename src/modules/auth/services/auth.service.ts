import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/forgot-password",
    { email }
  );
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/reset-password",
    { token, newPassword }
  );
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.get<ApiResponse<{ message: string }>>(
    "/auth/verify-email",
    { token }
  );
}

export function googleAuthUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}

export function githubAuthUrl(): string {
  return `${API_BASE_URL}/auth/github`;
}
