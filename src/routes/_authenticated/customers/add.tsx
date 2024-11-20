import {createFileRoute, useLoaderData, useNavigate} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { toast } from "@/hooks/use-toast";

import { compare } from "@/lib/utils";
import { newCustomerSchema } from "@/lib/zodSchemas";
import FormInput from "@/components/form-input";
import FormTextarea from "@/components/form-textarea";
import ConfirmPin from "@/components/confirm-pin";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ApiResponseType, State } from "@/lib/custom-types";
import TitleCard from "@/components/page-components/title";
import { useMutation } from "@tanstack/react-query";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { axiosInstance } from "@/lib/axios";

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
const NewCustomerForm = () => {
  const {
   statesLGAs: states
  } = useLoaderData({from: '/_authenticated'});
  const { returnPage } = Route.useSearch();
  const form = useForm<z.infer<typeof newCustomerSchema>>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phoneNumber: "",
      address: {
        stateId: -1,
        address: "",
      },
    },
  });

  const { mutate } = useMutation({
    mutationKey: ["customers"],
    mutationFn: async (values: z.infer<typeof newCustomerSchema>) => {
      if (!values) throw Error;
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/customers",
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const navigate = useNavigate();
  const validatePin = () => {
    (document.getElementById("customer-reg") as HTMLDialogElement)?.click();
  };
  const onSubmit = (values: z.infer<typeof newCustomerSchema>) => {
    mutate(values, {
      onSuccess: (data) => {
        toast({
          description: data.message,
        });
        form.reset();
        returnPage &&
          navigate({
            to: returnPage === 'order'?"/orders/new": '/customers/corporate/add',
            search: { customerId: data.customer.id, page: "detail"},
          });
      },
      onError: (error) => {
        toast({
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(validatePin)}
        className="flex flex-col gap-8"
      >
        <Card className="w-full">
          <CardHeader></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                type="text"
                label="First Name"
                name="firstname"
                placeholder="e.g John"
              />
              <FormInput
                control={form.control}
                type="text"
                label="Last Name"
                name="lastname"
                placeholder="e.g Conor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                type="text"
                label="Phone Number"
                name="phoneNumber"
                placeholder="e.g +2348123456789"
              />
              <FormInput
                control={form.control}
                type="email"
                label="Email"
                name="email"
                placeholder="e.g email@example.com"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="address.stateId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        // defaultValue={+field.value}
                        value={+field.value as any}
                      >
                        <SelectTrigger className="w-full">
                          {field.value ? (
                            <SelectValue
                              placeholder="Select State"
                              className="w-full"
                            />
                          ) : (
                            "Select State"
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {states.sort(compare).map((state: State) => (
                            <SelectItem key={state.id} value={state.id as any}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormTextarea
                name="address.address"
                control={form.control}
                label="Street address"
                placeholder="e.g 10 Ajayi Street, Ikeja, Lagos"
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-center gap-4 w-full">
              <ConfirmPin
                id="customer-reg"
                name="Add Customer & continue"
                action={form.handleSubmit(onSubmit)}
              />
              <Button
                size="lg"
                type="button"
                onClick={() => form.handleSubmit(validatePin)()}
              >
                {returnPage ? "Add Customer & continue" : "Add Customer"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
