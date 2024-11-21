import {queryOptions, } from "@tanstack/react-query";
import {ApiResponseType, Order} from "@/lib/custom-types.ts";
import {axiosInstance} from "@/lib/axios.ts";

export function getOrderById(id: string) {
    return queryOptions({
        queryKey:[`order-${id}`],
        queryFn: async () => {
            const {data}: {data: ApiResponseType} = await axiosInstance.get(
                "/vendor/orders/" + id
            );
            if (!data?.success) throw new Error(data.message)
            return data.order as Order;
        }
    })
}
