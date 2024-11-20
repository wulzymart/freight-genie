import { axiosInstance } from "@/lib/axios";
import { Station} from "@/lib/custom-types";
import { queryOptions } from "@tanstack/react-query";

export const getStations = queryOptions({
  queryKey: ["stations"],
  queryFn: async (): Promise<Station[]> => {
    return await axiosInstance
      .get("/vendor/stations")
      .then((res) => res.data.stations);
  },
});
