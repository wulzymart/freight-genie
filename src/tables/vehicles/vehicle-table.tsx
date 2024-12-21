import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { DataTable } from "@/components/ui/data-table.tsx";
import { columns } from "./columns.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label.tsx";
import { VehicleCoverage, VehicleType } from "@/lib/custom-types.ts";
import { ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { sortOrder, VehiclesQueryStrings } from "@/lib/query-params.ts";
import _ from "lodash";

export function VehicleTable() {
  const { vehicles: data, count } = useLoaderData({
    from: "/_authenticated/vehicles/",
  });
  const search: VehiclesQueryStrings = useSearch({
    from: "/_authenticated/vehicles/",
  });
  const { stations } = useLoaderData({ from: "/_authenticated" });
  const [coverageOrder, setCoverageOrder] = useState(
    search?.order?.coverage || sortOrder.ASC,
  );
  const [typeOrder, setTypeOrder] = useState(
    search?.order?.type || sortOrder.ASC,
  );
  const [coverage, setCoverage] = useState(search?.coverage || "All");
  const [type, setType] = useState(search?.type || "All");
  const [currentStationId, setCurrentStationId] = useState(
    search?.currentStationId || "All",
  );
  const [registeredToId, setRegisteredToId] = useState(
    search?.registeredToId || "All",
  );
  const navigate = useNavigate();
  const onApply = async () => {
    const queryObject: VehiclesQueryStrings = {
      ...search,
      coverage: coverage === "All" ? undefined : (coverage as VehicleCoverage),
      type: type === "All" ? undefined : (type as VehicleType),
      currentStationId:
        currentStationId === "All" ? undefined : currentStationId,
      registeredToId: registeredToId === "All" ? undefined : registeredToId,
      order: { coverage: coverageOrder, type: typeOrder },
    };
    if (_.isEqual(queryObject, search)) {
      return;
    }
    queryObject.skip = 0;
    queryObject.take = 10;
    await navigate({ to: "/vehicles", search: queryObject });
  };

  async function handlePrev() {
    if (search && search.skip && search.skip > 0) {
      const queryObject: VehiclesQueryStrings = { ...search };
      queryObject.skip = queryObject.skip! - queryObject.take! || 10;
      queryObject.take = 10;
      await navigate({ to: "/vehicles", search: queryObject });
    }
  }

  async function handleNext() {
    if (search && search.skip && search.skip + (search.take || 10) < count) {
      const queryObject: VehiclesQueryStrings = { ...search };
      queryObject.take = 10;
      queryObject.skip = queryObject.skip! + queryObject.take;
      await navigate({ to: "/vehicles", search: queryObject });
    }
  }

  return (
    <div>
      <CardHeader>
        <CardTitle className="mb-8">Vehicles</CardTitle>
        <Card>
          <CardHeader>
            <CardTitle className="font-medium text-base">
              Table control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    <div className="flex gap-2">
                      <Filter /> <p className="font-medium">Filter</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <Label>Coverage</Label>
                      <Select
                        defaultValue={coverage}
                        onValueChange={setCoverage}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Vehicle Coverage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {Object.values(VehicleCoverage).map((coverage) => (
                            <SelectItem key={coverage} value={coverage}>
                              {coverage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Type</Label>
                      <Select defaultValue={type} onValueChange={setType}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Vehicle Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {Object.values(VehicleType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Registered To</Label>
                      <Select
                        defaultValue={registeredToId}
                        onValueChange={setRegisteredToId}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Station" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {stations.map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name} ({station.nickName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Current/Last Station</Label>
                      <Select
                        defaultValue={currentStationId}
                        onValueChange={setCurrentStationId}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Station" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {stations.map((station) => (
                            <SelectItem key={station.id} value={station.id}>
                              {station.name} ({station.nickName})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    <div className="flex gap-2 items-center">
                      <ArrowUpDown className="ml-2 h-4 w-4" />{" "}
                      <p className="font-medium">Sort</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-flow-col gap-4">
                    <div className="space-y-4">
                      <Label>Coverage</Label>
                      <Select
                        defaultValue={coverageOrder}
                        onValueChange={(value) =>
                          setCoverageOrder(value as sortOrder)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Route Coverage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={sortOrder.ASC}>
                            Ascending
                          </SelectItem>
                          <SelectItem value={sortOrder.DESC}>
                            Descending
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Type</Label>
                      <Select
                        defaultValue={typeOrder}
                        onValueChange={(value) =>
                          setTypeOrder(value as sortOrder)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Route Coverage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={sortOrder.ASC}>
                            Ascending
                          </SelectItem>
                          <SelectItem value={sortOrder.DESC}>
                            Descending
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={onApply}>Apply</Button>
          </CardFooter>
        </Card>
      </CardHeader>
      <DataTable columns={columns} data={data} />
      <CardFooter>
        <div className="w-full flex items-center justify-center space-x-2 pt-8">
          <Button
            variant="outline"
            onClick={() => handlePrev()}
            disabled={!(search && search.skip && search.skip > 0)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={
              !(
                search &&
                search.skip &&
                search.skip + (search.take || 10) < count
              )
            }
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </div>
  );
}
