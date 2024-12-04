import { createFileRoute } from "@tanstack/react-router";
import { TripTable } from "@/tables/trips/trip-table.tsx";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { TripsQueryStringSchema } from "@/lib/zodSchemas.ts";
import qs from "qs";
import { getTrips } from "@/lib/queries/trips.ts";

export const Route = createFileRoute("/_authenticated/trips/")({
  component: TripTable,
  validateSearch: zodSearchValidator(TripsQueryStringSchema),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    const searchString = search ? qs.stringify(search) : undefined;
    return await queryClient.ensureQueryData(getTrips(searchString));
  },
});
