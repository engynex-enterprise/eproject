"use client";

import { useState } from "react";
import {
  Building2,
  ChevronsUpDown,
  Plus,
  Check,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentOrg } from "@/shared/hooks/use-current-org";
import { CreateOrganizationDialog } from "@/shared/components/layout/create-organization-dialog";

export function OrgSwitcher() {
  const { isMobile } = useSidebar();
  const { currentOrg, currentOrgId, organizations, setCurrentOrg } =
    useCurrentOrg();
  const [createOpen, setCreateOpen] = useState(false);

  // Team orgs (non-personal) shown in the "Organizaciones" section
  const teamOrgs = organizations.filter((o) => !o.isPersonal);
  // Personal workspace org
  const personalOrg = organizations.find((o) => o.isPersonal);
  // Personal mode: no org selected OR selected org is personal
  const isPersonalMode = currentOrg === null || currentOrg.isPersonal;

  const personalName = personalOrg?.name ?? "Cuenta personal";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {!isPersonalMode ? (
                    <Building2 className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {!isPersonalMode ? currentOrg!.name : personalName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {!isPersonalMode ? currentOrg!.slug : "Personal"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="start"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Cuenta
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setCurrentOrg(null)}
                className="gap-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <User className="size-3.5" />
                </div>
                <span>{personalName}</span>
                {isPersonalMode && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>

              {teamOrgs.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Organizaciones
                  </DropdownMenuLabel>
                  {teamOrgs.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => setCurrentOrg(org.id)}
                      className="gap-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border bg-primary/10">
                        {org.logoUrl ? (
                          <img
                            src={org.logoUrl}
                            alt={org.name}
                            className="size-4 rounded-sm object-cover"
                          />
                        ) : (
                          <Building2 className="size-3.5 text-primary" />
                        )}
                      </div>
                      <span>{org.name}</span>
                      {currentOrgId === org.id && (
                        <Check className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setCreateOpen(true)}
                className="gap-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border border-dashed">
                  <Plus className="size-3.5" />
                </div>
                <span className="text-muted-foreground">
                  Crear organizacion
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
