import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";
import { Button } from "@/components/ui/button";

import {
  officeStaffSchema,
  staffFormSchema,
  tripStaffSchema,
  userFormSchema,
} from "@/lib/zodSchemas";
import FormInput from "@/components/form-input";
import ConfirmPin from "@/components/confirm-pin";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  ApiResponseType,
  OperationEnum,
  RouteCoverage,
  RouteType,
  StaffRole,
  State,
  UserRole,
} from "@/lib/custom-types";
import TitleCard from "@/components/page-components/title";
import { getStations } from "@/lib/queries/stations";
import { getStatesWithLgas } from "@/lib/queries/states";
import { getRoutes } from "@/lib/queries/routes";
import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
const StaffAddSearchSchema = z.object({
  page: z.optional(z.enum(["office", "field"])),
  user: z.optional(userFormSchema),
  staff: z.optional(staffFormSchema),
  office: z.optional(officeStaffSchema),
  field: z.optional(tripStaffSchema),
});
const officeRoles = [StaffRole.MANAGER, StaffRole.STATION_OFFICER];
const validatePin = () => {
  (document.getElementById("staff-reg") as HTMLDialogElement)?.click();
};
export const Route = createFileRoute("/_authenticated/staff/add")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(getStations);
   await  queryClient.ensureQueryData(getStatesWithLgas);
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
    return <OfficePersonelForm staff={staff} user={user} />;
  if (page === "field" && staff && user)
    return <FieldPersonelForm staff={staff} user={user} />;
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
const StaffForm = ({
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
      userForm.handleSubmit(() => {
        const user = userForm.getValues();
        const staff = staffForm.getValues();

        navigate({
          to: "/staff/add",
          search: {
            page: officeRoles.includes(staff.role) ? "office" : "field",
            user,
            staff,
          },
        });
      })()
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
                            {Object.values(StaffRole).map((role: StaffRole) => (
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

const OfficePersonelForm = ({
  user,
  staff,
}: {
  user: z.infer<typeof userFormSchema>;
  staff: z.infer<typeof staffFormSchema>;
}) => {
  const {
    data: statesLGAs,
    isLoading: statesLGAsLoading,
    isError: statesLGAsError,
  } = useSuspenseQuery(getStatesWithLgas);
  const {
    data: stations,
    isLoading: stationsLoading,
    isError: stationsError,
  } = useSuspenseQuery(getStations);
  const [state, setState] = useState<State | null>(null);
  const stateStations = stations.filter(
    (station) => station.stateId === state?.id
  );
  const form = useForm<z.infer<typeof officeStaffSchema>>({
    resolver: zodResolver(officeStaffSchema),
    defaultValues: {
      stationId: "",
    },
  });
  const { mutate } = useMutation({
    mutationKey: ["staff"],
    mutationFn: async (values: {
      user: z.infer<typeof userFormSchema>;
      staff: z.infer<typeof staffFormSchema>;
      officePersonnelInfo: z.infer<typeof officeStaffSchema>;
    }) => {
      if (!values) throw Error;
      const { data }: { data: ApiResponseType } = await axiosInstance.post(
        "/vendor/users",
        values
      );
      if (!data.success) throw Error(data.message);
      return data;
    },
  });
  const { toast } = useToast();
  function onSubmit() {
    form.handleSubmit(validatePin)();
  }
  const navigate = useNavigate();
  function submit() {
    mutate(
      { user, staff, officePersonnelInfo: form.getValues() },
      {
        onSuccess: (data) => {
          form.reset();
          toast({
            description: data.message,
          });
          navigate({ to: "/staff/add" });
        },
        onError: (data) => {
          toast({
            description: data.message,
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <FormLabel>State</FormLabel>
              <Select
                onValueChange={(value) => {
                  const state = statesLGAs.find(
                    (state: State) => state.id === +value
                  );
                  setState(state);
                  form.resetField("stationId");
                }}
                disabled={statesLGAsError || statesLGAsLoading}
                // defaultValue={+field.value}
                value={state?.id as unknown as string}
              >
                <SelectTrigger className="">
                  {state ? (
                    <SelectValue
                      placeholder="Select State"
                      className="w-full"
                    />
                  ) : (
                    "Select State"
                  )}
                </SelectTrigger>
                <SelectContent>
                  {statesLGAs.map((state: State) => (
                    <SelectItem
                      key={state.id}
                      value={state.id as unknown as string}
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormField
              control={form.control}
              name="stationId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Staff Station</FormLabel>
                  <FormControl>
                    <Select
                      disabled={!state || stationsLoading || stationsError}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateStations.map((station) => (
                          <SelectItem key={station.id} value={station.id!}>
                            {station.name} ({station.nickName})
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
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-center gap-10">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                navigate({
                  to: "/staff/add",
                  search: {
                    user,
                    staff,
                  },
                });
              }}
            >
              Back
            </Button>
            <Button type="button" onClick={onSubmit}>
              Submit
            </Button>
            <ConfirmPin id="staff-reg" name="Add staff" action={submit} />
          </div>
        </CardFooter>
      </Card>
    </Form>
  );
};

const FieldPersonelForm = ({
  user,
  staff,
}: {
  user: z.infer<typeof userFormSchema>;
  staff: z.infer<typeof staffFormSchema>;
}) => {
  const {
    data: statesLGAs,
    isLoading: statesLGAsLoading,
    isError: statesLGAsError,
  } = useSuspenseQuery(getStatesWithLgas);
  const {
    data: stations,
    isLoading: stationsLoading,
    isError: stationsError,
  } = useSuspenseQuery(getStations);
  const [state, setState] = useState<State | null>(null);
  const stateStations = stations.filter(
    (station) => station.stateId === state?.id
  );
  const {
    data: routes,
    isLoading: routesLoading,
    isError: routesError,
  } = useSuspenseQuery(getRoutes);

  const [coverage, setCoverage] = useState<RouteCoverage>(
    RouteCoverage.INTERSTATE
  );
  const [routeType, setRouteType] = useState<RouteType>(RouteType.REGULAR);
  const possibleRoutes = routes.filter(
    (route) => route.type === routeType && route.coverage === coverage
  );
  const form = useForm<z.infer<typeof tripStaffSchema>>({
    resolver: zodResolver(tripStaffSchema),
    defaultValues: {
      currentStationId: "",
      registeredRouteId: "" as any,
      operation: OperationEnum.INTERSTATION,
    },
  });
  const fieldPersonnel =
    staff.role === StaffRole.DRIVER ? "Driver" : "Assistant";
  const operation = form.watch("operation");
  const selectedRouteId = form.watch("registeredRouteId");
  const { mutate } = useMutation({
    mutationKey: ["staff"],
    mutationFn: async (values: {
      user: z.infer<typeof userFormSchema>;
      staff: z.infer<typeof staffFormSchema>;
      driverInfo?: z.infer<typeof tripStaffSchema>;
      vehicleAssistantInfo?: z.infer<typeof tripStaffSchema>;
    }) => {
      if (!values) throw Error;

      const res = await axiosInstance.post("/vendor/users", values);
      if (!res.data.success) throw Error(res.data.message);
      return res.data;
    },
  });
  const { toast } = useToast();
  function onSubmit() {
    form.handleSubmit(validatePin, () => {
      console.log(form.formState.errors, form.getValues());
    })();
  }
  const navigate = useNavigate();
  function submit() {
    const values = form.getValues();
    values.registeredRouteId = (
      values.registeredRouteId ? +values.registeredRouteId : undefined
    ) as any;
    mutate(
      {
        user,
        staff,
        [`${staff.role === StaffRole.DRIVER ? "driverInfo" : "vehicleAssistantInfo"}`]:
          values,
      },
      {
        onSuccess: (data) => {
          console.log("success", data);

          form.reset();
          toast({
            description: data.message,
          });
          navigate({ to: "/staff/add" });
        },
        onError: (data) => {
          toast({
            description: data.message,
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form>
        <Card>
          <CardHeader> </CardHeader>
          <CardContent className="grid grid-col-1 gap-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={"operation"}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{fieldPersonnel}'s Operation</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.resetField("registeredRouteId");
                          form.resetField("currentStationId");
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Operation" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OperationEnum).map((operation) => (
                            <SelectItem key={operation} value={operation}>
                              {operation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {operation === OperationEnum.INTERSTATION ? (
                <>
                  <div className="flex flex-col gap-3">
                    <FormLabel>{fieldPersonnel} Coverage</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        setCoverage(value as RouteCoverage);
                        form.resetField();
                      }}
                      // defaultValue={+field.value}
                      value={coverage}
                    >
                      <SelectTrigger className="">
                        {coverage ? (
                          <SelectValue
                            placeholder="Select Coverage"
                            className="w-full"
                          />
                        ) : (
                          "Select Coverage"
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(RouteCoverage).map(
                          (coverage: RouteCoverage) => (
                            <SelectItem key={coverage} value={coverage}>
                              {coverage}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <FormLabel>{fieldPersonnel} Route Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        setRouteType(value as RouteType);
                        form.resetField();
                      }}
                      // defaultValue={+field.value}
                      value={routeType}
                    >
                      <SelectTrigger className="">
                        {routeType ? (
                          <SelectValue
                            placeholder="Select Type"
                            className="w-full"
                          />
                        ) : (
                          "Select Type"
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(RouteType).map((type: RouteType) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name={"registeredRouteId"}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{fieldPersonnel}'s Route</FormLabel>
                        <FormControl>
                          <Select
                            disabled={routesError || routesLoading}
                            onValueChange={field.onChange}
                            defaultValue={field.value as any}
                            value={+field.value! as any}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Route" />
                            </SelectTrigger>
                            <SelectContent>
                              {possibleRoutes.map((route) => (
                                <SelectItem
                                  key={route.id}
                                  value={route.id as unknown as string}
                                >
                                  {route.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                ""
              )}
            </div>
            {operation === OperationEnum.LASTMAN || selectedRouteId ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const state = statesLGAs.find(
                        (state: State) => state.id === +value
                      );
                      setState(state);
                      form.resetField("currentStationId");
                    }}
                    disabled={statesLGAsError || statesLGAsLoading}
                    // defaultValue={+field.value}
                    value={state?.id as unknown as string}
                  >
                    <SelectTrigger className="">
                      {state ? (
                        <SelectValue
                          placeholder="Select State"
                          className="w-full"
                        />
                      ) : (
                        "Select State"
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {statesLGAs.map((state: State) => (
                        <SelectItem
                          key={state.id}
                          value={state.id as unknown as string}
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormField
                  control={form.control}
                  name={"currentStationId"}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Current Station</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={stationsError || stationsLoading}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Station" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateStations.map((station) => (
                              <SelectItem key={station.id} value={station.id!}>
                                {station.name} ({station.nickName})
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
            ) : (
              ""
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-center gap-10">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  navigate({
                    to: "/staff/add",
                    search: {
                      user,
                      staff,
                    },
                  });
                }}
              >
                Back
              </Button>
              <Button type="button" onClick={onSubmit}>
                Submit
              </Button>
              <ConfirmPin id="staff-reg" name="Add staff" action={submit} />
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
