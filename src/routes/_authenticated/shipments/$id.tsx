import { createFileRoute } from "@tanstack/react-router";
import { getShipment } from "@/lib/queries/shipments.ts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Truck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { CardContent } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table.tsx";

export const Route = createFileRoute("/_authenticated/shipments/$id")({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    return await queryClient.ensureQueryData(getShipment(id));
  },
  component: ShipmentPage,
});

function ShipmentPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const shipment = Route.useLoaderData();
  console.log(shipment);
  return (
    <div>
      <div className="container mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center space-x-3">
              <Truck className="w-6 h-6 text-blue-600" />
              <span>Shipment Details</span>
              <Badge variant="outline" className="ml-4">
                {shipment.status}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {/* Shipment Overview */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Origin
                </h3>
                <p>{shipment.origin.name}</p>
                <p>{shipment.origin.state.name}</p>
                <p className="text-gray-600">{shipment.origin.address}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  Destination
                </h3>
                <p>{shipment.destination?.name}</p>
                <p>{shipment.destination?.state.name}</p>
                <p className="text-gray-600">{shipment.destination?.address}</p>
                <p>{!shipment.destination && "Last-man Delivery"}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Trip and Vehicle Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-blue-600" />
                  Trip Details
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Trip Code</TableCell>
                      <TableCell>{shipment.trip?.code}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Vehicle</TableCell>
                      <TableCell>
                        {shipment.trip?.vehicle.model} (
                        {shipment.trip?.vehicle.registrationNumber})
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Crew
                </h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Driver</TableCell>
                      <TableCell>
                        {shipment.trip?.driver.staffInfo.firstname}{" "}
                        {shipment.trip?.driver.staffInfo.lastname}
                        <div className="text-xs text-gray-500">
                          {shipment.trip?.driver.staffInfo.phoneNumber}
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Vehicle Assistant
                      </TableCell>
                      <TableCell>
                        {shipment.trip?.vehicleAssistant?.staffInfo.firstname}{" "}
                        {shipment.trip?.vehicleAssistant?.staffInfo.lastname}
                        <div className="text-xs text-gray-500">
                          {
                            shipment.trip?.vehicleAssistant?.staffInfo
                              .phoneNumber
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Shipment Metadata */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-600" />
                Shipment Metadata
              </h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Shipment Code</TableCell>
                    <TableCell>{shipment.code}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type</TableCell>
                    <TableCell>{shipment.type}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Coverage</TableCell>
                    <TableCell>{shipment.coverage}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created At</TableCell>
                    <TableCell>
                      {formatDate(shipment.createdAt as unknown as string)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4" />

            {/* Tracking History */}
            {/*<div>*/}
            {/*  <h3 className="text-lg font-semibold mb-2 flex items-center">*/}
            {/*    <Info className="w-5 h-5 mr-2 text-teal-600" />*/}
            {/*    Tracking History*/}
            {/*  </h3>*/}
            {/*  <div className="space-y-2">*/}
            {/*    {shipment.tracking.map((track, index) => (*/}
            {/*      <div*/}
            {/*        key={index}*/}
            {/*        className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md"*/}
            {/*      >*/}
            {/*        <div className="flex-grow">*/}
            {/*          <p className="font-medium">{track.info}</p>*/}
            {/*          <p className="text-sm text-gray-500">*/}
            {/*            {formatDate(track.date)}*/}
            {/*          </p>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    ))}*/}
            {/*  </div>*/}
            {/*</div>*/}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
