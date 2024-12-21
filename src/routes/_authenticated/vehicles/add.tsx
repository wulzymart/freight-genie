import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useForm } from "react-hook-form";
import { addVehicleSchema } from "@/lib/zodSchemas.ts";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApiResponseType,
  State,
  StationType,
  VehicleCoverage,
  VehicleType,
} from "@/lib/custom-types.ts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import FormInput from "@/components/form-input.tsx";
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
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios.ts";
import { useToast } from "@/hooks/use-toast.ts";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/vehicles/add")({
  component: Page,
});

function Page() {
  const form = useForm<z.infer<typeof addVehicleSchema>>({
    resolver: zodResolver(addVehicleSchema),
    defaultValues: {
      registrationNumber: "",
      model: "",
      type: VehicleType.VAN,
      coverage: VehicleCoverage.INTERSTATE,
      registeredToId: "",
      currentStationId: "",
    },
  });
  const navigate = useNavigate();
  const coverage = form.watch("coverage");
  const { stations, statesLGAs } = useLoaderData({ from: "/_authenticated" });
  const [state, setState] = useState<State | undefined>(undefined);
  const { mutate } = useMutation({
    mutationKey: ["vehicles"],
    mutationFn: async (values: z.infer<typeof addVehicleSchema>) => {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/vehicles",
        values,
      );
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });
  const { toast } = useToast();

  function onSubmit(data: z.infer<typeof addVehicleSchema>) {
    mutate(data, {
      onSuccess: async (data) => {
        toast({ description: data.message });
        await navigate({ to: `/vehicles/${data.vehicle.id}` });
      },
      onError: async (error) => {
        toast({ description: error.message });
      },
    });
  }

  return (
    <Card className="m-8">
      <Form {...form}>
        <form>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">
              Add new vehicle
            </CardTitle>
            <small>Please provide vehicle information</small>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="registrationNumber"
                label="Registration Number"
                placeholder="Enter your registration number"
                type="text"
                caseTransform="upper"
              />
              <FormInput
                name="model"
                label="Vehicle Model"
                placeholder="e.g. Toyota Siena"
                type="text"
                caseTransform="upper"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Vehicle Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          {field.value ? (
                            field.value.toString().toUpperCase()
                          ) : (
                            <SelectValue
                              placeholder="Select Type"
                              className="w-full"
                            />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(VehicleType).map(
                            (type: VehicleType) => (
                              <SelectItem key={type} value={type}>
                                {type.toUpperCase()}
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
                name="coverage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Vehicle coverage</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("registeredToId");
                          form.resetField("currentStationId");
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          {field.value ? (
                            field.value.toString().toUpperCase()
                          ) : (
                            <SelectValue
                              placeholder="Select Type"
                              className="w-full"
                            />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(VehicleCoverage).map(
                            (coverage: VehicleCoverage) => (
                              <SelectItem key={coverage} value={coverage}>
                                {coverage.toUpperCase()}
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
              <div className="flex flex-col gap-3">
                <FormLabel>State</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const state = statesLGAs.find(
                      (state: State) => state.id === +value,
                    );
                    setState(state);
                    form.resetField("registeredToId");
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
              {state && (
                <FormField
                  control={form.control}
                  name="registeredToId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Vehicle Station</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("currentStationId", value);
                          }}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Station" />
                          </SelectTrigger>
                          <SelectContent>
                            {stations
                              .filter((station) => station.stateId === state.id)
                              .filter((station) => {
                                if (
                                  coverage &&
                                  coverage === VehicleCoverage.INTERSTATE
                                ) {
                                  return station.type === StationType.REGIONAL;
                                }
                                if (
                                  coverage &&
                                  coverage === VehicleCoverage.INTRASTATE
                                ) {
                                  return station.type === StationType.REGIONAL;
                                }
                                return true;
                              })
                              .map((station) => (
                                <SelectItem
                                  key={station.id}
                                  value={station.id!}
                                >
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
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-center gap-10">
              <Button
                type="button"
                onClick={form.handleSubmit(() =>
                  validatePinElementGen("vehicle-reg"),
                )}
              >
                Submit
              </Button>
              <ConfirmPin
                id="vehicle-reg"
                name="Add vehicle"
                action={form.handleSubmit(onSubmit)}
              />
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
