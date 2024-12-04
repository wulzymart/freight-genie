import { Train } from "lucide-react";
import { Station } from "@/lib/custom-types.ts";
import React from "react";

const TripStations = ({
  stations,
  currentStationId,
  nextStationId,
}: {
  stations: Station[];
  currentStationId?: string;
  nextStationId?: string;
}) => {
  return (
    <div className="w-full mx-auto p-4">
      <div className="flex items-center justify-between relative">
        {stations.map((station, index) => {
          // Determine station state
          const isCurrentStation = station.id === currentStationId;
          const isNextStation = station.id === nextStationId;
          const isTraversed =
            stations.findIndex((s) => s.id === station.id) <
            stations.findIndex((s) => s.id === currentStationId);

          return (
            <React.Fragment key={station.id}>
              {/* Station marker */}
              <div className="relative flex flex-col items-center z-10">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center 
                    ${
                      isCurrentStation
                        ? "border-4 border-green-500 bg-white"
                        : isNextStation
                          ? "border-4 border-red-500 bg-white"
                          : isTraversed
                            ? "bg-blue-200"
                            : "bg-gray-200"
                    }
                    mb-2 z-10
                  `}
                >
                  <Train
                    className={`
                      w-6 h-6 
                      ${
                        isCurrentStation
                          ? "text-green-500"
                          : isNextStation
                            ? "text-red-500"
                            : isTraversed
                              ? "text-blue-500"
                              : "text-gray-500"
                      }
                    `}
                  />
                </div>

                {/* Station info */}
                <div className="text-center">
                  <h3
                    className={`
                      text-lg font-semibold 
                      ${
                        isCurrentStation
                          ? "text-green-600"
                          : isNextStation
                            ? "text-red-600"
                            : isTraversed
                              ? "text-blue-700"
                              : "text-gray-700"
                      }
                    `}
                  >
                    {station.name}
                  </h3>
                  <p
                    className={`
                      text-sm 
                      ${
                        isCurrentStation
                          ? "text-green-500"
                          : isNextStation
                            ? "text-red-500"
                            : isTraversed
                              ? "text-blue-500"
                              : "text-gray-500"
                      }
                    `}
                  >
                    {station.nickName}
                  </p>
                </div>
              </div>

              {/* Conditional connection line between stations */}
              {index < stations.length - 1 && (
                <div className="flex-grow relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-300">
                    <div
                      className="h-full"
                      style={{
                        width: isTraversed
                          ? "100%"
                          : isCurrentStation &&
                              stations[index + 1].id === nextStationId
                            ? "100%"
                            : "0%",
                        backgroundColor: isTraversed
                          ? "rgb(96 165 250)" // blue
                          : isCurrentStation &&
                              stations[index + 1].id === nextStationId
                            ? "rgb(220 38 38 )" // pink
                            : "rgb(209 213 219)", // gray
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default TripStations;
