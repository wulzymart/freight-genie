import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import {
  ApiResponseType,
  ShipmentCoverage,
  ShipmentType,
  StaffRole,
  State,
  Station,
  StationType,
  Trip,
} from "@/lib/custom-types.ts";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ShipmentSchema } from "@/lib/zodSchemas.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/auth-context.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { shipmentCodeGen, validatePinElementGen } from "@/lib/utils.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import FormInput from "@/components/form-input.tsx";
import { Button } from "@/components/ui/button.tsx";
import ConfirmPin from "@/components/confirm-pin.tsx";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios.ts";
import { useToast } from "@/hooks/use-toast.ts";

export const Route = createFileRoute("/_authenticated/shipments/new")({
  component: AddShipmentPage,
  beforeLoad: ({ context: { auth } }) => {
    const { role } = auth;
    if (
      ![
        StaffRole.DIRECTOR,
        StaffRole.MANAGER,
        StaffRole.REGION_MANAGER,
      ].includes(role!)
    )
      throw new Error("Unauthorised access");
  },
});

function AddShipmentPage() {
  const {
    user: { staff },
  } = useAuth();
  const { statesLGAs, stations } = useLoaderData({
    from: "/_authenticated",
  });
  const form = useForm<z.infer<typeof ShipmentSchema>>({
    resolver: zodResolver(ShipmentSchema),
    defaultValues: {
      code: "",
      coverage: ShipmentCoverage.INTERSTATE,
      type: ShipmentType.DIRECT,
      originId: staff.officePersonnelInfo?.stationId || "",
      destinationId: undefined,
      tripId: undefined,
      forTransshipment: false,
    },
  });
  const coverage = form.watch("coverage");
  const type = form.watch("type");
  const originId = form.watch("originId");
  const [trips, setTrips] = useState<
    (Trip & { remainingStationIds?: string[] })[]
  >([]);

  useEffect(() => {
    if (!coverage || !originId) return;
    axiosInstance
      .get(
        `/vendor/trips/for-shipment?coverage=${coverage}&originId=${originId}`,
      )
      .then(({ data }: { data: ApiResponseType }) => {
        setTrips(data.trips);
      });
  }, [coverage, originId]);
  const tripId = form.watch("tripId");
  const trip = trips.find((trip) => trip.id === tripId);
  console.log(trip);
  const [state, setState] = useState<State | undefined>();
  const [region, setRegion] = useState<Station | undefined>();
  const [originStateCode, setOriginStateCode] = useState<string | undefined>(
    statesLGAs.find(
      (state: State) =>
        state.id === staff.officePersonnelInfo?.station?.stateId,
    )?.code,
  );
  let stationsList: Station[] = [];
  if (coverage === ShipmentCoverage.LOCAL) {
    stationsList = staff.officePersonnelInfo?.stationId
      ? stations.filter(
          (station) => station.id === staff.officePersonnelInfo?.stationId,
        )
      : stations.filter((station) => station.stateId === state?.id);
  } else if (coverage === ShipmentCoverage.REGIONAL) {
    if (staff.officePersonnelInfo?.stationId) {
      const station = stations.find(
        (station) => station.id === staff.officePersonnelInfo?.stationId,
      );
      stationsList = [station!, ...station!.localStations];
    } else {
      stationsList = region ? [region!, ...region!.localStations] : [];
    }
  } else if (coverage === ShipmentCoverage.INTRASTATE) {
    stationsList = stations.filter((station) => {
      if (staff.officePersonnelInfo?.stationId)
        return station.id !== staff.officePersonnelInfo?.stationId;
      else if (state) return station.stateId === state.id;
      else return false;
    });
  } else if (coverage === ShipmentCoverage.INTERSTATE) {
    stationsList = stations.filter(
      (station) => station.type === StationType.REGIONAL,
    );
  }

  const destinationStationsList = trip
    ? trip.remainingStationIds?.map(
        (id) => stations.find((station) => station.id === id)!,
      ) || []
    : [];

  const [destinationStateCode, setDestinationStateCode] = useState<
    string | undefined
  >();
  const regionalStations = stations.filter(
    (station: Station) => station.type === StationType.REGIONAL,
  );
  useEffect(() => {
    if (originStateCode)
      form.setValue(
        "code",
        shipmentCodeGen(originStateCode, destinationStateCode),
      );
  }, [originStateCode, destinationStateCode]);

  const { mutate } = useMutation({
    mutationKey: ["trips"],
    mutationFn: async (values: z.infer<typeof ShipmentSchema>) => {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/shipments",
        values,
      );
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const onSubmit = (value: z.infer<typeof ShipmentSchema>) => {
    mutate(value, {
      onSuccess: async (data) => {
        toast({ description: data.message });
        await navigate({ to: `/shipments/${data.shipment.id}` });
      },
      onError: (error) => {
        toast({ description: error.message, variant: "destructive" });
      },
    });
  };
  return (
    <div className=" p-4">
      <Card className="relative z-40">
        <CardHeader>
          <CardTitle>Create New Shipment</CardTitle>
          <CardDescription>
            Fill out the shipment details carefully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                () => validatePinElementGen("add-trip"),
                () => console.log(form.getValues(), form.formState.errors),
              )}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                {/* Coverage Select */}
                <FormField
                  control={form.control}
                  name="coverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.resetField("tripId");
                            form.setValue("type", ShipmentType.DIRECT);
                            form.resetField("originId");
                            form.resetField("code");
                            setState(undefined);
                            setRegion(undefined);
                            setTrips([]);
                            setOriginStateCode(
                              statesLGAs.find(
                                (state: State) =>
                                  state.id ===
                                  staff.officePersonnelInfo?.station?.stateId,
                              )?.code,
                            );
                            setDestinationStateCode(undefined);
                            form.resetField("destinationId");
                            setRegion(undefined);
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select coverage" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ShipmentCoverage).map((coverage) => (
                              <SelectItem key={coverage} value={coverage}>
                                {coverage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trip Type Select */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipment Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue(
                              "forTransshipment",
                              v === ShipmentType.TRANSHIPMENT,
                            );
                            form.resetField("code");
                            // revisit
                            setDestinationStateCode(undefined);
                            form.resetField("destinationId");
                          }}
                          value={field.value}
                          disabled={coverage === ShipmentCoverage.LOCAL}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shipment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ShipmentType).map((type) => (
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

                {/*State select*/}
                {(coverage === ShipmentCoverage.INTRASTATE ||
                  ([ShipmentCoverage.LOCAL, ShipmentCoverage.REGIONAL].includes(
                    coverage,
                  ) &&
                    !staff.officePersonnelInfo?.stationId)) && (
                  <div className="flex flex-col gap-3">
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const state = statesLGAs.find(
                          (state: State) => state.id === +value,
                        );
                        setState(state);
                        form.resetField("code");
                        form.resetField("originId");
                        form.resetField("tripId");
                        setTrips([]);
                        setOriginStateCode(
                          statesLGAs.find(
                            (state: State) =>
                              state.id ===
                              staff.officePersonnelInfo?.station?.stateId,
                          )?.code,
                        );
                        setDestinationStateCode(undefined);
                        form.resetField("destinationId");
                        setRegion(undefined);
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
                )}
                {/*Region select*/}
                {coverage === ShipmentCoverage.REGIONAL &&
                  !staff.officePersonnelInfo?.stationId && (
                    <div className="flex flex-col gap-3 justify-end">
                      <Label>Region Station</Label>
                      <Select
                        onValueChange={(v) => {
                          setRegion(JSON.parse(v));
                          form.resetField("code");
                          form.resetField("originId");
                          form.resetField("destinationId");
                          form.resetField("tripId");
                          setTrips([]);
                          setOriginStateCode(
                            statesLGAs.find(
                              (state: State) =>
                                state.id ===
                                staff.officePersonnelInfo?.station?.stateId,
                            )?.code,
                          );
                          setDestinationStateCode(undefined);
                        }}
                        disabled={!regionalStations.length}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regionalStations.map((region) => (
                            <SelectItem
                              key={region.id}
                              value={JSON.stringify(region)}
                            >
                              {region.code} ({region.nickName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                {coverage &&
                  type &&
                  ((coverage === ShipmentCoverage.LOCAL &&
                    !staff.officePersonnelInfo?.stationId &&
                    state) ||
                    coverage !== ShipmentCoverage.LOCAL) && (
                    <>
                      {/* Origin ID Select */}
                      <FormField
                        control={form.control}
                        name="originId"
                        disabled={staff.role === StaffRole.MANAGER}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origin</FormLabel>
                            <FormDescription>
                              Station where shipment originates (Your Station)
                            </FormDescription>
                            <FormControl>
                              <Select
                                onValueChange={(v) => {
                                  field.onChange(v);
                                  setOriginStateCode(
                                    stationsList.find(
                                      (station) => station.id === v,
                                    )?.state.code,
                                  );
                                  form.resetField("destinationId");
                                  setDestinationStateCode(undefined);
                                }}
                                defaultValue={field.value}
                                disabled={!stationsList.length}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select origin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {stationsList.map((origin) => (
                                    <SelectItem
                                      key={origin.id}
                                      value={origin.id}
                                    >
                                      {origin.code} ({origin.nickName})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <>
                        {/*Transhipment*/}
                        {originId && coverage !== ShipmentCoverage.LOCAL && (
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="forTransshipment"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      disabled={true}
                                      checked={field.value}
                                      onCheckedChange={(v) => {
                                        field.onChange(v);
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Mark this shipment for transhipment
                                    </FormLabel>
                                    <FormDescription>
                                      If selected the destination station will
                                      be able to reassign the shipment to
                                      another trip changing it destination.
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                        {/* Trip ID */}
                        <FormField
                          control={form.control}
                          name="tripId"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Trip</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(v) => {
                                    field.onChange(v);
                                    form.resetField("destinationId");
                                    setDestinationStateCode(undefined);
                                  }}
                                  defaultValue={field.value}
                                  value={field.value}
                                  // disabled={!trips.length}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Trip" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {trips?.map((trip) => (
                                      <SelectItem key={trip.id} value={trip.id}>
                                        {trip.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Destination ID Select */}
                        {originId && coverage !== ShipmentCoverage.LOCAL && (
                          <FormField
                            control={form.control}
                            name="destinationId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <FormDescription>
                                  The station where the shipment will end on the
                                  route
                                </FormDescription>
                                <FormControl>
                                  <Select
                                    onValueChange={(v) => {
                                      field.onChange(v);
                                      setDestinationStateCode(
                                        stationsList.find(
                                          (station) => station.id === v,
                                        )?.state.code,
                                      );
                                    }}
                                    defaultValue={field.value}
                                    // disabled={
                                    //   !destinationStationsList ||
                                    //   !destinationStationsList.length
                                    // }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {destinationStationsList?.map(
                                        (destination) => (
                                          <SelectItem
                                            key={destination.id}
                                            value={destination.id}
                                          >
                                            {destination.name} (
                                            {destination.nickName})
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
                        )}
                      </>
                    </>
                  )}

                {/* Trip Code */}
                <FormInput
                  disabled={true}
                  control={form.control}
                  name="code"
                  label="Shipment Code"
                  placeholder="Enter trip code"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button type="submit" className="w-full md:w-auto">
                  Create Shipment
                </Button>
                <ConfirmPin
                  id="add-trip"
                  action={form.handleSubmit(onSubmit)}
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
