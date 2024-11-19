import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../axios";

export const getStatesWithLgas = queryOptions({
  queryKey: ["states_lgas"],
  queryFn: async () => {
    const statesLGAsRes = await axiosInstance.get("/vendor/locations/states");
    return statesLGAsRes.data.states;
  },
});
