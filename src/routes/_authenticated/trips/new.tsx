import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripFormSchema } from "@/lib/zodSchemas.ts";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormInput from "@/components/form-input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ApiResponseType,
  Route as RouteInterface,
  RouteCoverage,
  StaffRole,
  State,
  Station,
  StationType,
  TripCoverage,
  TripPersonnel,
  TripPersonnelStatus,
  TripType,
  Vehicle,
  VehicleCoverage,
  VehicleStatus,
} from "@/lib/custom-types.ts";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/hooks/auth-context.tsx";
import { routeTripCodeGen, validatePinElementGen } from "@/lib/utils.ts";
import {
  TripPersonnelQueryStrings,
  VehiclesQueryStrings,
} from "@/lib/query-params.tsx";
import { axiosInstance } from "@/lib/axios.ts";
import qs from "qs";
import { CustomErrorComponent } from "@/components/error-component.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { RoutingMap } from "@/components/maps/routing.tsx";
import ConfirmPin from "@/components/confirm-pin.tsx";
export const Route = createFileRoute("/_authenticated/trips/new")({
  component: TripForm,
  errorComponent: ({ error }) => (
    <CustomErrorComponent errorMessage={error.message} />
  ),
});

function TripForm() {
  const { stations, statesLGAs, routes } = useLoaderData({
    from: "/_authenticated",
  });
  const {
    user: { staff },
  } = useAuth();
  const form = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      code: "",
      coverage:
        staff.role === StaffRole.MANAGER
          ? TripCoverage.LASTMAN
          : staff.role === StaffRole.REGION_MANAGER
            ? TripCoverage.REGIONAL
            : TripCoverage.INTERSTATE,
      type: TripType.REGULAR,
      vehicleId: "",
      driverId: "",
      vehicleAssistantId: undefined,
      originId: staff.officePersonnelInfo?.stationId || "",
      destinationId: "",
      routeId: undefined,
      isReturn: false,
    },
  });
  const routeId = form.watch("routeId");
  const coverage = form.watch("coverage");
  const isReturn = form.watch("isReturn");
  const originId = form.watch("originId");
  const destinationId = form.watch("destinationId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate } = useMutation({
    mutationKey: ["trips"],
    mutationFn: async (values: z.infer<typeof tripFormSchema>) => {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/trips",
        values,
      );
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });
  // generate type safe routeCoverage
  let routeCoverage: RouteCoverage | undefined;

  switch (coverage) {
    case TripCoverage.REGIONAL:
      routeCoverage = RouteCoverage.LOCAL;
      break;
    case TripCoverage.INTRASTATE:
      routeCoverage = RouteCoverage.INTRASTATE;
      break;
    case TripCoverage.INTERSTATE:
      routeCoverage = RouteCoverage.INTERSTATE;
      break;
    default:
      routeCoverage = undefined;
  }

  // type safe vehicle coverage
  let vehicleCoverage: VehicleCoverage;

  switch (coverage) {
    case TripCoverage.LASTMAN:
      vehicleCoverage = VehicleCoverage.LOCAL;
      break;
    case TripCoverage.REGIONAL:
      vehicleCoverage = VehicleCoverage.REGIONAL;
      break;
    case TripCoverage.INTRASTATE:
      vehicleCoverage = VehicleCoverage.INTRASTATE;
      break;
    case TripCoverage.INTERSTATE:
      vehicleCoverage = VehicleCoverage.INTERSTATE;
  }

  const type = form.watch("type");

  const [state, setState] = useState<State | undefined>();
  const [region, setRegion] = useState<Station | undefined>();
  const regionalStations = stations.filter(
    (station: Station) => station.type === StationType.REGIONAL,
  );

  // get stations list
  let stationsList: Station[] = [];
  if (coverage === TripCoverage.LASTMAN) {
    stationsList = staff.officePersonnelInfo?.stationId
      ? stations.filter(
          (station) => station.id === staff.officePersonnelInfo?.stationId,
        )
      : stations.filter((station) => station.stateId === state?.id);
  } else if (coverage === TripCoverage.REGIONAL) {
    if (staff.officePersonnelInfo?.stationId) {
      const station = stations.find(
        (station) => station.id === staff.officePersonnelInfo?.stationId,
      );
      stationsList = [station!, ...station!.localStations];
    } else {
      stationsList = region ? [region!, ...region!.localStations] : [];
    }
  } else if (coverage === TripCoverage.INTRASTATE) {
    stationsList = stations.filter((station) => {
      if (staff.officePersonnelInfo?.stationId)
        return station.id !== staff.officePersonnelInfo?.stationId;
      else if (state) return station.stateId === state.id;
      else return false;
    });
  } else if (coverage === TripCoverage.INTERSTATE) {
    stationsList = stations.filter(
      (station) => station.type === StationType.REGIONAL,
    );
  }

  // routes list generation
  const routesList = routes.filter(
    (route) =>
      route.stationIds.includes(originId!) &&
      route.type === (type as any) &&
      route.coverage === routeCoverage,
  );
  const [route, setRoute] = useState<RouteInterface>();

  // destination stations
  const [destinationStationsList, setDestinationStationsList] = useState<
    Station[]
  >([]);
  const stationsInOrder = (
    isReturn: boolean = false,
    route: RouteInterface,
  ) => {
    return isReturn ? route.stationIds.reverse() : route.stationIds;
  };
  const setDestinationStations = (
    isReturn: boolean = false,
    originId: string,
    route: RouteInterface,
  ) => {
    const stationIds = stationsInOrder(isReturn, route);

    const originIndex = stationIds.findIndex((id) => id === originId);
    if (originIndex === -1 || originIndex === stationIds.length - 1)
      return setDestinationStationsList([]);
    const returnStations = stationIds
      .slice(originIndex + 1)
      .map((id) => stations.find((station) => station.id === id));

    console.log(returnStations);
    setDestinationStationsList(returnStations as Station[]);
  };
  useEffect(() => {
    if (!route || !originId) return;
    setDestinationStations(isReturn, originId, route);
  }, [originId, route, isReturn]);
  const [originStateCode, setOriginStateCode] = useState<string | undefined>(
    statesLGAs.find(
      (state: State) =>
        state.id === staff.officePersonnelInfo?.station?.stateId,
    )?.code,
  );
  const [destinationStateCode, setDestinationStateCode] = useState<
    string | undefined
  >();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<TripPersonnel[]>([]);
  const [vehicleAssistants, setVehicleAssistants] = useState<TripPersonnel[]>(
    [],
  );

  // use effect to get code
  useEffect(() => {
    if (originStateCode)
      form.setValue(
        "code",
        routeTripCodeGen(coverage, type, originStateCode, destinationStateCode),
      );
  }, [originStateCode, destinationStateCode]);

  // use effect for trip staff and vehicles
  useEffect(() => {
    if (!originId) return;

    const vehicleSearch: VehiclesQueryStrings = {
      status: VehicleStatus.AVAILABLE,
      currentStationId: originId,
    };
    const tripPersonnelSearch: TripPersonnelQueryStrings = {
      type: "driver",
      status: TripPersonnelStatus.AVAILABLE,
      currentStationId: originId,
    };
    if (routeId) {
      vehicleSearch.currentRouteId = routeId;
      tripPersonnelSearch.registeredRouteId = routeId;
    }
    if (coverage) {
      vehicleSearch.coverage = vehicleCoverage;
      tripPersonnelSearch.routeCoverage = routeCoverage;
    }
    if (type) {
      tripPersonnelSearch.routeType = type as any;
    }

    async function fetchVehicles() {
      const searchQueryString = qs.stringify(vehicleSearch);
      const { data }: { data: ApiResponseType } = await axiosInstance.get(
        `/vendor/vehicles?${searchQueryString}`,
      );
      if (!data.success) throw new Error(data.message);
      return data.vehicles as Vehicle[];
    }

    async function fetchDrivers() {
      tripPersonnelSearch.type = "driver";
      const searchQueryString = qs.stringify(tripPersonnelSearch);
      const { data }: { data: ApiResponseType } = await axiosInstance.get(
        `/vendor/staff/trip-staff?${searchQueryString}`,
      );
      if (!data.success) throw new Error(data.message);
      return data.personnel as TripPersonnel[];
    }

    async function fetchAssistants() {
      tripPersonnelSearch.type = "assistant";
      const searchQueryString = qs.stringify(tripPersonnelSearch);
      const { data }: { data: ApiResponseType } = await axiosInstance.get(
        `/vendor/staff/trip-staff?${searchQueryString}`,
      );
      if (!data.success) throw new Error(data.message);
      return data.personnel as TripPersonnel[];
    }

    fetchVehicles().then((data) => setVehicles(data));
    fetchDrivers().then((data) => setDrivers(data));
    fetchAssistants().then((data) => setVehicleAssistants(data));
  }, [routeId, coverage, originId, type]);

  const onSubmit = (value: z.infer<typeof tripFormSchema>) => {
    mutate(value, {
      onSuccess: async (data) => {
        toast({ description: data.message });
        await navigate({ to: `/trips/${data.trip.id}` });
      },
      onError: (error) => {
        toast({ description: error.message, variant: "destructive" });
      },
    });
    // Handle form submission
  };
  const [mapData, setMapData] = useState<any>();

  const getMapDetails = (
    isReturn: boolean,
    originId: string,
    route?: RouteInterface,
    destinationId?: string,
  ) => {
    if (!originId) return;
    const data: any = {};
    const origin = stations.find((station) => station.id === originId);
    if (!destinationId) {
      data.routeStations = [origin!];
      return data;
    }
    if (!route) return;
    const stationIds = stationsInOrder(isReturn, route);
    const originIndex = stationIds.findIndex((id) => id === originId);
    const destinationIndex = stationIds.findIndex((id) => id === destinationId);
    const routeStationIds = stationIds.slice(originIndex, destinationIndex + 1);
    const routeStations = routeStationIds.map(
      (id) => stations.find((station) => station.id === id)!,
    )!;
    data.routeStations = routeStations as Station[];
    data.locations = routeStations.map((station) => ({
      lat: station.latitude,
      long: station.longitude,
    }));
    return data;
  };
  useEffect(() => {
    if (!originId) return;
    if (isReturn && !destinationId) return;
    const data = getMapDetails(isReturn, originId, route, destinationId);
    setMapData(data);
  }, [isReturn, route, originId, destinationId]);
  return (
    <div className=" p-4">
      <Card className="relative z-40">
        <CardHeader>
          <CardTitle>Create New Trip</CardTitle>
          <CardDescription>Fill out the trip details carefully</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(() =>
                validatePinElementGen("add-trip"),
              )}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                {/* Coverage Select */}
                <FormField
                  control={form.control}
                  name="coverage"
                  disabled={[
                    StaffRole.MANAGER,
                    StaffRole.REGION_MANAGER,
                  ].includes(staff.role)}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            console.log(v);
                            setState(undefined);
                            form.resetField("routeId");
                            form.setValue(
                              "originId",
                              staff.officePersonnelInfo?.stationId || "",
                            );
                            form.resetField("code");
                            setOriginStateCode(
                              statesLGAs.find(
                                (state: State) =>
                                  state.id ===
                                  staff.officePersonnelInfo?.station?.stateId,
                              )?.code,
                            );
                            setDestinationStateCode(undefined);
                            form.resetField("destinationId");
                            form.resetField("vehicleId");
                            form.resetField("driverId");
                            form.resetField("vehicleAssistantId");
                            setRegion(undefined);
                            setRoute(undefined);
                          }}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select coverage" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TripCoverage).map((coverage) => (
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
                      <FormLabel>Trip Type</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.resetField("routeId");
                            form.resetField("code");
                            setDestinationStateCode(undefined);
                            form.resetField("destinationId");
                            setRoute(undefined);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TripType).map((type) => (
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
                {(coverage === TripCoverage.INTRASTATE ||
                  ([TripCoverage.LASTMAN, TripCoverage.REGIONAL].includes(
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
                        setRoute(undefined);
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
                {coverage === TripCoverage.REGIONAL &&
                  !staff.officePersonnelInfo?.stationId && (
                    <div className="flex flex-col gap-3 justify-end">
                      <Label>Region Station</Label>
                      <Select
                        onValueChange={(v) => {
                          setRegion(JSON.parse(v));
                          form.resetField("code");
                          form.resetField("originId");
                          form.resetField("routeId");
                          form.resetField("destinationId");
                          setOriginStateCode(
                            statesLGAs.find(
                              (state: State) =>
                                state.id ===
                                staff.officePersonnelInfo?.station?.stateId,
                            )?.code,
                          );
                          setDestinationStateCode(undefined);
                          setRoute(undefined);
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
                  ((coverage === TripCoverage.LASTMAN &&
                    !staff.officePersonnelInfo?.stationId &&
                    state) ||
                    coverage !== TripCoverage.LASTMAN) && (
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
                              The station where the trip will start on the route
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
                                  form.resetField("routeId");
                                  form.resetField("destinationId");
                                  setDestinationStateCode(undefined);
                                  setRoute(undefined);
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
                      {originId && coverage !== TripCoverage.LASTMAN && (
                        <>
                          {/* Route ID */}
                          <FormField
                            control={form.control}
                            name="routeId"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Trip Route</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={(v) => {
                                      field.onChange(v);
                                      setRoute(
                                        routes.find((route) => route.id === +v),
                                      );
                                      form.resetField("destinationId");
                                      setDestinationStateCode(undefined);
                                    }}
                                    defaultValue={field.value as any}
                                    value={+field.value! as any}
                                    disabled={!routesList?.length}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select Route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {routesList?.map((route) => (
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
                          {/*is it a reverse trip*/}
                          <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="isReturn"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(v) => {
                                        field.onChange(v);
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>
                                      Is this trip in the opposite direction of
                                      the route?
                                    </FormLabel>
                                    <FormDescription>
                                      If selected the stations in route will be
                                      in reverse order
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* Destination ID Select */}
                          {routeId && (
                            <FormField
                              control={form.control}
                              name="destinationId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Destination</FormLabel>
                                  <FormDescription>
                                    The station where the trip will end on the
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
                                      disabled={!destinationStationsList.length}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select destination" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {destinationStationsList.map(
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
                      )}
                    </>
                  )}

                {/* Trip Code */}
                <FormInput
                  disabled={true}
                  control={form.control}
                  name="code"
                  label="Trip Code"
                  placeholder="Enter trip code"
                />

                {/* Vehicle ID Select */}
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!vehicles.length}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.model} {vehicle.registrationNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Driver ID Select */}
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!drivers.length}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.staffInfo.firstname}{" "}
                                {driver.staffInfo.lastname} (
                                {driver.currentStation.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vehicle Assistant ID Select (Optional) */}
                <FormField
                  control={form.control}
                  name="vehicleAssistantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Assistant (Optional)</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!vehicleAssistants.length}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assistant" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleAssistants.map((assistant) => (
                              <SelectItem
                                key={assistant.id}
                                value={assistant.id}
                              >
                                {assistant.staffInfo.firstname}{" "}
                                {assistant.staffInfo.lastname} (
                                {assistant.currentStation.name})
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

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button type="submit" className="w-full md:w-auto">
                  Create Trip
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
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          {mapData?.locations && (
            <small className="text-red-400">
              NB: Lines are not for direction but order of movement
            </small>
          )}
          <div className="w-full h-[400px]">
            {mapData && <RoutingMap {...mapData} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
