"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import type { LoginRequest } from "@/shared/types";

export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      router.push("/for-you");
    },
  });
}
