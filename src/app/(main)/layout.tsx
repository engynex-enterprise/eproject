"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { ProjectSettingsSidebar } from "@/modules/projects/components/project-settings-sidebar";
import { ProjectSidebar } from "@/modules/projects/components/project-sidebar";
import { SiteHeader } from "@/shared/components/layout/site-header";
import { useAuthStore } from "@/shared/stores/auth.store";
import { useAuth } from "@/shared/hooks/use-auth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const { fetchCurrentUser } = useAuth();

  const isProjectSettings = /^\/projects\/[^/]+\/settings/.test(pathname);
  const isProjectRoute = /^\/projects\/[^/]+/.test(pathname) && !isProjectSettings;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      useAuthStore.setState({ accessToken: token, isAuthenticated: true });
      // Fetch user + orgs before rendering so the UI never shows stale state
      fetchCurrentUser().finally(() => setIsChecking(false));
    }
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to forced logout (e.g. both tokens expired — auth:logout event)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isChecking, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {isProjectSettings ? <ProjectSettingsSidebar /> : isProjectRoute ? <ProjectSidebar /> : <AppSidebar />}
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
