import * as z from "zod";
import {
  staffFormSchema,
  tripStaffSchema,
  userFormSchema,
} from "@/lib/zodSchemas.ts";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  OperationEnum,
  RouteCoverage,
  RouteType,
  StaffRole,
  State,
} from "@/lib/custom-types.ts";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { axiosInstance } from "@/lib/axios.ts";
import { useToast } from "@/hooks/use-toast.ts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import ConfirmPin from "@/components/confirm-pin.tsx";
import { validatePinElementGen } from "@/lib/utils.ts";

export const FieldPersonnelForm = ({
  user,
  staff,
}: {
  user: z.infer<typeof userFormSchema>;
  staff: z.infer<typeof staffFormSchema>;
}) => {
  const { stations, statesLGAs, routes } = useLoaderData({
    from: "/_authenticated",
  });
  console.log(routes);
  const [state, setState] = useState<State | undefined>(undefined);
  const stateStations = stations.filter(
    (station) => station.stateId === state?.id,
  );

  const form = useForm<z.infer<typeof tripStaffSchema>>({
    resolver: zodResolver(tripStaffSchema),
    defaultValues: {
      currentStationId: "",
      registeredInId: "",
      registeredRouteId: "" as any,
      operation: OperationEnum.INTERSTATION,
      routeCoverage: RouteCoverage.INTERSTATE,
      routeType: RouteType.REGULAR,
    },
  });
  const routeType = form.watch("routeType");
  const coverage = form.watch("routeCoverage");
  const possibleRoutes = routes.filter(
    (route) => route.type === routeType && route.coverage === coverage,
  );
  const fieldPersonnel =
    staff.role === StaffRole.DRIVER ? "Driver" : "Assistant";
  const operation = form.watch("operation");
  const selectedRouteId = form.watch("registeredRouteId");
  console.log(selectedRouteId, possibleRoutes);
  const selectedRoute = possibleRoutes.find(
    (route) => route.id === +selectedRouteId,
  );
  console.log(selectedRoute);
  const stationsList = selectedRoute?.stationIds.map((id) =>
    stations.find((station) => station.id === id),
  );
  const { mutate } = useMutation({
    mutationKey: ["staff"],
    mutationFn: async (values: {
      user: z.infer<typeof userFormSchema>;
      staff: z.infer<typeof staffFormSchema>;
      driverInfo?: z.infer<typeof tripStaffSchema>;
      vehicleAssistantInfo?: z.infer<typeof tripStaffSchema>;
    }) => {
      if (!values) throw Error;

      const res = await axiosInstance.post("/vendor/users", values);
      if (!res.data.success) throw Error(res.data.message);
      return res.data;
    },
  });
  const { toast } = useToast();

  function onSubmit() {
    form.handleSubmit(
      () => validatePinElementGen("staff-reg"),
      () => {
        console.log(form.formState.errors, form.getValues());
      },
    )();
  }

  const navigate = useNavigate();

  function submit() {
    const values = form.getValues();
    values.registeredRouteId = (
      values.registeredRouteId ? +values.registeredRouteId : undefined
    ) as any;
    mutate(
      {
        user,
        staff,
        [`${staff.role === StaffRole.DRIVER ? "driverInfo" : "vehicleAssistantInfo"}`]:
          values,
      },
      {
        onSuccess: async (data) => {
          console.log("success", data);

          form.reset();
          toast({
            description: data.message,
          });
          await navigate({ to: "/staff/add" });
        },
        onError: (data) => {
          toast({
            description: data.message,
            variant: "destructive",
          });
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form>
        <Card>
          <CardHeader> </CardHeader>
          <CardContent className="grid grid-col-1 gap-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={"operation"}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{fieldPersonnel}'s Operation</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("registeredRouteId");
                          form.resetField("currentStationId");
                          value === OperationEnum.LASTMAN &&
                            form.resetField("routeCoverage");
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Operation" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OperationEnum).map((operation) => (
                            <SelectItem key={operation} value={operation}>
                              {operation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {operation === OperationEnum.INTERSTATION ? (
                <>
                  <FormField
                    control={form.control}
                    name="routeCoverage"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{fieldPersonnel}'s Coverage</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.resetField("registeredRouteId");
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              {field.value ? (
                                field.value.toUpperCase()
                              ) : (
                                <SelectValue placeholder="Select Coverage" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(RouteCoverage).map((coverage) => (
                                <SelectItem key={coverage} value={coverage}>
                                  {coverage.toUpperCase()}
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
                    name="routeType"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{fieldPersonnel}'s Route Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.resetField("registeredRouteId");
                            }}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              {field.value ? (
                                field.value.toUpperCase()
                              ) : (
                                <SelectValue placeholder="Select Type" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(RouteType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.toUpperCase()}
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
                    name={"registeredRouteId"}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{fieldPersonnel}'s Route</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value as any}
                            value={+field.value! as any}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Route" />
                            </SelectTrigger>
                            <SelectContent>
                              {possibleRoutes.map((route) => (
                                <SelectItem
                                  key={route.id}
                                  value={route.id as unknown as string}
                                >
                                  {route.code}
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
                    name={"currentStationId"}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Current Station</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("registeredInId", value);
                            }}
                            defaultValue={field.value}
                            value={field.value}
                            disabled={!stations}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Station" />
                            </SelectTrigger>
                            <SelectContent>
                              {stationsList?.map((station) =>
                                station ? (
                                  <SelectItem
                                    key={station.id}
                                    value={station.id!}
                                  >
                                    {station.name} ({station.nickName})
                                  </SelectItem>
                                ) : (
                                  ""
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                ""
              )}
            </div>
            {operation === OperationEnum.LASTMAN ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const state = statesLGAs.find(
                        (state: State) => state.id === +value,
                      );
                      setState(state);
                      form.resetField("currentStationId");
                    }}
                    disabled={!statesLGAs}
                    // defaultValue={+field.value}
                    value={state?.id as unknown as string}
                  >
                    <SelectTrigger className="">
                      {state ? (
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
                <FormField
                  control={form.control}
                  name={"currentStationId"}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Current Station</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("registeredInId", value);
                          }}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={!stations}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Station" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateStations.map((station) => (
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
              </div>
            ) : (
              ""
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-center gap-10">
              <Button
                variant="ghost"
                type="button"
                onClick={async () => {
                  await navigate({
                    to: "/staff/add",
                    search: {
                      user,
                      staff,
                    },
                  });
                }}
              >
                Back
              </Button>
              <Button type="button" onClick={onSubmit}>
                Submit
              </Button>
              <ConfirmPin id="staff-reg" name="Add staff" action={submit} />
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
