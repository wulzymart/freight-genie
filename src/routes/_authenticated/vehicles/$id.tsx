import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bike, Bus, Car, MapPin, Truck } from "lucide-react";
import { FaBicycle, FaShuttleVan } from "react-icons/fa";
import { VehicleType } from "@/lib/custom-types.ts";
import { GiScooter } from "react-icons/gi";
import { MdElectricRickshaw } from "react-icons/md";
import { capitalize } from "lodash";
import { getVehicle } from "@/lib/queries/vehicle.ts";

export const Route = createFileRoute("/_authenticated/vehicles/$id")({
  component: VehicleDetails,
  loader: async ({ params: { id }, context: { queryClient } }) => {
    return await queryClient.ensureQueryData(getVehicle(id));
  },
});

// Helper function to get vehicle type icon
const getVehicleTypeIcon = (type: VehicleType) => {
  switch (type) {
    case VehicleType.TRUCK:
      return <Truck className="w-6 h-6 text-gray-600" />;
    case VehicleType.BUS:
      return <Bus className="w-6 h-6 text-gray-600" />;
    case VehicleType.CAR:
      return <Car className="w-6 h-6 text-gray-600" />;
    case VehicleType.VAN:
      return <FaShuttleVan className="w-6 h-6 text-gray-600" />;
    case VehicleType.BICYCLE:
      return <FaBicycle className="w-6 h-6 text-gray-600" />;
    case VehicleType.SCOOTER:
      return <GiScooter className="w-6 h-6 text-gray-600" />;
    case VehicleType.MOTORCYCLE:
      return <Bike className="w-6 h-6 text-gray-600" />;
    case VehicleType.TRICYCLE:
      return <MdElectricRickshaw className="w-6 h-6 text-gray-600" />;

    default:
      return <Truck className="w-6 h-6 text-gray-600" />;
  }
};

// Custom Table Row Component
const InfoRow = ({
  label,
  value,
  valueComponent,
}: {
  label: string;
  value?: string;
  valueComponent?: React.ReactNode;
}) => (
  <div className="flex justify-between border-b py-2 last:border-b-0">
    <span className="font-medium text-gray-700">{label}</span>
    <span className="text-gray-500">{valueComponent || value}</span>
  </div>
);

// Vehicle Details Component
function VehicleDetails() {
  const vehicle = Route.useLoaderData();

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center space-x-4">
          {getVehicleTypeIcon(vehicle.type)}
          <div>
            <CardTitle>{vehicle.model}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Reg. No: {vehicle.registrationNumber}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vehicle Information Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Details</h3>
              <div className="border rounded-lg p-4">
                <InfoRow
                  label="Status"
                  valueComponent={
                    <Badge className="text-sm" variant="outline">
                      {capitalize(vehicle.status)}
                    </Badge>
                  }
                />
                <InfoRow
                  label="Type"
                  valueComponent={
                    <Badge className="text-sm" variant="outline">
                      {capitalize(vehicle.type)}
                    </Badge>
                  }
                />
                <InfoRow
                  label="Coverage"
                  valueComponent={
                    <Badge className="text-sm" variant="outline">
                      {vehicle.coverage.toUpperCase()}
                    </Badge>
                  }
                />
              </div>
            </div>

            {/* Station Information Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Station Information</h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Registered To</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.registeredTo.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Current Station</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.currentStation?.name || "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Route and Trip Information */}
          {(vehicle.currentRoute || vehicle.currentTrip) && (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {vehicle.currentRoute && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Current Route</h3>
                  <div className="border rounded-lg p-4">
                    <InfoRow label="Name" value={vehicle.currentRoute.code} />
                    <InfoRow label="Start" value={vehicle.currentRoute.type} />
                  </div>
                </div>
              )}

              {vehicle.currentTrip && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Current Trip</h3>
                  <div className="border rounded-lg p-4">
                    <InfoRow
                      label="Trip Type"
                      value={vehicle.currentTrip.type}
                    />
                    <InfoRow
                      label="Status"
                      valueComponent={
                        <Badge variant="outline">
                          {vehicle.currentTrip.status}
                        </Badge>
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
