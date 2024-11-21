import {Order, StaffRole,} from "@/lib/custom-types";
import {createFileRoute, notFound} from "@tanstack/react-router";
import {zodSearchValidator} from "@tanstack/router-zod-adapter";
import * as z from "zod";
import TitleCard from "@/components/page-components/title";
import {orderSchema,} from "@/lib/zodSchemas";
import {getStatesWithLgas} from "@/lib/queries/states";
import {getStations} from "@/lib/queries/stations";
import {getItemTypes} from "@/lib/queries/item-types";
import {getItemCategories} from "@/lib/queries/item-categories";
import {Prompt} from "@/forms/customer/new-customer-prompt..tsx";
import {OrderDetailForm} from "@/forms/order/order-detail.tsx";
import {ReceiverForm} from "@/forms/order/receiver-info.tsx";
import {ItemForm} from "@/forms/order/item-info.tsx";
import {InsuranceForm} from "@/forms/order/insurance-form.tsx";
import {AdditionalServicesForm} from "@/forms/order/additional-services-form.tsx";
import {Pricing} from "@/components/order/pricing.tsx";
import {getCustomerById} from "@/lib/queries/customer.ts";
import {CustomErrorComponent} from "@/components/error-component.tsx";

const shipmentPageValidator = z.object({
  page: z.optional(
    z.enum([
      "detail",
      "items",
      "destination",
      "insurance",
      "extras",
      "pricing",
      "payment",
      "print",
      "summary",
    ])
  ),
  customerId: z.optional(z.string().uuid({ message: "invalid customer id" })),
  deliveryDetails: z.optional(orderSchema.shipmentInfoSchema),
  receiver: z.optional(orderSchema.receiver),
  item: z.optional(orderSchema.item),
  insurance: z.optional(orderSchema.insurance),
  additionalServices: z.optional(orderSchema.additionalServices),
  charges: z.optional(orderSchema.charges),
  order: z.optional(z.custom<Omit<Order, 'id'>>()),
});

export const Route = createFileRoute("/_authenticated/orders/new")({
  validateSearch: zodSearchValidator(shipmentPageValidator),
  loaderDeps: ({ search: { customerId, page } }) => ({ customerId, page }),
  loader: async ({ context: { queryClient }, deps: { customerId, page } }) => {
    if (customerId) {
      const customer = await queryClient.ensureQueryData(getCustomerById(customerId))

      if (!customer)
        throw notFound({ data: { message: "invalid customer id" } });
    }
    if (!page || page === "destination") {
      await queryClient.ensureQueryData(getStatesWithLgas);
      await queryClient.ensureQueryData(getStations);
    }
    if (page === "items") {
      await queryClient.ensureQueryData(getItemTypes);
     await  queryClient.ensureQueryData(getItemCategories);
    }
  },
  component: () => (
    <main className="grid gap-8">
      <TitleCard title="New Order" description="Register a new order" />
      <Page />
    </main>
  ),
  beforeLoad: ({context}) => {
    const {user} = context.auth
    if (![StaffRole.DIRECTOR, StaffRole.MANAGER, StaffRole.STATION_OFFICER].includes(user.staff.role))  throw new Error("You are not able to view this page, because, you are required to be a front line station staff to add new waybill")
  },
  errorComponent: ({error}) => {
    return <CustomErrorComponent errorMessage={error.message} />;
  }
});

function Page() {
  const {
    customerId,
    deliveryDetails,
    receiver,
    item,
    insurance,
    additionalServices,
    charges,
    page,
  } = Route.useSearch();
  if (!page) return <Prompt returnPage='order' />;
  if (!customerId) throw notFound();
  if (page === "detail")
    return <OrderDetailForm {...{ customerId, deliveryDetails }} />;
  if (!deliveryDetails) throw notFound();
  if (page === "destination")
    return <ReceiverForm {...{ customerId, deliveryDetails, receiver }} />;
  if (!receiver) throw notFound();
  if (page === "items")
    return <ItemForm {...{ customerId, deliveryDetails, receiver, item }} />;
  if (!item) throw notFound();
  if (page === "insurance")
    return (
      <InsuranceForm
        {...{ customerId, deliveryDetails, receiver, item, insurance }}
      />
    );
  if (!insurance) throw notFound();
  if (page === "extras")
    return (
      <AdditionalServicesForm
        {...{
          customerId,
          deliveryDetails,
          receiver,
          item,
          insurance,
          additionalCharges: additionalServices,
        }}
      />
    );
  if (!additionalServices) throw notFound();
  if (page === "pricing")
    return (
      <Pricing
        {...{
          customerId,
          deliveryDetails,
          receiver,
          item,
          insurance,
          additionalCharges: additionalServices,
        }}
      />
    );
  if (!charges) throw notFound();
  if (page === "payment") return <>payment</>;
  return <>in progress</>;
}
