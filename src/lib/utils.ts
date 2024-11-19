import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  RouteCoverage,
  RouteInterface,
  RouteType,
  State,
  Station,
} from "./custom-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  padder: string = "0"
) {
  number = String(number);
  return number.padStart(desiredlength, padder);
}

export function routeCodeGen(
  routes: RouteInterface[],
  coverage: RouteCoverage,
  type: RouteType,
  originCode: string,
  destinationCode: string | null = null
) {
  const prefix = `${originCode}${destinationCode ? `-${destinationCode}` : `-${coverage === RouteCoverage.INTRASTATE ? "S" : "L"}`}-${type === RouteType.REGULAR ? "R" : "E"}-`;
  const codeNumbers = routes
    .filter((route) => route.code.startsWith(prefix))
    .map((route) => route.code.split("-").pop())
    .sort(comparePlain);

  const lastNum = parseInt(codeNumbers.pop() || "0");
  const suffix = leftFillNumber(lastNum + 1);
  return `${prefix}${suffix}`;
}

export function stationNameCodeGen(
  motherStation?: Station,
  state?: State,
  stations: Station[] = []
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
  stations: Station[] = []
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
