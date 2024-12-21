import ConfirmPin from "@/components/confirm-pin";
import FormInput from "@/components/form-input";
import TitleCard from "@/components/page-components/title";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import { ApiResponseType, Station, StationType } from "@/lib/custom-types";
import { getVendorConfig } from "@/lib/queries/vendor-config";
import { vendorConfigSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData, useRouter } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useVendor from "@/hooks/vendor.ts";

export const Route = createFileRoute("/_authenticated/setup/config")({
  component: () => (
    <main className="grid gap-8">
      <TitleCard
        title="App Config"
        description="Add or Edit App Configuration"
      />
      <ConfigForm />
    </main>
  ),
});

const ConfigForm = () => {
  const vendor = useLoaderData({ from: "__root__" });
  const { reloadVendor } = useVendor();
  const { data: config, refetch: refetchConfig } =
    useSuspenseQuery(getVendorConfig);
  const { mutate: createConfig } = useMutation({
    mutationFn: async (values: z.infer<typeof vendorConfigSchema>) => {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/config",
        values,
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
    mutationKey: ["vendor-config"],
  });
  const { mutate: updateConfig } = useMutation({
    mutationFn: async (values: z.infer<typeof vendorConfigSchema>) => {
      if (!config?.id) return;
      const { data }: { data: ApiResponseType } = await axiosInstance.patch(
        "/vendor/config",
        { ...values, id: config?.id },
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
    mutationKey: ["vendor-config"],
  });
  const validatePin = () => {
    (document.getElementById("config-submit") as HTMLDialogElement)?.click();
  };
  const { stations } = useLoaderData({ from: "/_authenticated" });
  const [isEditing, setIsEditing] = useState(!config);
  const form = useForm<z.infer<typeof vendorConfigSchema>>({
    resolver: zodResolver(vendorConfigSchema),
    defaultValues: {
      expressFactor: config?.expressFactor || 0,
      hqId: config?.hqId || "",
      customerCareLine: config?.customerCareLine || "",
      vat: config?.vat || 0,
      insuranceFactor: config?.insuranceFactor || 0,
      ecommerceFactor: config?.ecommerceFactor || 0,
      dim: config?.dim || 5000,
      localFactor: config?.localFactor || 0.8,
      logo: vendor.logo || undefined,
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const onSubmit = () => {
    const values = form.getValues();
    values.logo = values.logo ? values.logo.trim() : undefined;
    if (config) {
      updateConfig(form.getValues(), {
        onSuccess: (data) => {
          form.reset();
          toast({ description: data?.message });
          router.invalidate().then(async () => {
            await reloadVendor();
            await refetchConfig();
            setIsEditing(false);
          });
          setIsEditing(false);
        },
        onError: (data) => {
          toast({ description: data.message, variant: "destructive" });
        },
      });
    } else {
      createConfig(form.getValues(), {
        onSuccess: (data) => {
          form.reset();
          toast({ description: data?.message });
          router.invalidate().then(async () => {
            await reloadVendor();
            await refetchConfig();
            setIsEditing(false);
          });
        },
        onError: (data) => {
          toast({ description: data.message, variant: "destructive" });
        },
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(validatePin)}>
        <Card>
          <CardHeader></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="hqId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>HQ Station</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Station" />
                        </SelectTrigger>
                        <SelectContent>
                          {stations
                            .filter(
                              (station: Station) =>
                                station.type === StationType.REGIONAL,
                            )
                            .map((station) => (
                              <SelectItem key={station.id} value={station.id!}>
                                {station.name} ({station.nickName})
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
                disabled={!isEditing}
                name="customerCareLine"
                label="Customer Care Lines"
                placeholder="Customer Care Lines"
              />
              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="logo"
                label="Logo URL"
                description="Web Address to your company logo"
                placeholder="https://companylogourl"
              />
              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="vat"
                label="VAT (Percentage '%')"
                placeholder="0.05"
                type="number"
              />
              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="insuranceFactor"
                label="Insurance Percentage(%)"
                placeholder="0.05"
                type="number"
              />
              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="expressFactor"
                description="Multiplication factor for an express delivery"
                label="Express Factor"
                placeholder="3"
                type="number"
              />
              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="ecommerceFactor"
                description="Multiplication Percentage for registered ecommerce deliveries (e.g 90 = 90% of total price before VAT & Insurance)"
                label="Ecommerce Percentage(%)"
                placeholder="90"
                type="number"
              />

              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="localFactor"
                description="Multiplication Percentage for local deliveries (e.g 90 = 90% of total price before VAT & Insurance)"
                label="Local Percentage(%)"
                placeholder="90"
                type="number"
              />
              <FormInput
                control={form.control}
                disabled={!isEditing}
                name="dim"
                description="A factor used to calculate dimension weight, higher dimension weight will be used for price calculation default 5000cm3/kg (international standard)"
                label="Dimension factor (cm3/kg)"
                placeholder="5000"
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4"></div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-center gap-4 w-full">
              <ConfirmPin
                id="config-submit"
                name="Add station"
                action={onSubmit}
              />
              {config && (
                <Button
                  size="lg"
                  variant={isEditing ? "destructive" : "default"}
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
              {isEditing && (
                <Button size="lg" type="submit">
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
