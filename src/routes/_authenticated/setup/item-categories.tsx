import ConfirmPin from "@/components/confirm-pin";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { axiosInstance } from "@/lib/axios";
import { ApiResponseType } from "@/lib/custom-types";
import { itemCategorySchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import TitleCard from "@/components/page-components/title";
import { getItemCategories } from "@/lib/queries/item-categories";
import { ItemCategory } from "@/components/item/itemcategory";
import { Form } from "@/components/ui/form";
import { useRouter } from "@tanstack/react-router";

function Page() {
  const { toast } = useToast();
  const { mutate } = useMutation({
    mutationKey: ["item-categories"],
    mutationFn: async function (values: z.infer<typeof itemCategorySchema>) {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/item-categories",
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const router = useRouter();
  const { data: itemCategories, refetch } = useSuspenseQuery(getItemCategories);

  function onSubmit(
    form: UseFormReturn<
      {
        name: string;
        priceFactor: number;
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
      <TitleCard title="Add Item Category" description="" />
      <div className="grid grid-cols-1 gap-16">
        <ItemCategoryForm {...{ onSubmit }} />
        <ItemCategories {...{ itemCategories, refetch }} />
      </div>
    </main>
  );
}
const validatePin = () => {
  (document.getElementById("category-reg") as HTMLDialogElement)?.click();
};
export function ItemCategoryForm({
  onSubmit,
}: {
  onSubmit: (...args: any[]) => any;
}) {
  const form = useForm<z.infer<typeof itemCategorySchema>>({
    resolver: zodResolver(itemCategorySchema),
    defaultValues: {
      name: "",
      priceFactor: 1,
    },
  });

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
          <CardHeader></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                placeholder="e.g. Raw Food"
                type="text"
                label="Name"
                name="name"
              />
              <FormInput
                control={form.control}
                type="number"
                label="Price Factor"
                name="priceFactor"
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-center gap-4 w-full">
              <ConfirmPin
                id="category-reg"
                name="Add Item Category"
                action={() => onSubmit(form)}
              />
              <Button size="lg" type="submit">
                Add Category
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

function ItemCategories({
  itemCategories,
  refetch,
}: {
  itemCategories: (z.infer<typeof itemCategorySchema> & { id: string })[];
  refetch: () => any;
}) {
  const router = useRouter();
  const refetchData = () => router.invalidate().then(() => refetch());
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-10">
          {itemCategories.map(
            (category: z.infer<typeof itemCategorySchema> & { id: string }) => (
              <ItemCategory
                itemCategory={category}
                key={category.id}
                refetch={refetchData}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_authenticated/setup/item-categories")({
  component: () => <Page />,
});
