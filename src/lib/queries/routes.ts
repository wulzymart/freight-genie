import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../axios";
import { ApiResponseType, Route } from "../custom-types";

export const getRoutes = queryOptions({
  queryKey: ["routes"],
  queryFn: async (): Promise<Route[]> => {
    const { data }: { data: ApiResponseType } =
      await axiosInstance.get("/vendor/routes");
    if (!data.success) throw new Error(data.message);
    return data.routes as Route[];
  },
});

export function getRouteById(id: number) {
  return queryOptions({
    queryKey: ["route", id],
    queryFn: async (): Promise<Route> => {
      const { data }: { data: ApiResponseType } = await axiosInstance.get(
        `/vendor/routes/${id}`,
      );
      if (!data.success) throw new Error(data.message);
      return data.route as Route;
    },
  });
}
