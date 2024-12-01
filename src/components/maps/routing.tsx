import { Marker, Popup } from "react-leaflet";
import { Hotline } from "react-leaflet-hotline";
import { MapBox } from "@/components/maps/map.tsx";
import { Station } from "@/lib/custom-types.ts";
import { Link } from "@tanstack/react-router";

export function RoutingMap({
  routeStations,
  locations,
}: {
  routeStations: Station[];
  locations?: { lat: number; long: number }[];
}) {
  return (
    <MapBox
      center={[routeStations[0].latitude, routeStations[0].longitude]}
      zoom={7}
    >
      {routeStations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
        >
          <Popup>
            <Link to={`/stations/${station.id}`} target={"_blank"}>
              {station.name} ({station.nickName})
            </Link>
          </Popup>
        </Marker>
      ))}

      {locations && (
        <Hotline
          data={locations}
          getLat={(l: { lat: number; long: number }) => l.lat}
          getLng={(l: { lat: number; long: number }) => l.long}
          getVal={() => 5}
        />
      )}
    </MapBox>
  );
}
