import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout-components/menu/sidebar";
import MobileMenu from "@/components/layout-components/menu/mobile-menu";
import AppBreadCrumb from "@/components/layout-components/bread-crumb";
import { getStoredUser, useAuth } from "@/hooks/auth-context";
import { useCallback } from "react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    const { setUser } = context.auth;
    const user = getStoredUser();
    if (user) {
      setUser(user);
    } else {
      throw redirect({ to: "/login" });
    }
  },
  component: PanelLayout,
});

export function PanelLayout() {
  const navigate = Route.useNavigate();
  const router = useRouter();
  const { logout } = useAuth();
  const signOut = useCallback(() => {
    logout();
    router.invalidate();
    navigate({ to: "/login" });
  }, []);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 overflow-auto">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <MobileMenu />
          <AppBreadCrumb />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <img
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/user/security">Security</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
