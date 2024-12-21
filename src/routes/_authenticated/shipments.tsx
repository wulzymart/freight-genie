import { createFileRoute, Outlet } from "@tanstack/react-router";
import TitleCard from "@/components/page-components/title.tsx";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { shipmentsQueryStringSchema } from "@/lib/zodSchemas.ts";

export const Route = createFileRoute("/_authenticated/shipments")({
  component: () => (
    <div className="space-y-8">
      <TitleCard title="Manage Shipments" />
      <Outlet />
    </div>
  ),
  validateSearch: zodSearchValidator(shipmentsQueryStringSchema),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context: { queryClient } }) => {
    // await queryClient.ensureQueryData();
  },
});
