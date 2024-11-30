import { createFileRoute } from "@tanstack/react-router";
import {
  ApiResponseType,
  Route as RouteType,
  StaffRole,
} from "@/lib/custom-types.ts";
import { CustomErrorComponent } from "@/components/error-component.tsx";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { RoutesQuerySchema } from "@/lib/zodSchemas.ts";
import { axiosInstance } from "@/lib/axios.ts";
import qs from "qs";
import { RouteTable } from "@/tables/routes/route-table.tsx";

const allowed = [
  StaffRole.DIRECTOR,
  StaffRole.MANAGER,
  StaffRole.REGION_MANAGER,
];
export const Route = createFileRoute("/_authenticated/routes/")({
  component: RouteTable,
  beforeLoad: async ({ context }) => {
    // await axiosInstance.get('/vendor/routes/update')
    const { user } = context.auth;
    if (!allowed.includes(user.staff.role))
      throw new Error("You are not authorized to access this page");
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    const searchQueryString =
      !search || Object.keys(search).length === 0
        ? ""
        : qs.stringify(search, {});
    console.log("search query", searchQueryString);
    const { data }: { data: ApiResponseType } = await axiosInstance.get(
      "/vendor/routes?" + searchQueryString,
    );
    if (!data.success) throw new Error(data.message);
    const { routes, count } = data;
    return { routes, count } as { routes: RouteType[]; count: number };
  },
  errorComponent: ({ error }) => {
    return <CustomErrorComponent errorMessage={error.message} />;
  },
  validateSearch: zodSearchValidator(RoutesQuerySchema),
});
