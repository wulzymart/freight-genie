import { Route, Station, Trip, TripCoverage } from "@/lib/custom-types.ts";
import { useLoaderData } from "@tanstack/react-router";
import { getAvailableTrips } from "@/lib/utils.ts";
export function getTripParams(
  trip: Trip,
  routes: Route[],
  stations: Station[],
) {
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
    : [trip.originId];
  const currentStationIndex = trip.currentStationId
    ? stationIds.findIndex((id) => id === trip.currentStationId)
    : undefined;
  const nextStationIndex = trip.nextStationId
    ? stationIds.findIndex((id) => id === trip.nextStationId)
    : undefined;

  return {
    originIndex,
    destinationIndex,
    stationIds: tripStationIds,
    stations,
    currentStationIndex,
    nextStationIndex,
  };
}
export function getTripStationIds(
  trip: Trip,
  routes: Route[],
  stations: Station[],
) {
  const { destinationIndex, stationIds } = getTripParams(
    trip,
    routes,
    stations,
  );
  if (!destinationIndex) return [trip.originId];
  return stationIds;
}
export function GetTripStations(trip: Trip) {
  const { routes, stations } = useLoaderData({ from: "/_authenticated" });
  const { stationIds } = getTripParams(trip, routes, stations);
  return stationIds.map((id) => stations.find((station) => station.id === id)!);
}
export function GetTripRemainingStationIds(
  trip: Trip,
  stations: Station[],
  routes: Route[],
  stationId: string,
) {
  const {
    destinationIndex,
    stationIds,
    currentStationIndex,
    nextStationIndex,
  } = getTripParams(trip, routes, stations);

  if (!destinationIndex) return stationIds;

  const indexOfStationId = stationId
    ? stationIds.findIndex((id) => id === stationId)
    : undefined;
  const availableIndex = currentStationIndex || nextStationIndex;

  if (indexOfStationId) {
    if (indexOfStationId <= availableIndex!) {
      return stationIds
        .slice(availableIndex)
        .map((id) => stations.find((station) => station.id === id)!);
    } else
      return stationIds
        .slice(indexOfStationId)
        .map((id) => stations.find((station) => station.id === id)!);
  }

  return stationIds.slice(availableIndex);
}
export function GetTripRemainingStations(
  trip: Trip,
  stations: Station[],
  routes: Route[],
  stationId: string,
) {
  const stationIds = GetTripRemainingStationIds(
    trip,
    stations,
    routes,
    stationId,
  );
  return stationIds.map((id) => stations.find((station) => station.id === id)!);
}

export function GetAvailableTrips(
  trips: Trip[],
  routes: Route[],
  originId?: string,
  coverage?: TripCoverage,
) {
  const found = getAvailableTrips(trips, routes, coverage, originId);
  return found;
}
