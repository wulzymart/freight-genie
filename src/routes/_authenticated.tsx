import {
  createFileRoute,
  Outlet,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";

import { getStoredUser } from "@/hooks/auth-context";
import { getStatesWithLgas } from "@/lib/queries/states.ts";
import { getStations } from "@/lib/queries/stations.ts";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/layout-components/menu/app-sidebar.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { User } from "@/lib/custom-types.ts";
import { getRoutes } from "@/lib/queries/routes.ts";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    const { setUser } = context.auth;
    const user = getStoredUser();
    if (user) {
      setUser(user as User);
    } else {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({
    context: {
      queryClient,
      auth: {
        user: { staff },
      },
    },
  }) => {
    const statesLGAs = await queryClient.ensureQueryData(getStatesWithLgas);
    const stations = await queryClient.ensureQueryData(getStations);
    const routes = await queryClient.ensureQueryData(getRoutes);
    const staffStationId = staff?.officePersonnelInfo?.stationId;
    const staffState = statesLGAs.find(
      (state) =>
        state.id ===
        stations.find((station) => station.id === staffStationId)?.stateId,
    );
    return {
      statesLGAs,
      stations,
      staffState,
      staffStationId,
      routes,
    };
  },
  component: PageLayout,
});

function PageLayout() {
  const vendor = useLoaderData({ from: "__root__" });
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 pr-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex justify-end gap-8 w-full">
            <div className="flex flex-col">
              <p className="text-lg font-bold text-primary">
                {vendor.companyName}
              </p>
              <small>{vendor.address}</small>
            </div>
            {vendor.logo && (
              <img src={vendor.logo} alt="logo" width={50} height={50} />
            )}
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
