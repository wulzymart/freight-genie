import {
  createFileRoute,
  useLoaderData,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

import {
  ApiResponseType,
  Coordinate,
  RouteCoverage,
  RoutingProfileType,
  StaffRole,
  Station,
  StationType,
  Vehicle,
} from "@/lib/custom-types.ts";
import { axiosInstance } from "@/lib/axios.ts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MdAdd } from "react-icons/md";
import { Edit, Save, Trash2, Trash2Icon, TruckIcon } from "lucide-react";
import { useAuth } from "@/hooks/auth-context.tsx";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import _ from "lodash";
import { useToast } from "@/hooks/use-toast.ts";
import ConfirmPin from "@/components/confirm-pin.tsx";
import { validatePinElementGen } from "@/lib/utils.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapBox } from "@/components/map.tsx";
import { Marker, Popup } from "react-leaflet";
import { Hotline } from "react-leaflet-hotline";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form.tsx";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRouteById } from "@/lib/queries/routes.ts";
import { DataTable } from "@/components/ui/data-table.tsx";
import { columns } from "@/tables/vehicles/columns.tsx";
import { tripPersonnelColumns } from "@/tables/trip-officers/columns.tsx";

export const Route = createFileRoute("/_authenticated/routes/$id")({
  component: Page,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    return await queryClient.ensureQueryData(getRouteById(+id));
  },
});

function Page() {
  const route = Route.useLoaderData();
  const { id } = Route.useParams();
  const routeGeometry = route.routingInfo
    ? route.routingInfo.profile === RoutingProfileType.ORS
      ? route.routingInfo.data.features[0].geometry
      : route.routingInfo.data.routes[0].geometry
    : undefined;
  const locations: {
    lat: number;
    long: number;
  }[] = routeGeometry?.coordinates.map(([long, lat]: Coordinate) => ({
    lat,
    long,
  }));
  const { stations, statesLGAs } = useLoaderData({ from: "/_authenticated" });
  const { user } = useAuth();
  const [routeStations, setRouteStations] = useState<Station[]>(
    route.stationIds.map(
      (id) => stations.find((station) => station.id === id)!,
    ),
  );
  let availableStations: Station[];
  if (route.coverage === RouteCoverage.LOCAL) {
    const motherStation = routeStations.find(
      (station) => station.type === StationType.REGIONAL,
    )!;
    availableStations = [motherStation, ...motherStation.localStations];
  } else if (route.coverage === RouteCoverage.INTRASTATE) {
    const state = statesLGAs.find(
      (state) => state.id === routeStations[0].stateId,
    )!;
    availableStations = stations.filter(
      (station) => station.stateId === state.id,
    );
  } else {
    availableStations = stations.filter(
      (station) => station.type === StationType.REGIONAL,
    );
  }

  const nonSelectedStations = availableStations.filter(
    (station) =>
      !routeStations.map((station) => station.id).includes(station.id),
  );
  const [selectedStation, setSelectedStation] = useState<Station | undefined>(
    undefined,
  );
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const getStationPos = (id: string, arr: { id: any; [key: string]: any }[]) =>
    arr.findIndex((item) => item.id === id);
  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditing) return;
    const { active, over } = event;
    if (active.id === over?.id) return;

    setRouteStations((routeStations) => {
      const oldPos = getStationPos(active.id as string, routeStations);
      const newPos = getStationPos(over?.id as string, routeStations);
      return arrayMove(routeStations, oldPos, newPos);
    });
  };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function addStation(station: Station) {
    setRouteStations((routeStations) => [...routeStations, station]);
  }

  function onDeleteStation(id: string) {
    setRouteStations((routeStations) =>
      routeStations.filter((station) => station.id !== id),
    );
  }

  const { toast } = useToast();
  const isChanged = () => {
    const stationIds = routeStations.map((station) => station.id);
    return !_.isEqual(route.stationIds, stationIds);
  };
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function onSave() {
    const stationIds = routeStations.map((station) => station.id);
    const { data }: { data: ApiResponseType } = await axiosInstance.patch(
      `/vendor/routes/${route.id}`,
      { stationIds },
    );
    if (!data.success) throw new Error(data.message);
    console.log(data);
    toast({ description: data.message });
    await queryClient.refetchQueries({ queryKey: ["routes", "route", +id] });
    await router.invalidate();
    await router.load();
    await navigate({ to: `/routes/${route.id}` });
  }

  async function deleteRoute() {
    const { data }: { data: ApiResponseType } = await axiosInstance.delete(
      `/vendor/routes/${route.id}`,
    );
    if (!data.success) throw new Error(data.message);
    toast({ description: data.message });
    await queryClient.refetchQueries({ queryKey: ["routes"] });
    await router.invalidate();
    await router.load();
    await navigate({ to: "/routes" });
  }

  return (
    <div>
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="space-y-6 md:px-10">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Code</p>
              <p className="font-bold text-lg text-gray-600">{route.code}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">
                Coverage
              </p>
              <p className="font-bold text-lg text-gray-600">
                {route.coverage}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Type</p>
              <p className="font-bold text-lg text-gray-600">{route.type}</p>
            </div>
          </div>
          {user.staff.role === StaffRole.DIRECTOR && (
            <div className="flex justify-center items-end mt-16">
              <AddVehicle />
              <div>
                <Button
                  onClick={() => validatePinElementGen("delete-route")}
                  className="flex gap-2 text-gray-600"
                  variant="ghost"
                  size="lg"
                >
                  <Trash2 />
                  <span className="font-semibold">Delete Route</span>
                </Button>
                <ConfirmPin id="delete-route" action={deleteRoute} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="space-y-8">
          <Card>
            <CardHeader className="">
              <p className="text-gray-600 font-semibold">Registered Vehicles</p>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={route.vehicles} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="">
              <p className="text-gray-600 font-semibold">Route Drivers</p>
            </CardHeader>
            <CardContent>
              <DataTable columns={tripPersonnelColumns} data={route.drivers} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="">
              <p className="text-gray-600 font-semibold">Route Attendants</p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={tripPersonnelColumns}
                data={route.vehicleAssistants}
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="">
                <div className="flex justify-between">
                  <p className="text-gray-600 font-semibold">Route Stations</p>
                  {user.staff.role === StaffRole.DIRECTOR && (
                    <Button
                      onClick={() => {
                        isEditing
                          ? isChanged()
                            ? validatePinElementGen("save-route")
                            : setIsEditing(!isEditing)
                          : setIsEditing(!isEditing);
                      }}
                      variant="ghost"
                      size="icon"
                    >
                      {!isEditing ? <Edit /> : <Save />}
                    </Button>
                  )}
                  <ConfirmPin
                    id="save-route"
                    action={() => onSave().then(() => setIsEditing(!isEditing))}
                  />
                </div>
              </CardHeader>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                {isEditing && (
                  <CardContent>
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-2">
                        Add Station
                      </p>
                      <div className="flex gap-3">
                        <Select
                          value={selectedStation?.id || ""}
                          onValueChange={(value) =>
                            setSelectedStation(
                              nonSelectedStations.find(
                                (station) => station.id === value,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            {selectedStation ? (
                              `${selectedStation.name} (${selectedStation.nickName})`
                            ) : (
                              <SelectValue
                                placeholder="Select Station"
                                className="w-full"
                              />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {nonSelectedStations.map((station) => (
                              <SelectItem key={station.id} value={station.id}>
                                {station.name} ({station.nickName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className="flex gap-2"
                          variant="outline"
                          onClick={() => {
                            selectedStation
                              ? addStation(selectedStation)
                              : undefined;
                            setSelectedStation(undefined);
                          }}
                        >
                          <MdAdd />
                          <span>Add</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
                <CardContent className="space-y-4">
                  <SortableContext
                    items={routeStations}
                    strategy={verticalListSortingStrategy}
                  >
                    {routeStations.map((station) => (
                      <StationCard
                        isEditable={isEditing}
                        station={station}
                        key={station.id}
                        onDelete={onDeleteStation}
                      />
                    ))}
                  </SortableContext>
                </CardContent>
              </DndContext>
            </Card>
            <Card className="col-span-2 h-[500px]">
              <MapBox
                center={[routeStations[0].latitude, routeStations[0].longitude]}
                zoom={7}
              >
                {routeStations.map((station) => (
                  <Marker
                    key={station.id}
                    position={[station.latitude, station.longitude]}
                  >
                    <Popup>
                      <p>
                        {station.name} ({station.nickName})
                      </p>
                    </Popup>
                  </Marker>
                ))}

                {locations && (
                  <Hotline
                    data={locations}
                    getLat={(l: { lat: number; long: number }) => l.lat}
                    getLng={(l: { lat: number; long: number }) => l.long}
                    getVal={() => 5}
                  />
                )}
              </MapBox>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StationCard({
  station,
  isEditable,
  onDelete,
}: {
  station: Station;
  isEditable: boolean;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: station.id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={
        isEditable
          ? { ...style, position: "relative", touchAction: "none" }
          : undefined
      }
    >
      <CardHeader className="flex flex-row justify-between w-full">
        <CardTitle className="text-gray-600 text-lg">
          {station.name} ({station.nickName})
        </CardTitle>
        {isEditable && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(station.id)}
          >
            <Trash2Icon className="text-red-600" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p>{station.type}</p>
        <p>{station.address}</p>
      </CardContent>
    </Card>
  );
}

const addVehicleSchema = z.object({
  vehicleId: z.string().uuid({ message: "Please select a vehicle" }),
});

function AddVehicle() {
  const id = +Route.useParams().id;
  const form = useForm<z.infer<typeof addVehicleSchema>>({
    resolver: zodResolver(addVehicleSchema),
    defaultValues: { vehicleId: "" },
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { mutate } = useMutation({
    mutationKey: ["routes", "route", id],
    mutationFn: async (values: z.infer<typeof addVehicleSchema>) => {
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        `/vendor/routes/${id}/vehicles`,
        values,
      );
      if (!data.success) throw new Error(data.message);
      return data;
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const onSubmit = (values: z.infer<typeof addVehicleSchema>) => {
    mutate(values, {
      onSuccess: async (data) => {
        toast({ description: data.message });
        await queryClient.invalidateQueries({
          queryKey: ["route", +id],
        });
        await router.invalidate();
        await router.load();
      },
      onError: (error) => {
        toast({ variant: "destructive", description: error.message });
      },
    });
  };

  useEffect(() => {
    const getVehicles = async () => {
      const { data }: { data: ApiResponseType } = await axiosInstance.get(
        `/vendor/routes/${id}/vehicles?search=addable`,
      );
      if (!data.success) throw new Error(data.message);
      return data.vehicles as Vehicle[];
    };
    getVehicles()
      .then((data) => {
        setVehicles(data);
        setIsLoading(false);
      })
      .catch(() => setIsError(true));
  }, []);
  return (
    <Dialog>
      <DialogTrigger asChild={true}>
        <div>
          <Button
            className="flex gap-2 text-gray-600"
            variant="ghost"
            size="lg"
          >
            <TruckIcon />
            <span className="font-semibold">Add Vehicle</span>
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="md:w-1/2 lg:w-1/3">
        <Card>
          <CardHeader>
            <CardTitle>Add Vehicle to Route</CardTitle>
          </CardHeader>
          {isLoading ? (
            <p>loading</p>
          ) : (
            <Form {...form}>
              <form>
                <CardContent className="space-y-8">
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Model & No</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isLoading || isError}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles?.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.model} {vehicle.registrationNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={form.handleSubmit(() =>
                        validatePinElementGen("add-vehicle"),
                      )}
                    >
                      Submit
                    </Button>
                    <ConfirmPin
                      id="add-vehicle"
                      action={form.handleSubmit(onSubmit)}
                    />
                  </div>
                </CardContent>
              </form>
            </Form>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
