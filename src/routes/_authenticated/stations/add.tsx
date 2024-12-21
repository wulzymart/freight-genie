import {
  createFileRoute,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";
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

import { useState } from "react";

import { compare, stationNameCodeGen } from "@/lib/utils";
import { stationFormSchema } from "@/lib/zodSchemas";
import FormInput from "@/components/form-input";
import FormTextarea from "@/components/form-textarea";
import ConfirmPin from "@/components/confirm-pin";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TitleCard from "@/components/page-components/title";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import {
  Lga,
  StaffRole,
  State,
  Station,
  StationType,
} from "@/lib/custom-types";
import { useToast } from "@/hooks/use-toast";
import { CustomErrorComponent } from "@/components/error-component.tsx";
export const Route = createFileRoute("/_authenticated/stations/add")({
  component: () => (
    <main className="grid gap-8">
      <TitleCard
        title="Add New Station"
        description="Provide details of the new station to add"
      />
      <StationForm />
    </main>
  ),
  beforeLoad: ({ context }) => {
    const { user } = context.auth;
    if (user.staff.role !== StaffRole.DIRECTOR)
      throw new Error("You are not authorized to access this page");
  },
  errorComponent: ({ error }) => {
    return <CustomErrorComponent errorMessage={error.message} />;
  },
});
const StationForm = () => {
  const { stations, statesLGAs } = useLoaderData({ from: "/_authenticated" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const regionalStations = stations?.filter(
    (station: Station) => station.type === StationType.REGIONAL,
  );

  const form = useForm<z.infer<typeof stationFormSchema>>({
    resolver: zodResolver(stationFormSchema),
    defaultValues: {
      name: "",
      code: "",
      nickName: "",
      phoneNumbers: "",
      type: StationType.LOCAL,
      stateId: "",
      lgaId: "",
      address: "",
      regionalStationId: "",
      longitude: 0,
      latitude: 0,
    },
  });
  const type = form.watch("type");

  let stateId = form.watch("stateId");
  const stateRegionalStations = regionalStations?.filter(
    (station: Station) => station.stateId === parseInt(stateId),
  );
  const [lgas, setLgas] = useState<Lga[]>([]);
  function getLGAs(stateId: number) {
    return statesLGAs.find((state: State) => state.id === stateId)?.lgas;
  }
  const { mutate } = useMutation({
    mutationKey: ["stations"],
    mutationFn: async (values: z.infer<typeof stationFormSchema>) => {
      if (!values) throw Error;
      const { data } = await axiosInstance.post("/vendor/stations", values);
      if (!data?.success) throw Error(data.message);
      return data;
    },
  });
  const validatePin = () => {
    (document.getElementById("station-reg") as HTMLDialogElement)?.click();
  };
  const router = useRouter();
  const onSubmit = () => {
    const values = form.getValues();
    values.stateId = parseInt(values.stateId) as any;
    values.lgaId = parseInt(values.lgaId) as any;
    values.phoneNumbers = values.phoneNumbers.split(" ") as any;

    mutate(values, {
      onSuccess: (data) => {
        toast({
          description: data.message,
        });

        queryClient.refetchQueries({ queryKey: ["stations"] }).then(() =>
          router.invalidate().then(async () => {
            await router.load();
            form.reset();
          }),
        );
      },
      onError: (error) => {
        console.log(error);
        toast({
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  const motherStationId = form.watch("regionalStationId");
  const setStationName = (
    type: StationType,
    motherStationId?: string,
    stateId?: string,
  ) => {
    if (type === StationType.LOCAL && motherStationId) {
      const motherStation = regionalStations?.find(
        (station: Station) => station.id === motherStationId,
      );
      const { name, code } = stationNameCodeGen(motherStation);
      form.setValue("name", name);
      form.setValue("code", code);
    } else if (type === StationType.REGIONAL && stateId) {
      const state = statesLGAs?.find((state: State) => state.id === +stateId);
      const { name, code } = stationNameCodeGen(
        undefined,
        state,
        stateRegionalStations,
      );
      form.setValue("code", code);
      form.setValue("name", name);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(validatePin)}
        className="flex flex-col gap-8"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl"></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stateId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setLgas(getLGAs(+value)!);
                          form.resetField("lgaId");
                          setStationName(
                            type,
                            undefined,
                            "" +
                              statesLGAs.find(
                                (state: State) => state.id === +field.value,
                              )?.id,
                          );
                        }}
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
                          {statesLGAs.map((state: State) => (
                            <SelectItem key={state.id} value={+state.id as any}>
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
              <FormField
                control={form.control}
                name="lgaId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>LGA</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        // defaultValue={field.value}
                        value={+field.value as any}
                      >
                        <SelectTrigger disabled={!stateId} className="w-full">
                          {field.value ? (
                            <SelectValue
                              placeholder="Select LGA"
                              className="w-full"
                            />
                          ) : (
                            "Select LGA"
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {lgas?.sort(compare).map((lga: Lga) => (
                            <SelectItem key={lga.id} value={lga.id as any}>
                              {lga.name}
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
            <div className="grid grid-flow-col gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Station Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);

                          form.setValue(
                            "regionalStationId",
                            value === StationType.LOCAL ? "" : undefined,
                          );

                          setStationName(
                            value as StationType,
                            value === StationType.LOCAL ? "" : undefined,
                            value === StationType.LOCAL ? undefined : stateId,
                          );
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
                          {Object.values(StationType).map((type: any) => (
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
              {type === StationType.REGIONAL ? null : (
                <FormField
                  control={form.control}
                  name="regionalStationId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Mother Station</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setStationName(type, value, stateId);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger disabled={!stateId} className="w-full">
                            {field.value ? (
                              <SelectValue
                                placeholder="Select Station"
                                className="w-full"
                              />
                            ) : (
                              "Select Station"
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {stateRegionalStations
                              ?.sort(compare)
                              .map((station: Station) => (
                                <SelectItem
                                  key={station.id!}
                                  value={station.id!}
                                >
                                  {station.name} ({station.nickName || ""})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {stateId &&
            ((type === StationType.LOCAL && motherStationId) ||
              type === StationType.REGIONAL) ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    type="text"
                    label="Station Name"
                    name="name"
                    disabled
                  />
                  <FormInput
                    control={form.control}
                    type="text"
                    label="Station Code"
                    name="code"
                    disabled
                  />
                  <FormInput
                    control={form.control}
                    type="nickName"
                    label="Nick Name"
                    name="nickName"
                    caseTransform="upper"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormInput
                    control={form.control}
                    type="text"
                    label="Station Phone Numbers"
                    message="seperated by spaces"
                    name="phoneNumbers"
                    placeholder="e.g +2348123456789 +2348081730978"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormTextarea
                    name="address"
                    control={form.control}
                    label="Street Address"
                    capitalize={true}
                    placeholder="e.g 10 Ajayi Street, Ikeja, Lagos"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    type="text"
                    label="Latitude"
                    name="latitude"
                    placeholder="3.12345654"
                  />
                  <FormInput
                    control={form.control}
                    type="text"
                    label="Longitude"
                    name="longitude"
                    placeholder="3.12345654"
                  />
                </div>
              </>
            ) : (
              ""
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-center gap-4 w-full">
              <ConfirmPin
                id="station-reg"
                name="Add station"
                action={onSubmit}
              />
              <Button size="lg" type="submit">
                Add Station
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
