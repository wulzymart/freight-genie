import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../axios";
import { ApiResponseType } from "../custom-types";

export const getItemCategories = queryOptions({
  queryKey: ["item-categories"],
  queryFn: async () => {
    const { data } = await axiosInstance.get<ApiResponseType>(
      "/vendor/item-categories"
    );
    return data.itemCategories;
  },
});
