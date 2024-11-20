import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {useAuth} from "@/hooks/auth-context.tsx";
import {Link} from "@tanstack/react-router";
import {MenuItem} from "@/components/layout-components/menu/menu-data.ts";

export function NavMain({
  items,
}: {
  items: MenuItem[];
}) {
  const {user} = useAuth()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.permitted && !item.permitted.includes(user.staff.role)) return;
          return <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.url}>
                  {({isActive}) => <>
                    <item.icon/>
                    <span className={`${isActive && 'font-bold'} text-[16px]`}>{item.title}</span>
                  </>}
                </Link>
              </SidebarMenuButton>
              {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          if (subItem.permitted && !subItem.permitted.includes(user.staff.role)) return;
                          return <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.url} activeOptions={{exact: true}}>
                                {({isActive}) => <span className={`${isActive && 'font-bold'} text-[15px]`}>{subItem.title}</span>}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
