import {
  RouteCoverage,
  RouteType,
  VehicleCoverage,
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
export type VehiclesQueryStrings = {
  type?: VehicleType;
  coverage?: VehicleCoverage;
  currentStationId?: string;
  registeredToId?: string;
  order?: { type?: sortOrder; coverage?: sortOrder };
  take?: number;
  skip?: number;
};
