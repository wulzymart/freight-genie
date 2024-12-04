import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Route,
  RouteCoverage,
  RouteType,
  State,
  Station,
  Trip,
  TripCoverage,
  TripType,
} from "./custom-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function codeGen(length: number): string {
  /**
   * Generates an alphanumeric code of the specified length.
   *
   * @param length The length of the code to generate.
   * @returns The generated alphanumeric code.
   */
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export function compare(a: any, b: any) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export function comparePlain(a: any, b: any) {
  return a < b ? -1 : b > a ? 1 : 0;
}

export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function leftFillNumber(
  number: string | number,
  desiredlength: number = 3,
  padder: string = "0",
) {
  number = String(number);
  return number.padStart(desiredlength, padder);
}

export function routeTripCodeGen(
  coverage: RouteCoverage | TripCoverage,
  type: RouteType | TripType,
  originCode: string,
  destinationCode: string | null = null,
  routesOrTrips?: Route[],
) {
  const prefix = `${originCode}${destinationCode ? `-${destinationCode}` : `-${[RouteCoverage.INTRASTATE, TripCoverage.INTRASTATE].includes(coverage) ? "S" : "L"}`}-${type === RouteType.REGULAR ? "R" : "E"}-`;
  const codeNumbers = routesOrTrips
    ? routesOrTrips
        .filter((route) => route.code.startsWith(prefix))
        .map((route) => route.code.split("-").pop())
        .sort(comparePlain)
    : undefined;

  const lastNum = codeNumbers ? parseInt(codeNumbers.pop() || "0") : undefined;
  const suffix = lastNum ? leftFillNumber(lastNum + 1) : codeGen(6);
  return `${prefix}${suffix}`;
}
export function shipmentCodeGen(
  originCode: string,
  destinationCode: string | null = null,
) {
  const prefix = `${originCode}${destinationCode ? `-${destinationCode}` : ""}-`;

  const suffix = codeGen(8);
  return `${prefix}${suffix}`;
}

export function stationNameCodeGen(
  motherStation?: Station,
  state?: State,
  stations: Station[] = [],
) {
  const codePrefix = motherStation
    ? `${motherStation?.code}-S-`
    : `${state?.code}-`;
  const namePrefix = motherStation
    ? `${motherStation?.name}-S-`
    : `${state?.name}-`;
  const availableStations = motherStation
    ? motherStation.localStations
    : stations;
  const codeNumbers = availableStations
    .map((station) => station.code.split("-").pop())
    .sort(comparePlain);
  const lastNum = parseInt(codeNumbers.pop() || "0");
  const codeSuffix = leftFillNumber(lastNum + 1);
  return {
    code: `${codePrefix}${codeSuffix}`,
    name: `${namePrefix}${lastNum + 1}`,
  };
}

export function stationNameGen(
  motherStation?: Station,
  state?: State,
  stations: Station[] = [],
) {
  const prefix = motherStation
    ? `${motherStation?.name}-S-`
    : `${state?.name}-`;
  const count = motherStation
    ? motherStation.localStations.length
    : stations.length;

  const suffix = leftFillNumber(count + 1, 0);
  return `${prefix}${suffix}`;
}

export const validatePinElementGen = (id: string) => {
  (document.getElementById(id) as HTMLDialogElement)?.click();
};

export function getAvailableTrips(
  trips: Trip[],
  routes: Route[],
  coverage?: TripCoverage,
  stationId?: string,
) {
  const tripsWithStationIds = trips.map((trip) => {
    const route = routes.find((route) => route.id === trip.route.id)!;
    const stationIds = trip.returnTrip
      ? route.stationIds.reverse()
      : route.stationIds;
    const originIndex = stationIds.findIndex((id) => id === trip.origin.id);
    const destinationIndex = trip.destination.id
      ? stationIds.findIndex((id) => id === trip.destination.id)
      : undefined;
    const tripStationIds = destinationIndex
      ? stationIds.slice(originIndex, destinationIndex + 1)
      : [trip.origin.id];
    return { ...trip, stationIds: tripStationIds };
  });
  const allowedTrips = tripsWithStationIds
    .filter((trip) => {
      const indexOfStationId = trip.stationIds.findIndex(
        (id) => id === stationId,
      );
      return indexOfStationId !== -1;
    })
    .filter((trip) => {
      if (coverage) {
        return trip.coverage === coverage;
      }
      return true;
    });
  return allowedTrips.filter((trip) => {
    if (coverage === TripCoverage.LASTMAN) return true;
    if (!trip.currentStationId && !trip.nextStationId) return false;
    const currentStationIndex = trip.currentStationId
      ? trip.stationIds.findIndex((id) => id === trip.currentStationId)
      : undefined;
    const nextStationIndex = trip.nextStationId
      ? trip.stationIds.findIndex((id) => id === trip.nextStationId)
      : undefined;
    const neededIndex =
      currentStationIndex !== -1 ? currentStationIndex : nextStationIndex;
    const indexOfStationId = trip.stationIds.findIndex(
      (id) => id === stationId,
    );

    return indexOfStationId >= neededIndex!;
  });
}
