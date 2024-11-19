import {queryOptions} from "@tanstack/react-query";
import {ApiResponseType} from "@/lib/custom-types.ts";
import {axiosInstance} from "@/lib/axios.ts";

export function getCustomerById(customerId: string) {
    return queryOptions({
        queryKey:[`customer-${customerId}`],
        queryFn: async () => {
            const {data}: {data: ApiResponseType} = await axiosInstance.get(
                "/vendor/customers/" + customerId
            );
            if (!data?.success) throw new Error(data.message)
            return data.customer;
        }
    })
}