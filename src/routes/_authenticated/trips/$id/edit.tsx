import { createFileRoute } from "@tanstack/react-router";
import { StaffRole } from "@/lib/custom-types.ts";

export const Route = createFileRoute("/_authenticated/trips/$id/edit")({
  component: () => <div>Hello /_authenticated/trips/$id/edit!</div>,
  beforeLoad: ({ context: { auth } }) => {
    const { role } = auth;
    if ([StaffRole.DIRECTOR, StaffRole.REGION_MANAGER].includes(role!))
      throw new Error("Unauthorised access");
  },
});
