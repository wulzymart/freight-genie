import {
  OperationEnum,
  RouteCoverage,
  RouteType,
  ShipmentCoverage,
  ShipmentStatus,
  ShipmentType,
  TripCoverage,
  TripPersonnelStatus,
  TripStatus,
  TripType,
  VehicleCoverage,
  VehicleStatus,
  VehicleType,
} from "@/lib/custom-types.ts";

export enum sortOrder {
  ASC = "ASC",
  DESC = "DESC",
  asc = "asc",
  desc = "desc",
}

export type RoutesQueryStrings = {
  coverage?: RouteCoverage;
  type?: RouteType;
  order?: { type?: sortOrder; coverage?: sortOrder; code?: sortOrder };
  take?: number;
  skip?: number;
};
export type TripsQueryStrings = {
  coverage?: TripCoverage;
  type?: TripType;
  status?: TripStatus;
  routeId?: number;
  from?: string;
  to?: string;
  order?: { type?: sortOrder; coverage?: sortOrder; code?: sortOrder };
  take?: number;
  skip?: number;
};
export type ShipmentsQueryStrings = {
  coverage?: ShipmentCoverage;
  type?: ShipmentType;
  status?: ShipmentStatus;
  routeId?: number;
  tripId?: string;
  from?: string;
  to?: string;
  order?: { type?: sortOrder; coverage?: sortOrder; code?: sortOrder };
  take?: number;
  skip?: number;
};

export type VehiclesQueryStrings = {
  type?: VehicleType;
  coverage?: VehicleCoverage;
  currentStationId?: string;
  registeredToId?: string;
  currentRouteId?: number;
  status?: VehicleStatus;
  order?: { type?: sortOrder; coverage?: sortOrder };
  take?: number;
  skip?: number;
};
export type TripPersonnelQueryStrings = {
  type: "driver" | "assistant";
  operation?: OperationEnum;
  routeCoverage?: RouteCoverage;
  currentStationId?: string;
  registeredInId?: string;
  registeredRouteId?: number;
  routeType?: RouteType;
  status?: TripPersonnelStatus;
  order?: {
    type?: sortOrder;
    routeCoverage?: sortOrder;
    routeType?: sortOrder;
    operation?: sortOrder;
    status?: sortOrder;
  };
  take?: number;
  skip?: number;
};
