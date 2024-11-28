import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios.ts";
import { ApiResponseType, Vehicle } from "@/lib/custom-types.ts";

export const getVehicles = (filter?: string) =>
  queryOptions({
    queryKey: ["vehicles", filter],
    queryFn: async (): Promise<{ vehicles: Vehicle[]; count: number }> => {
      const {
        data: { success, message, vehicles, count },
      }: { data: ApiResponseType } = await axiosInstance.get(
        "/vendor/vehicles" + "?" + filter,
      );
      if (!success) throw new Error(message);
      return { vehicles, count };
    },
  });

export const getVehicle = (id: string) =>
  queryOptions({
    queryKey: ["vehicle", id],
    queryFn: async (): Promise<Vehicle> => {
      const {
        data: { success, message, vehicle },
      }: {
        data: ApiResponseType;
      } = await axiosInstance.get(`/vendor/vehicles/${id}`);
      if (!success) throw new Error(message);
      return vehicle;
    },
  });
