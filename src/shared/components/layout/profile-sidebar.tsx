"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, User, Palette, Bell, Shield, Globe } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const profileSidebarNavGroups: NavGroup[] = [
  {
    label: "Cuenta",
    items: [{ title: "Perfil", href: "/profile", icon: User }],
  },
  {
    label: "Personalización",
    items: [
      { title: "Apariencia", href: "/profile/appearance", icon: Palette },
    ],
  },
  {
    label: "Comunicación",
    items: [
      { title: "Notificaciones", href: "/profile/notifications", icon: Bell },
    ],
  },
  {
    label: "Seguridad",
    items: [{ title: "Seguridad", href: "/profile/security", icon: Shield }],
  },
  {
    label: "Regional",
    items: [
      { title: "Idioma y región", href: "/profile/language", icon: Globe },
    ],
  },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar>
      <SidebarHeader className="gap-0 p-0">
        <Button
          variant="ghost"
          className="h-14 w-full justify-start gap-2 rounded-none px-4 text-sm font-medium"
          onClick={() => router.push("/for-you")}
        >
          <ArrowLeft className="size-4" />
          Inicio
        </Button>

        <Separator />

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <User className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Configuración</p>
            <p className="text-xs text-muted-foreground">Mi perfil</p>
          </div>
        </div>

        <Separator />
      </SidebarHeader>

      <SidebarContent>
        {profileSidebarNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/profile"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
