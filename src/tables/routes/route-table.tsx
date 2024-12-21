import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { DataTable } from "@/components/ui/data-table.tsx";
import { columns } from "@/tables/routes/columns.tsx";
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
import { RouteCoverage, RouteType } from "@/lib/custom-types.ts";
import { ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { RoutesQueryStrings, sortOrder } from "@/lib/query-params.ts";
import _ from "lodash";

export function RouteTable() {
  const { routes: data, count } = useLoaderData({
    from: "/_authenticated/routes/",
  });
  const search: RoutesQueryStrings = useSearch({
    from: "/_authenticated/routes/",
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
  const navigate = useNavigate();
  const onApply = async () => {
    const queryObject: RoutesQueryStrings = {
      ...search,
      coverage: coverage === "All" ? undefined : (coverage as RouteCoverage),
      type: type === "All" ? undefined : (type as RouteType),
      order: { coverage: coverageOrder, type: typeOrder, code: codeOrder },
    };
    console.log(JSON.stringify(queryObject), JSON.stringify(search || {}));
    if (_.isEqual(queryObject, search)) {
      return;
    }
    queryObject.skip = 0;
    queryObject.take = 10;
    await navigate({ to: "/routes", search: queryObject });
  };
  async function handlePrev() {
    if (search && search.skip && search.skip > 0) {
      const queryObject: RoutesQueryStrings = { ...search };
      queryObject.skip = queryObject.skip! - queryObject.take! || 10;
      queryObject.take = 10;
      await navigate({ to: "/routes", search: queryObject });
    }
  }
  async function handleNext() {
    if (search && search.skip && search.skip + (search.take || 10) < count) {
      const queryObject: RoutesQueryStrings = { ...search };
      queryObject.take = 10;
      queryObject.skip = queryObject.skip! + queryObject.take;
      await navigate({ to: "/routes", search: queryObject });
    }
  }
  return (
    <div>
      <CardHeader>
        <CardTitle className="mb-8">Available Routes</CardTitle>
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
                  <div className="grid grid-cols-1 lg:grid-flow-col gap-4">
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
                          <SelectItem value="All">All</SelectItem>
                          {Object.values(RouteCoverage).map((coverage) => (
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
                          {Object.values(RouteType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
