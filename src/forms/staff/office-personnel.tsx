import * as z from "zod";
import {officeStaffSchema, staffFormSchema, userFormSchema} from "@/lib/zodSchemas.ts";
import {useMutation, useSuspenseQuery} from "@tanstack/react-query";
import {getStatesWithLgas} from "@/lib/queries/states.ts";
import {getStations} from "@/lib/queries/stations.ts";
import {useState} from "react";
import {ApiResponseType, State} from "@/lib/custom-types.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {axiosInstance} from "@/lib/axios.ts";
import {useToast} from "@/hooks/use-toast.ts";
import {useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import ConfirmPin from "@/components/confirm-pin.tsx";
import {validatePinElementGen} from "@/lib/utils.ts";

export const OfficePersonnelForm = ({
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
    const {mutate} = useMutation({
        mutationKey: ["staff"],
        mutationFn: async (values: {
            user: z.infer<typeof userFormSchema>;
            staff: z.infer<typeof staffFormSchema>;
            officePersonnelInfo: z.infer<typeof officeStaffSchema>;
        }) => {
            if (!values) throw Error;
            const {data}: { data: ApiResponseType } = await axiosInstance.post(
                "/vendor/users",
                values
            );
            if (!data.success) throw Error(data.message);
            return data;
        },
    });
    const {toast} = useToast();

    function onSubmit() {
        form.handleSubmit(() => validatePinElementGen("staff-reg"))();
    }

    const navigate = useNavigate();

    function submit() {
        mutate(
            {user, staff, officePersonnelInfo: form.getValues()},
            {
                onSuccess: async  (data) => {
                    form.reset();
                    toast({
                        description: data.message,
                    });
                    await navigate({to: "/staff/add"});
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
                                    setState(state || null);
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
                            render={({field}) => (
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
                                                <SelectValue placeholder="Select Station"/>
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
                                    <FormMessage/>
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
                            onClick={async  () => {
                                await navigate({
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
                        <ConfirmPin id="staff-reg" name="Add staff" action={submit}/>
                    </div>
                </CardFooter>
            </Card>
        </Form>
    );
};
