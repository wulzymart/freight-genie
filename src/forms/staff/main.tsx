import * as z from "zod";
import { staffFormSchema, userFormSchema } from "@/lib/zodSchemas.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StaffRole, UserRole } from "@/lib/custom-types.ts";
import { useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import FormInput from "@/components/form-input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { officeRoles, Route } from "@/routes/_authenticated/staff/add.tsx";

export const StaffForm = ({
  user,
  staff,
}: {
  user?: z.infer<typeof userFormSchema>;
  staff?: z.infer<typeof staffFormSchema>;
}) => {
  const {} = Route.useSearch();
  const staffForm = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: staff || {
      firstname: "",
      lastname: "",
      role: StaffRole.STATION_OFFICER,
      phoneNumber: "",
    },
  });
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user || {
      username: "",
      email: "",
      role: UserRole.STAFF,
    },
  });
  const navigate = useNavigate();

  const onSubmit = () => {
    staffForm.handleSubmit(() =>
      userForm.handleSubmit(async () => {
        const user = userForm.getValues();
        const staff = staffForm.getValues();

        await navigate({
          to: "/staff/add",
          search: {
            page: officeRoles.includes(staff.role) ? "office" : "field",
            user,
            staff,
          },
        });
      })(),
    )();
  };
  return (
    <div>
      <Card className="w-full">
        <CardHeader></CardHeader>
        <CardContent className="grid gap-4">
          <Form {...staffForm}>
            <form>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={staffForm.control}
                  type="text"
                  label="First Name"
                  name="firstname"
                  capitalize={true}
                  placeholder="e.g John"
                />
                <FormInput
                  control={staffForm.control}
                  type="text"
                  label="Last Name"
                  name="lastname"
                  capitalize={true}
                  placeholder="e.g Conor"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={staffForm.control}
                  type="text"
                  label="Phone Number"
                  name="phoneNumber"
                  placeholder="e.g +2348123456789"
                />
                <FormField
                  control={staffForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Staff Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(StaffRole)
                              .filter(
                                (role: StaffRole) =>
                                  role !== StaffRole.DIRECTOR,
                              )
                              .map((role: StaffRole) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <Form {...userForm}>
            <form>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  control={userForm.control}
                  type="email"
                  label="Email"
                  name="email"
                  placeholder="e.g user@example.com"
                />
                <FormInput
                  control={userForm.control}
                  type="text"
                  label="Username"
                  name="username"
                  placeholder="e.g Conor"
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button type="button" onClick={onSubmit}>
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
