import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../axios";
import { RouteInterface } from "../custom-types";

export const getRoutes = queryOptions({
  queryKey: ["routes"],
  queryFn: async (): Promise<RouteInterface[]> => {
    const { data } = await axiosInstance.get("/vendor/routes");
    return data.routes;
  },
});
