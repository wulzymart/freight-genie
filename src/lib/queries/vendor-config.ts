import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "../axios";

export const getVendorConfig = queryOptions({
  queryKey: ["vendor-config"],
  queryFn: async () => {
    const { data } = await axiosInstance.get("/vendor/config");
    return data.config;
  },
});
