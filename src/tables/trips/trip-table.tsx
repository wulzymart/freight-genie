import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { DataTable } from "@/components/ui/data-table.tsx";
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
import { TripCoverage, TripStatus, TripType } from "@/lib/custom-types.ts";
import { ArrowUpDown, Check, ChevronsUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { sortOrder, TripsQueryStrings } from "@/lib/query-params.tsx";
import _ from "lodash";
import { columns } from "@/tables/trips/columns.tsx";
import { DateRangePicker } from "@/components/date-range-picker.tsx";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import { cn } from "@/lib/utils.ts";

export function TripTable() {
  const { trips: data, count } = useLoaderData({
    from: "/_authenticated/trips/",
  });
  const { routes } = useLoaderData({
    from: "/_authenticated",
  });
  const search: TripsQueryStrings = useSearch({
    from: "/_authenticated/trips/",
  });
  const [coverageOrder, setCoverageOrder] = useState(
    search?.order?.coverage || sortOrder.ASC,
  );
  const [typeOrder, setTypeOrder] = useState(
    search?.order?.type || sortOrder.ASC,
  );
  const [codeOrder, setCodeOrder] = useState(
    search?.order?.code || sortOrder.ASC,
  );
  const [coverage, setCoverage] = useState(search?.coverage || "All");
  const [type, setType] = useState(search?.type || "All");
  const [status, setStatus] = useState(search?.status || "All");
  const [dateRange, setDateRange] = useState<DateRange>({
    to: search.to ? new Date(search.to) : undefined,
    from: search.from ? new Date(search.from) : undefined,
  });
  const [openPopover, setOpenPopover] = useState(false);
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const onApply = async () => {
    const queryObject: TripsQueryStrings = {
      ...search,
      coverage: coverage === "All" ? undefined : (coverage as TripCoverage),
      type: type === "All" ? undefined : (type as TripType),
      status: status === "All" ? undefined : (status as TripStatus),
      order: { coverage: coverageOrder, type: typeOrder, code: codeOrder },
      from: dateRange.from ? dateRange.from.toLocaleDateString() : undefined,
      to: dateRange.to ? dateRange.to.toLocaleDateString() : undefined,
      routeId: routeId,
    };

    if (_.isEqual(queryObject, search)) {
      return;
    }
    queryObject.skip = 0;
    queryObject.take = 10;
    await navigate({ to: "/trips", search: queryObject });
  };
  async function handlePrev() {
    if (search && search.skip && search.skip > 0) {
      const queryObject: TripsQueryStrings = { ...search };
      queryObject.skip = queryObject.skip! - queryObject.take! || 10;
      queryObject.take = 10;
      await navigate({ to: "/trips", search: queryObject });
    }
  }
  async function handleNext() {
    if (search && search.skip && search.skip + (search.take || 10) < count) {
      const queryObject: TripsQueryStrings = { ...search };
      queryObject.take = 10;
      queryObject.skip = queryObject.skip! + queryObject.take;
      await navigate({ to: "/trips", search: queryObject });
    }
  }
  return (
    <div>
      <CardHeader>
        <CardTitle className="mb-8">Available Trips</CardTitle>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="space-y-4">
                      <Label>Coverage</Label>
                      <Select
                        defaultValue={coverage}
                        onValueChange={setCoverage}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Route Coverage" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="space-y-4">
                            <Label>Type</Label>
                            <Select defaultValue={type} onValueChange={setType}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Route Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                {Object.values(TripType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <SelectItem value="All">All</SelectItem>
                          {Object.values(TripCoverage).map((coverage) => (
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
                          <SelectValue placeholder="Route Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {Object.values(TripType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label>Status</Label>
                      <Select defaultValue={type} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Trip Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {Object.values(TripStatus).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 col-span-2 w-full">
                      <Label>Date Created</Label>
                      <DateRangePicker
                        value={dateRange}
                        setDate={setDateRange}
                      />
                    </div>
                    <div className="space-y-4 flex flex-col">
                      <Label>Route</Label>
                      <Popover open={openPopover} onOpenChange={setOpenPopover}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPopover}
                            className="w-[200px] justify-between"
                          >
                            {routeId
                              ? routes.find((route) => route.id === +routeId)
                                  ?.code
                              : "Select Route..."}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Routes..." />
                            <CommandList>
                              <CommandEmpty>No Route Found.</CommandEmpty>
                              <CommandGroup>
                                {routes.map((route) => (
                                  <CommandItem
                                    key={route.id}
                                    value={route.id as any}
                                    onSelect={(currentValue) => {
                                      const selectedId = routes.find(
                                        (route) => route.code === currentValue,
                                      )!.id;
                                      setRouteId(
                                        selectedId === routeId
                                          ? undefined
                                          : selectedId,
                                      );
                                      setOpenPopover(false);
                                    }}
                                  >
                                    {route.code}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        routeId === route.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                      <Label>Code</Label>
                      <Select
                        defaultValue={codeOrder}
                        onValueChange={(value) =>
                          setCodeOrder(value as sortOrder)
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
