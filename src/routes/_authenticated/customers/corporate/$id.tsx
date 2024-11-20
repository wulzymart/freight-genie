import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { getCorporateCustomer } from '@/lib/queries/customer.ts'

export const Route = createFileRoute('/_authenticated/customers/corporate/$id')(
  {
    loader: async ({ params: { id }, context: { queryClient } }) => {
      const corporateCustomer = await queryClient.ensureQueryData(
        getCorporateCustomer(id),
      )
      if (!corporateCustomer) return notFound()
      return corporateCustomer
    },
    component: () => (
        <Outlet />
    ),
  },
)
