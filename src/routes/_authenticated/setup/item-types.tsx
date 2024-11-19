import ConfirmPin from "@/components/confirm-pin";
import FormInput from "@/components/form-input";
import { ItemType } from "@/components/item/itemtype";
import TitleCard from "@/components/page-components/title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { axiosInstance } from "@/lib/axios";
import { ApiResponseType, TypePricing } from "@/lib/custom-types";
import { getItemTypes } from "@/lib/queries/item-types";
import { itemTypeSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
const validatePin = () => {
  (document.getElementById("type-reg") as HTMLDialogElement)?.click();
};
export const Route = createFileRoute("/_authenticated/setup/item-types")({
  component: () => <Page />,
  loader: async ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getItemTypes);
  },
});
function Page() {
  const { mutate } = useMutation({
    mutationKey: ["item-types"],
    mutationFn: async function (values: z.infer<typeof itemTypeSchema>) {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/item-types",
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const router = useRouter();
  const { toast } = useToast();
  const { data: itemTypes, refetch } = useSuspenseQuery(getItemTypes);
  function onSubmit(
    form: UseFormReturn<
      {
        name: string;
        price: number;
        pricing?: any;
      },
      any,
      undefined
    >
  ) {
    mutate(form.getValues(), {
      onSuccess: (data) => {
        form.reset();
        toast({ description: data.message });
        router.invalidate().then(() => refetch());
      },
      onError: (data) => {
        toast({ description: data.message, variant: "destructive" });
      },
    });
  }
  return (
    <main className="grid gap-8">
      <TitleCard title="Add Item Type" description="" />
      <div className="grid grid-cols-1 gap-16">
        <ItemTypeForm onSubmit={onSubmit} />
        <ItemTypes itemTypes={itemTypes} refetch={refetch} />
      </div>
    </main>
  );
}
export function ItemTypeForm({
  onSubmit,
}: {
  onSubmit: (...args: any[]) => any;
}) {
  const form = useForm<z.infer<typeof itemTypeSchema>>({
    resolver: zodResolver(itemTypeSchema),
    defaultValues: {
      name: "",
      pricing: TypePricing.FIXED,
      price: 0,
      limit: undefined,
      min: undefined,
    },
  });

  // function onSubmit() {
  //   mutate(form.getValues(), {
  //     onSuccess: (data) => {
  //       form.reset();
  //       toast({ description: data.message });
  //       router.invalidate().then(() => reloadData());
  //     },
  //     onError: (data) => {
  //       toast({ description: data.message, variant: "destructive" });
  //     },
  //   });
  // }
  const pricing = form.watch("pricing");
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(validatePin, () => {
          console.log(form.formState.errors);
          console.log(form.getValues());
        })}
        className="flex flex-col gap-8"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Add Item Type</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:flex gap-4">
              <FormInput
                control={form.control}
                placeholder="e.g. Parcel"
                type="text"
                label="Name"
                name="name"
              />
              <FormField
                control={form.control}
                name="pricing"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Pricing Style</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("limit");
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          {field.value ? (
                            field.value
                          ) : (
                            <SelectValue
                              placeholder="Select Type"
                              className="w-full"
                            />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TypePricing).map((type: any) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormInput
                control={form.control}
                type="number"
                label={`Price (Naira) (${pricing})`}
                name="price"
              />
              {pricing === TypePricing.PER_KG && (
                <>
                  <FormInput
                      control={form.control}
                      type="number"
                      label="Minimum item weight (Kg)"
                      name="min"
                      placeholder="e.g. 2kg"
                  />
                  <FormInput
                      control={form.control}
                      type="number"
                      label="Maximum item weight (Kg)"
                      name="limit"
                      placeholder="e.g. 5kg"
                  />
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-center gap-4 w-full">
              <ConfirmPin
                id="type-reg"
                name="Add Item Type"
                action={() => onSubmit(form)}
              />
              <Button size="lg" type="submit">
                Add Item Type
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
function ItemTypes({
  itemTypes,
  refetch,
}: {
  itemTypes: (z.infer<typeof itemTypeSchema> & { id: string })[];
  refetch: () => any;
}) {
  const router = useRouter();
  const refetchData = () => router.invalidate().then(() => refetch());
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-10">
          {itemTypes.map(
            (type: z.infer<typeof itemTypeSchema> & { id: string }) => (
              <ItemType itemType={type} key={type.id} refetch={refetchData} />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
