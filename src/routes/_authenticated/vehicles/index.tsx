import { createFileRoute } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { VehiclesQueryStringsSchema } from "@/lib/zodSchemas.ts";
import qs from "qs";
import { getVehicles } from "@/lib/queries/vehicle.ts";
import { VehicleTable } from "@/tables/vehicles/vehicle-table.tsx";

export const Route = createFileRoute("/_authenticated/vehicles/")({
  component: VehicleTable,
  validateSearch: zodSearchValidator(VehiclesQueryStringsSchema),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { queryClient } }) => {
    const searchQueryString =
      !search || Object.keys(search).length === 0 ? "" : qs.stringify(search);
    return await queryClient.ensureQueryData(getVehicles(searchQueryString));
  },
});
