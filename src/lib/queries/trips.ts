import { queryOptions } from "@tanstack/react-query";
import { ApiResponseType, Trip } from "@/lib/custom-types.ts";
import { axiosInstance } from "@/lib/axios.ts";

export const getTrips = (filter?: string) =>
  queryOptions({
    queryKey: ["trips", filter],
    queryFn: async (): Promise<{ trips: Trip[]; count: number }> => {
      const {
        data: { success, message, trips, count },
      }: { data: ApiResponseType } = await axiosInstance.get(
        "/vendor/trips" + "?" + filter,
      );
      if (!success) throw new Error(message);
      return { trips, count };
    },
  });

export const getTrip = (id: string) =>
  queryOptions({
    queryKey: ["trip", id],
    queryFn: async (): Promise<Trip> => {
      const {
        data: { success, message, trip },
      }: {
        data: ApiResponseType;
      } = await axiosInstance.get(`/vendor/trips/${id}`);
      if (!success) throw new Error(message);
      return trip;
    },
  });
