import * as React from "react";
import { Outlet } from "@tanstack/react-router";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { VendorContextType } from "@/hooks/vendor";
import { AuthContextType } from "@/hooks/auth-context";
import { Toaster } from "@/components/ui/toaster";
type RouterContext = {
  auth: AuthContextType;
  vendor: VendorContextType;
  queryClient: QueryClient;
};
export const Route = createRootRouteWithContext<RouterContext>()({
  loader: async ({ context: {vendor: vendorHooks} }) => {
    return await vendorHooks.loadVendor();
  },
  component: () => (
    <React.Fragment>
      <React.Suspense fallback={<div>Loading...</div>}>
        <TooltipProvider>
          <Outlet />
          <Toaster />
          <ReactQueryDevtools />
          <TanStackRouterDevtools
            position="bottom-right"
            initialIsOpen={false}
          />
        </TooltipProvider>
      </React.Suspense>
    </React.Fragment>
  ),
});
