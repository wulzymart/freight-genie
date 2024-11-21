import {createFileRoute, Outlet} from '@tanstack/react-router'
import {getOrderById} from "@/lib/queries/order.tsx";
import TitleCard from "@/components/page-components/title.tsx";
import {CustomErrorComponent} from "@/components/error-component.tsx";
import {getCustomerById} from "@/lib/queries/customer.ts";

export const Route = createFileRoute('/_authenticated/orders/$id')({
  component: () => <><TitleCard title='Order Management'/><Outlet/></>,
  loader: async ({params: {id}, context: {queryClient}}) => {
  const order = await queryClient.ensureQueryData(getOrderById(id))
    if (!order) throw  new Error("Order not found")
    const customer = await queryClient.ensureQueryData(getCustomerById(order.customerId))
    return {customer,order}
  },
  errorComponent: ({error}) => <><TitleCard title='Order Management'/><CustomErrorComponent errorMessage={error.message}/> </>
})
