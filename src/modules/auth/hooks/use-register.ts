"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import type { RegisterRequest } from "@/shared/types";

export function useRegister() {
  const router = useRouter();
  const { register } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      router.push("/for-you");
    },
  });
}
