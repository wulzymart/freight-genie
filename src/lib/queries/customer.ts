import {queryOptions} from "@tanstack/react-query";
import {ApiResponseType, CorporateCustomer, Customer} from "@/lib/custom-types.ts";
import {axiosInstance} from "@/lib/axios.ts";

export function getCustomerById(customerId: string) {
    return queryOptions({
        queryKey:[`customer-${customerId}`],
        queryFn: async () => {
            const {data}: {data: ApiResponseType} = await axiosInstance.get(
                "/vendor/customers/" + customerId
            );
            if (!data?.success) throw new Error(data.message)
            return data.customer as Customer;
        }
    })
}
export function getCorporateCustomer(idOrPhone: string) {
    return queryOptions({
        queryKey:[`corporateCustomer-${idOrPhone}`],
        queryFn: async () => {
            const {data}: {data: ApiResponseType} = await axiosInstance.get(
                "/vendor/customers/corporate/" + idOrPhone
            );
            if (!data?.success) throw new Error(data.message)
            return data.corporateCustomer as CorporateCustomer;
        }
    })
}
