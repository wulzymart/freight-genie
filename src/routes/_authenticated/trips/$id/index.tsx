import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import {
  Coordinate,
  RoutingProfileType,
  StaffRole,
  TripStatus,
} from "@/lib/custom-types.ts";
import { useAuth } from "@/hooks/auth-context.tsx";
import TripStations from "@/components/trip-stations-step.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Calendar,
  Car,
  ClipboardList,
  MapPin,
  Navigation,
  Route as RouteIcon,
  Truck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { BiTrip } from "react-icons/bi";
import { GiPathDistance } from "react-icons/gi";
import { RoutingMap } from "@/components/maps/routing.tsx";
import { GetTripStations } from "@/hooks/trip.ts";

export const Route = createFileRoute("/_authenticated/trips/$id/")({
  component: SingleTripPage,
});
function SingleTripPage() {
  const trip = useLoaderData({ from: "/_authenticated/trips/$id" });
  const tripStations = GetTripStations(trip);
  const distance = trip.routingInfo
    ? trip.routingInfo.profile === RoutingProfileType.ORS
      ? trip.routingInfo.data.features[0].distance
      : trip.routingInfo.data.routes[0].distance
    : undefined;
  const tripGeometry = trip.routingInfo
    ? trip.routingInfo.profile === RoutingProfileType.ORS
      ? trip.routingInfo.data.features[0].geometry
      : trip.routingInfo.data.routes[0].geometry
    : undefined;
  const locations: {
    lat: number;
    long: number;
  }[] = tripGeometry?.coordinates.map(([long, lat]: Coordinate) => ({
    lat,
    long,
  }));
  function handleNext() {
    const { currentStationId, nextStationId } = trip;
    if (currentStationId && nextStationId) {
      // trip.currentStationId = nextStationId
      // set status to ongoing
      console.log("depart current station to next station");
    } else {
      if (currentStationId) {
        // set status to completed
        console.log("end trip");
      } else if (nextStationId) {
        // set status to at intermediate station
        console.log("arrive nextStationId");
      }
    }
  }
  function handleDelay() {
    // set status to delayed
    // update trip history
    // set shipments status to delayed
    // update shipment history
    // set all orders' status to delayed
    // update order tracking and history

    console.log("delayed trip");
  }
  const { role } = useAuth();
  return (
    <div className="space-y-6">
      <TripStations
        stations={tripStations}
        currentStationId={trip.currentStationId!}
        nextStationId={trip.nextStationId!}
      />
      <div className="flex justify-end gap-6">
        {trip.status !== TripStatus.COMPLETED && (
          <Button type="button" onClick={handleNext}>
            {trip.status === TripStatus.PLANNED
              ? "Start Trip"
              : trip.status === TripStatus.ONGOING
                ? trip.nextStationId
                  ? "Arrived Next Station"
                  : "End Trip"
                : ""}
          </Button>
        )}
        {trip.status !== TripStatus.DELAYED && (
          <Button onClick={handleDelay} variant="ghost" type="button">
            Alert Delay
          </Button>
        )}
        {trip.status !== TripStatus.COMPLETED &&
          [StaffRole.REGION_MANAGER, StaffRole.DIRECTOR].includes(role!) && (
            <Link to={`/trips/${trip.id}/edit`}>
              <Button variant="link" type="button">
                Edit Trip
              </Button>
            </Link>
          )}
      </div>
      <div className="px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        <Card className="w-full shadow-lg lg:col-span-2">
          <CardHeader className="bg-gray-50 border-b p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <ClipboardList className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-2xl font-bold">
                  Trip {trip.code}
                </CardTitle>
              </div>
              <Badge
                variant={
                  trip.status === TripStatus.ONGOING ? "default" : "secondary"
                }
                className="text-base capitalize px-4 py-2"
              >
                {trip.status.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Route Info */}
            <section className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <RouteIcon className="w-7 h-7 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-lg">Route Details</h3>
                  <p>{trip.route.code}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <BiTrip className="w-7 h-7 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Trip Type</h3>
                  <p className="capitalize">{trip.type.toLowerCase()}</p>
                </div>
              </div>
            </section>
            {/* Vehicle Section */}
            <section className="grid grid-cols-2 gap-4 border-t pt-6 mt-6">
              <div className="flex items-center space-x-4">
                <Car className="w-7 h-7 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-lg">Vehicle Details</h3>
                  <p>
                    {trip.vehicle.model} ({trip.vehicle.registrationNumber})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Truck className="w-7 h-7 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Vehicle Type</h3>
                  <p className="capitalize">
                    {trip.vehicle.type.toLowerCase()}
                  </p>
                </div>
              </div>
            </section>

            {/* Personnel Section */}
            <section className="grid grid-cols-2 gap-4 border-t pt-6 mt-6">
              <div className="flex items-center space-x-4">
                <User className="w-7 h-7 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">Driver</h3>
                  <p>
                    {trip.driver.staffInfo.firstname}{" "}
                    {trip.driver.staffInfo.lastname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {trip.driver.staffInfo.phoneNumber}
                  </p>
                </div>
              </div>
              {trip.vehicleAssistant && (
                <div className="flex items-center space-x-4">
                  <User className="w-7 h-7 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Vehicle Assistant</h3>
                    <p>
                      {trip.vehicleAssistant.staffInfo.firstname}{" "}
                      {trip.vehicleAssistant.staffInfo.lastname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {trip.vehicleAssistant.staffInfo.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Route Section */}
            <section className="grid grid-cols-2 gap-4 border-t pt-6 mt-6">
              <div className="flex items-center space-x-4">
                <MapPin className="w-7 h-7 text-green-600" />
                <div>
                  <h3 className="font-semibold text-lg">Origin</h3>
                  <p>{trip.origin.name}</p>
                  <p className="text-sm text-gray-500">{trip.origin.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-7 h-7 text-red-600" />
                <div>
                  <h3 className="font-semibold text-lg">Destination</h3>
                  <p>{trip.destination.name}</p>
                  <p className="text-sm text-gray-500">
                    {trip.destination.address}
                  </p>
                </div>
              </div>
            </section>
          </CardContent>

          <CardFooter className="bg-gray-50 border-t p-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Calendar className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-medium">
                  Created: {new Date(trip.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <GiPathDistance className="w-6 h-6" />
              <Badge variant="outline" className="capitalize">
                {distance
                  ? `${Math.round(distance / 1000)}km`
                  : "Not Specified"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Navigation className="w-6 h-6" />
              <Badge variant="outline" className="capitalize">
                {trip.returnTrip ? "Downstream Trip" : "Upstream Trip"}
              </Badge>
            </div>
          </CardFooter>
        </Card>
        <Card className="max-sm:h-[400px]">
          <RoutingMap routeStations={tripStations} locations={locations} />
        </Card>
      </div>
    </div>
  );
}
