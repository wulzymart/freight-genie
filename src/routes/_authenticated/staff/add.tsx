import { createFileRoute, Link } from "@tanstack/react-router";
import * as z from "zod";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";

import {
  officeStaffSchema,
  staffFormSchema,
  tripStaffSchema,
  userFormSchema,
} from "@/lib/zodSchemas";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StaffRole } from "@/lib/custom-types";
import TitleCard from "@/components/page-components/title";
import { getRoutes } from "@/lib/queries/routes";
import { CustomErrorComponent } from "@/components/error-component.tsx";
import { StaffForm } from "@/forms/staff/main.tsx";
import { OfficePersonnelForm } from "@/forms/staff/office-personnel.tsx";
import { FieldPersonnelForm } from "@/forms/staff/field-personnel.tsx";

const StaffAddSearchSchema = z.object({
  page: z.optional(z.enum(["office", "field"])),
  user: z.optional(userFormSchema),
  staff: z.optional(staffFormSchema),
  office: z.optional(officeStaffSchema),
  field: z.optional(tripStaffSchema),
});
export const officeRoles = [StaffRole.MANAGER, StaffRole.STATION_OFFICER];

export const Route = createFileRoute("/_authenticated/staff/add")({
  beforeLoad: ({ context }) => {
    const { user } = context.auth;
    if (user.staff.role !== StaffRole.DIRECTOR)
      throw new Error("You are not authorized to access this page");
  },
  errorComponent: ({ error }) => {
    return <CustomErrorComponent errorMessage={error.message} />;
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getRoutes);
  },
  validateSearch: zodSearchValidator(StaffAddSearchSchema),
  component: () => (
    <main className="grid gap-8">
      <TitleCard
        title="Add New Staff"
        description="Provide details of the new staff to add"
      />
      <Page />
    </main>
  ),
});
const Page = () => {
  const { page, user, staff } = Route.useSearch();
  if (!page) return <StaffForm user={user} staff={staff} />;
  if (page === "office" && staff && user)
    return <OfficePersonnelForm staff={staff} user={user} />;
  if (page === "field" && staff && user)
    return <FieldPersonnelForm staff={staff} user={user} />;
  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <p>You have made an invalid navigation</p>
      </CardContent>
      <CardFooter className="flex justify-center gap-10">
        <Link to="/" type="button">
          Home
        </Link>
        <Link to="/staff/add" type="button">
          Add Staff
        </Link>
      </CardFooter>
    </Card>
  );
};
