import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Car,
  User,
  MapPin,
  Calendar,
  Route as RouteIcon,
  Truck,
  Navigation,
} from "lucide-react";
import { getTrip } from "@/lib/queries/trips.ts";
import { TripStatus } from "@/lib/custom-types.ts";

export const Route = createFileRoute("/_authenticated/trips/$id")({
  component: SingleTripPage,
  loader: async ({ params: { id }, context: { queryClient } }) => {
    return await queryClient.ensureQueryData(getTrip(id));
  },
});

function SingleTripPage() {
  const trip = Route.useLoaderData();
  return (
    <div className="px-4 py-8">
      <Card className="w-full shadow-2xl">
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
          {/* Vehicle Section */}
          <section className="grid grid-cols-2 gap-4">
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
                <h3 className="font-semibold text-lg">Trip Type</h3>
                <p className="capitalize">{trip.type.toLowerCase()}</p>
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

          {/* Additional Route Info */}
          <section className="border-t pt-6 mt-6">
            <div className="flex items-center space-x-4">
              <RouteIcon className="w-7 h-7 text-purple-600" />
              <div>
                <h3 className="font-semibold text-lg">Route Details</h3>
                <p>{trip.route.code}</p>
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
            <Navigation className="w-6 h-6" />
            <Badge variant="outline" className="capitalize">
              {trip.isReturn ? "Downstream Trip" : "Upstream Trip"}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
