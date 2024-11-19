import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../axios";
import { ApiResponseType } from "../custom-types";

export const getItemTypes = queryOptions({
  queryKey: ["item-types"],
  queryFn: async () => {
    const { data } =
      await axiosInstance.get<ApiResponseType>("/vendor/item-types");
    return data.itemTypes;
  },
});
