"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import type { LoginRequest } from "@/shared/types";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      const redirect = searchParams.get("redirect");
      router.push(redirect ?? "/for-you");
    },
  });
}
