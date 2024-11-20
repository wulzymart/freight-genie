import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavTools } from "@/components/nav-tools.tsx"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Link} from "@tanstack/react-router";
import {useAuth} from "@/hooks/auth-context.tsx";
import {menuData} from "@/components/layout-components/menu/menu-data.ts";



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = useAuth()
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to='/dashboard'>
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-white text-sidebar-primary-foreground">
                  <img src='/freight-genie-logo.png' alt='Freight Genie Logo' className='bg-white aspect-square w-'/>
                </div>
                <div className="grid flex-1 text-[14px] leading-tight">
                  <span className="truncate font-semibold">Freight Genie</span>
                  <span className="truncate text-xs">Simplified Logistics</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuData.navMain} />
        <NavTools tools={menuData.projects} />
        <NavSecondary items={menuData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{name: `${user.staff.firstname} ${user.staff.lastname}`,email: user.email, avatar: '/avatar.svg'}} />
      </SidebarFooter>
    </Sidebar>
  )
}
