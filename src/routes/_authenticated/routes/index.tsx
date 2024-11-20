import { createFileRoute } from '@tanstack/react-router'
import {StaffRole} from "@/lib/custom-types.ts";
import {CustomErrorComponent} from "@/components/error-component.tsx";

export const Route = createFileRoute('/_authenticated/routes/')({
  component: () => <div>Hello /_authenticated/routes/!</div>,
  beforeLoad: ({context}) => {
    const {user} = context.auth
    if (user.staff.role !== StaffRole.DIRECTOR && user.staff.role !== StaffRole.MANAGER)  throw new Error("You are not authorized to access this page")
  },
  errorComponent: ({error}) => {
    return <CustomErrorComponent errorMessage={error.message} />;
  }
})
