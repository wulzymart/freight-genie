import { createFileRoute } from "@tanstack/react-router";
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
import { additionalChargeSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import TitleCard from "@/components/page-components/title";
import { getAdditionalCharges } from "@/lib/queries/additional-charge";
import { Form } from "@/components/ui/form";
import { useRouter } from "@tanstack/react-router";
import { AdditionalCharge } from "@/components/item/additional-charge";

function Page() {
  const { toast } = useToast();
  const { mutate } = useMutation({
    mutationKey: ["additional-charges"],
    mutationFn: async function (
      values: z.infer<typeof additionalChargeSchema>
    ) {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/additional-charges",
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const router = useRouter();
  const { data: additionalCharge, refetch } =
    useSuspenseQuery(getAdditionalCharges);
  const refetchData = () => router.invalidate().then(() => refetch());

  function onSubmit(
    form: UseFormReturn<
      {
        charge: string;
      },
      any,
      undefined
    >
  ) {
    mutate(form.getValues(), {
      onSuccess: (data) => {
        form.reset();
        toast({ description: data.message });
        refetchData();
      },
      onError: (data) => {
        toast({ description: data.message, variant: "destructive" });
      },
    });
  }

  return (
    <main className="grid gap-8">
      <TitleCard title="Add Additional Charge" description="" />
      <div className="grid grid-cols-1 gap-16">
        <AdditionalChargeForm {...{ onSubmit }} />
        <AdditionalCharges {...{ additionalCharge, refetch }} />
      </div>
    </main>
  );
}
const validatePin = () => {
  (
    document.getElementById("additionalCharge-reg") as HTMLDialogElement
  )?.click();
};
export function AdditionalChargeForm({
  onSubmit,
}: {
  onSubmit: (...args: any[]) => any;
}) {
  const form = useForm<z.infer<typeof additionalChargeSchema>>({
    resolver: zodResolver(additionalChargeSchema),
    defaultValues: {
      charge: "",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormInput
                control={form.control}
                placeholder="e.g. Loading"
                type="text"
                label="Charge"
                name="charge"
              />
              <div className="flex justify-center gap-4 w-full">
                <ConfirmPin
                  id="additionalCharge-reg"
                  name="Add Additional Charge"
                  action={() => onSubmit(form)}
                />
                <Button size="lg" type="submit">
                  Add Charge
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </form>
    </Form>
  );
}

function AdditionalCharges({
  additionalCharge,
  refetch,
}: {
  additionalCharge: (z.infer<typeof additionalChargeSchema> & { id: string })[];
  refetch: () => any;
}) {
  const router = useRouter();
  const refetchData = () => router.invalidate().then(() => refetch());
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Charges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-10">
          {additionalCharge.map(
            (
              additionalCharge: z.infer<typeof additionalChargeSchema> & {
                id: string;
              }
            ) => (
              <AdditionalCharge
                refetch={refetchData}
                additionalCharge={additionalCharge}
                key={additionalCharge.id}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute(
  "/_authenticated/setup/additional-charges"
)({
  component: () => <Page />,
});
