import { queryOptions } from "@tanstack/react-query";
import { ApiResponseType, Shipment } from "@/lib/custom-types.ts";
import { axiosInstance } from "@/lib/axios.ts";

export const getShipments = (filter?: string) =>
  queryOptions({
    queryKey: filter ? ["shipments", filter] : ["shipments"],
    queryFn: async (): Promise<{ shipments: Shipment[]; count: number }> => {
      const {
        data: { success, message, shipments, count },
      }: { data: ApiResponseType } = await axiosInstance.get(
        `/vendor/shipments${filter ? `?${filter}` : ""}`,
      );
      if (!success) throw new Error(message);
      return { shipments, count };
    },
  });

export const getShipment = (id: string) =>
  queryOptions({
    queryKey: ["shipment", id],
    queryFn: async (): Promise<Shipment> => {
      const {
        data: { success, message, shipment },
      }: {
        data: ApiResponseType;
      } = await axiosInstance.get(`/vendor/shipments/${id}`);
      if (!success) throw new Error(message);
      return shipment;
    },
  });
