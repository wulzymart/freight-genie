import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { useEffect, useState } from "react";

import { compare, routeTripCodeGen } from "@/lib/utils";
import { routeFormSchema } from "@/lib/zodSchemas";
import FormInput from "@/components/form-input";
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
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import {
  RouteCoverage,
  RouteType,
  StaffRole,
  State,
  Station,
  StationType,
} from "@/lib/custom-types";
import { useToast } from "@/hooks/use-toast";
import { getStations } from "@/lib/queries/stations";
import { getStatesWithLgas } from "@/lib/queries/states";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable";
import { MdAdd, MdDragHandle } from "react-icons/md";
import { TrashIcon } from "lucide-react";
import { getRoutes } from "@/lib/queries/routes";
import { CustomErrorComponent } from "@/components/error-component.tsx";

const allowed = [
  StaffRole.MANAGER,
  StaffRole.REGION_MANAGER,
  StaffRole.DIRECTOR,
];
export const Route = createFileRoute("/_authenticated/routes/add")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(getStations);
    queryClient.ensureQueryData(getStatesWithLgas);
    queryClient.ensureQueryData(getRoutes);
  },
  component: () => (
    <main className="grid gap-8">
      <TitleCard
        title="Add New Route"
        description="Provide details of the new route to add"
      />
      <RouteForm />
    </main>
  ),
  beforeLoad: ({ context }) => {
    const { user } = context.auth;
    if (!allowed.includes(user.staff.role))
      throw new Error("You are not authorized to access this page");
  },
  errorComponent: ({ error }) => {
    return <CustomErrorComponent errorMessage={error.message} />;
  },
});

function RouteForm() {
  const { toast } = useToast();
  const {
    data: statesLGAs,
    isLoading: statesLGAsLoading,
    isError: statesLGAsError,
  } = useSuspenseQuery(getStatesWithLgas);
  const {
    data: stations,
    isLoading: stationsLoading,
    isError: stationsError,
  } = useSuspenseQuery(getStations);
  const { data: routes } = useSuspenseQuery(getRoutes);
  const regionalStations = stations?.filter(
    (station: Station) => station.type === StationType.REGIONAL,
  );
  const [stateId, setStateId] = useState<number | null>(null);
  const [regionStationId, setRegionStationId] = useState<string | null>(null);

  const stateRegionalStations = regionalStations?.filter(
    (station: Station) => station.stateId === stateId,
  );
  const [originState, setOriginState] = useState<State | null>(null);
  const [destinationState, setDestinationState] = useState<State | null>(null);
  const region = stations.find(
    (station: Station) => station.id === regionStationId,
  );
  const regionStations = region ? [region, ...region.localStations] : [];

  const form = useForm<z.infer<typeof routeFormSchema>>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      code: "",
      coverage: RouteCoverage.INTERSTATE,
      type: RouteType.REGULAR,
      stationIds: [],
    },
  });
  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "stationIds",
  });
  const coverage = form.watch("coverage");
  const type = form.watch("type");
  const stationsList =
    coverage === RouteCoverage.INTERSTATE
      ? regionalStations
      : coverage === RouteCoverage.INTRASTATE
        ? stateRegionalStations
        : regionStations;

  const selectedStationIds = form.watch("stationIds");
  const {
    formState: { errors },
  } = form;

  const { mutate } = useMutation({
    mutationKey: ["routes"],
    mutationFn: async (values: z.infer<typeof routeFormSchema>) => {
      if (!values) throw Error;
      const { data } = await axiosInstance.post("/vendor/routes", values);
      if (!data?.success) throw Error(data.message);
      return data;
    },
  });
  const validatePin = () => {
    (document.getElementById("route-reg") as HTMLDialogElement)?.click();
  };

  const onSubmit = () => {
    const values = form.getValues();
    toast({
      description: "Submitting please wait",
    });

    mutate(values, {
      onSuccess: (data) => {
        toast({
          description: data.message,
        });
        setOriginState(null);
        setDestinationState(null);
        form.reset();
      },
      onError: (error) => {
        toast({
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  useEffect(() => {
    if (
      (coverage === RouteCoverage.INTERSTATE &&
        originState &&
        destinationState) ||
      (coverage !== RouteCoverage.INTERSTATE && originState)
    )
      form.setValue(
        "code",
        routeTripCodeGen(
          coverage,
          type,
          originState.code,
          coverage === RouteCoverage.INTERSTATE ? destinationState?.code : null,
          routes,
        ),
      );
  }, [originState, destinationState]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(validatePin, () => {
          console.log(errors);
          console.log(form.getValues());
        })}
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
                name="coverage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Route Coverage</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("stationIds");
                          setStateId(null);
                          setRegionStationId(null);
                          setDestinationState(null);
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
                          {Object.values(RouteCoverage).map(
                            (coverage: RouteCoverage) => (
                              <SelectItem key={coverage} value={coverage}>
                                {coverage}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Route Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("stationIds");
                          setDestinationState(null);
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
                          {Object.values(RouteType).map((type: RouteType) => (
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
            </div>
            <div className="grid grid-flow-col gap-4">
              <div className="flex flex-col gap-3">
                <FormLabel>Origin State</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const state = statesLGAs.find(
                      (state: State) => state.id === +value,
                    );
                    setOriginState(state || null);
                    setStateId(+value);
                  }}
                  disabled={statesLGAsError || statesLGAsLoading}
                  // defaultValue={+field.value}
                  value={originState?.id as unknown as string}
                >
                  <SelectTrigger className="">
                    {originState ? (
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
                      <SelectItem
                        key={state.id}
                        value={state.id as unknown as string}
                      >
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {coverage === RouteCoverage.INTERSTATE && (
                <div className="flex flex-col gap-3">
                  <FormLabel>Destination State</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const state = statesLGAs.find(
                        (state: State) => state.id === +value,
                      );
                      setDestinationState(state || null);
                    }}
                    value={destinationState?.id as unknown as string}
                  >
                    <SelectTrigger className="">
                      {destinationState ? (
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
                        <SelectItem
                          key={state.id}
                          value={state.id as unknown as string}
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {(coverage === RouteCoverage.INTERSTATE &&
              originState &&
              destinationState) ||
            (coverage !== RouteCoverage.INTERSTATE && originState) ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    type="text"
                    label="Route Code"
                    name="code"
                    placeholder="e.g IKJ-ABJ-001"
                    caseTransform="upper"
                    disabled={true}
                  />
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="w-full flex justify-between mb-4">
                      <p className="font-medium text-sm">Route Stations</p>
                      {coverage === RouteCoverage.LOCAL ? (
                        <Select
                          onValueChange={(value) => {
                            setRegionStationId(value);
                          }}
                          // defaultValue={+field.value}
                          value={
                            regionStations.find(
                              (station: Station) =>
                                station.id === regionStationId,
                            )?.id
                          }
                        >
                          <SelectTrigger className="min-w-[150px] w-fit">
                            {regionStationId ? (
                              <SelectValue
                                placeholder="Select Mother Station"
                                className="w-full"
                              />
                            ) : (
                              "Select Mother Station"
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {stateRegionalStations.map((station: Station) => (
                              <SelectItem key={station.id!} value={station.id!}>
                                {station.name} ({station.nickName || ""})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          type === RouteType.REGULAR ||
                          (type === RouteType.EXPRESS &&
                            selectedStationIds.length < 2)
                            ? append("")
                            : alert(
                                "An express route can only contain 2 stations",
                              )
                        }
                      >
                        <MdAdd />
                      </Button>
                    </div>
                    <Sortable
                      value={fields}
                      onMove={({ activeIndex, overIndex }) =>
                        move(activeIndex, overIndex)
                      }
                    >
                      <div className="flex w-full flex-col gap-2">
                        {fields.map((field, index) => (
                          <SortableItem key={field.id} value={field.id} asChild>
                            <div className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-2">
                              <SortableDragHandle
                                variant="outline"
                                size="icon"
                                className="size-8 shrink-0"
                              >
                                <MdDragHandle
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              </SortableDragHandle>
                              <FormField
                                control={form.control}
                                name={`stationIds.${index}`}
                                disabled={stationsLoading || stationsError}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <Select
                                        onValueChange={(value) => {
                                          if (
                                            selectedStationIds.includes(value)
                                          )
                                            return alert(
                                              "Station has already been selected",
                                            );
                                          field.onChange(value);
                                        }}
                                        value={field.value}
                                      >
                                        <SelectTrigger
                                          disabled={
                                            stationsLoading || stationsError
                                          }
                                          className="w-full"
                                        >
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
                                          {stationsList
                                            .sort(compare)
                                            .map((station: Station) => (
                                              <SelectItem
                                                key={station.id}
                                                value={station.id!}
                                              >
                                                {station.name} (
                                                {station.nickName || ""})
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8 shrink-0"
                                onClick={() => remove(index)}
                              >
                                <TrashIcon
                                  className="size-4 text-destructive"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          </SortableItem>
                        ))}
                        <small className="text-red-600 font-medium">
                          {errors.stationIds?.message}
                        </small>
                      </div>
                    </Sortable>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </CardContent>
          <CardFooter>
            <div className="flex justify-center gap-4 w-full">
              <ConfirmPin id="route-reg" name="Add station" action={onSubmit} />
              <Button size="lg" type="submit">
                Add Route
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
