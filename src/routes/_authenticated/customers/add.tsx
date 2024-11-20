import {createFileRoute} from "@tanstack/react-router";
import * as z from "zod";
import TitleCard from "@/components/page-components/title";
import {zodSearchValidator} from "@tanstack/router-zod-adapter";
import {NewCustomerForm} from "@/forms/customer/new-customer.tsx";

const routeSearchValidator = z.object({
  returnPage: z.optional(z.enum(['order', 'corporate'])),
});
export const Route = createFileRoute("/_authenticated/customers/add")({
  validateSearch: zodSearchValidator(routeSearchValidator),
  component: () => (
    <main className="grid gap-8">
      <TitleCard title="New Customer" description="Provide customer details" />
      <NewCustomerForm />
    </main>
  ),
});
