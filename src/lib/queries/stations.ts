import { axiosInstance } from "@/lib/axios";
import { Station, StationType } from "@/lib/custom-types";
import { queryOptions } from "@tanstack/react-query";

export const getStations = queryOptions({
  queryKey: ["stations"],
  queryFn: async (): Promise<Station[]> => {
    return await axiosInstance
      .get("/vendor/stations")
      .then((res) => res.data.stations);
  },
});
export async function getStateRegionalStations(stateId: number) {
  return await axiosInstance
    .get(`/vendor/stations?stateId=${stateId}&type=${StationType.REGIONAL}`)
    .then((res) => res.data.stations);
}
export async function getStateStations(stateId: number) {
  return;
}
export async function getLgaStations(lgaId: number) {
  return await axiosInstance
    .get(`/vendor/stations?lgaId=${lgaId}`)
    .then((res) => res.data.stations);
}
