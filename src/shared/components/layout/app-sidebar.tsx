"use client";

import {
  Home,
  FolderKanban,
  Ticket,
  FileText,
  FolderOpen,
} from "lucide-react";

import { OrgSwitcher } from "@/shared/components/layout/org-switcher";
import { NavMain, type NavMainItem } from "@/shared/components/layout/nav-main";
import { NavUser } from "@/shared/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMainItems: NavMainItem[] = [
  {
    title: "Inicio",
    url: "/for-you",
    icon: Home,
  },
  {
    title: "Proyectos",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Tickets",
    url: "/helpdesk",
    icon: Ticket,
  },
  {
    title: "Documentacion",
    url: "/documents",
    icon: FileText,
  },
];

// TODO: Replace with real data from API (e.g. useQuery to fetch recent projects)
const recentProjects = [
  { name: "eProject Frontend", url: "/projects/eproject-frontend", key: "EP" },
  { name: "API Backend", url: "/projects/api-backend", key: "AB" },
  { name: "Mobile App", url: "/projects/mobile-app", key: "MA" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />

        {/* Recent Projects */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Proyectos recientes</SidebarGroupLabel>
          <SidebarMenu>
            {recentProjects.map((project) => (
              <SidebarMenuItem key={project.key}>
                <SidebarMenuButton asChild>
                  <a href={project.url}>
                    <FolderOpen className="size-4" />
                    <span>{project.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
