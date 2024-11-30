import { createFileRoute, notFound } from "@tanstack/react-router";
import * as z from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { getCustomerById } from "@/lib/queries/customer.ts";
import { Customer, StaffRole } from "@/lib/custom-types.ts";
import TitleCard from "@/components/page-components/title.tsx";
import { Prompt } from "@/forms/customer/new-customer-prompt..tsx";
import { CorporateCustomerForm } from "@/forms/customer/corporate-customer.tsx";
import { CustomErrorComponent } from "@/components/error-component.tsx";

const allowed = [
  StaffRole.MANAGER,
  StaffRole.REGION_MANAGER,
  StaffRole.DIRECTOR,
];
export const Route = createFileRoute("/_authenticated/customers/corporate/add")(
  {
    validateSearch: zodSearchValidator(
      z.object({
        page: z.optional(z.enum(["detail"])),
        customerId: z.optional(
          z.string().uuid({ message: "invalid customer id" }),
        ),
      }),
    ),
    loaderDeps({ search }) {
      return search;
    },
    async loader({ context: { queryClient }, deps: { customerId } }) {
      if (customerId) {
        const customer: Customer = await queryClient.ensureQueryData(
          getCustomerById(customerId),
        );
        if (!customer) return notFound();
        return customer;
      }
    },
    component: () => <Page />,
    beforeLoad: ({ context }) => {
      const { user } = context.auth;
      if (!allowed.includes(user.staff.role))
        throw new Error("You are not authorized to access this page");
    },
    errorComponent: ({ error }) => {
      return <CustomErrorComponent errorMessage={error.message} />;
    },
  },
);

function Page() {
  const { page } = Route.useSearch();
  return (
    <div className="grid gap-20">
      <TitleCard
        title="New Corporate Client"
        description="Add a new corporate client by upgrading a customer (new or old)"
      />
      {!page && <Prompt returnPage="corporate" />}
      {page === "detail" && <CorporateCustomerForm />}
    </div>
  );
}
