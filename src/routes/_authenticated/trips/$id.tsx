import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getTrip } from "@/lib/queries/trips.ts";

export const Route = createFileRoute("/_authenticated/trips/$id")({
  component: () => <Outlet />,
  loader: async ({ params: { id }, context: { queryClient } }) => {
    // await axiosInstance.get(`/vendor/trips/${id}/update-trip`);
    return await queryClient.ensureQueryData(getTrip(id));
  },
});
