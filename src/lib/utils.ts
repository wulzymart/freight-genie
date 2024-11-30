import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Route,
  RouteCoverage,
  RouteType,
  State,
  Station,
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
