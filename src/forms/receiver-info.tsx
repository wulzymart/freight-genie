import * as z from "zod";
import {orderSchema} from "@/lib/zodSchemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSuspenseQuery} from "@tanstack/react-query";
import {getStatesWithLgas} from "@/lib/queries/states.ts";
import {getStations} from "@/lib/queries/stations.ts";
import {useNavigate} from "@tanstack/react-router";
import {State, Station, StationOperation, StationType} from "@/lib/custom-types.ts";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import FormInput from "@/components/form-input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import FormTextarea from "@/components/form-textarea.tsx";
import {compare} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button.tsx";

export function ReceiverForm({
                                 customerId,
                                 deliveryDetails,
                                 receiver,
                             }: {
    customerId: string;
    deliveryDetails: z.infer<typeof orderSchema.shipmentInfoSchema>;
    receiver?: z.infer<typeof orderSchema.receiver>;
}) {
    const form = useForm<z.infer<typeof orderSchema.receiver>>({
        resolver: zodResolver(orderSchema.receiver),
        defaultValues: receiver || {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            address: {
                stateId: "",
                address: "",
            },
            destinationRegionStationId: undefined,
            destinationStationId: undefined,
        },
    });
    const destinationRegionStationId = form.watch("destinationRegionStationId");

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

    const stateId = form.watch("address.stateId");
    const navigate = useNavigate();

    const onSubmit = () => {
        navigate({
            to: "/orders/new",
            search: {
                customerId,
                deliveryDetails,
                receiver: form.getValues(),
                page: "items",
            },
        });
    };
    const {stationOperation} = deliveryDetails;
    const stateStations = stations.filter(
        (station: Station) => station.stateId === +stateId
    );
    const stateRegionalStations = stateStations.filter(
        (station) => station.type === StationType.REGIONAL
    );
    const destinationRegionStation = stateRegionalStations.find(
        (station) => station.id === destinationRegionStationId
    );
    const destinationsList: Station[] = []
    destinationRegionStation && destinationsList.push(destinationRegionStation)
    destinationRegionStation?.localStations && destinationsList.push(...destinationRegionStation.localStations);
    return (
        <Form {...form}>
            <form>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">
                            Destination Details
                        </CardTitle>
                        <CardDescription>
                            Enter details of receiver and destination
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-6`}>
                            <FormInput
                                control={form.control}
                                name="firstName"
                                label="First Name"
                                type="text"
                                placeholder="e.g Jones"
                            />
                            <FormInput
                                control={form.control}
                                name="lastName"
                                label="Last Name"
                                type="text"
                                placeholder="e.g Jack"
                            />
                            <FormInput
                                control={form.control}
                                type="tel"
                                label="Phone Number"
                                name="phoneNumber"
                                placeholder="e.g +2348123456789"
                            />
                        </div>
                        <div
                            className={`grid grid-cols-1 ${
                                stationOperation !== StationOperation.LOCAL && "md:grid-cols-3"
                            } gap-6 items-center my-8`}
                        >
                            <FormField
                                control={form.control}
                                name="address.stateId"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={+field.value as any}
                                            >
                                                <SelectTrigger
                                                    disabled={statesLGAsError || statesLGAsLoading}
                                                    className="w-full"
                                                >
                                                    {field.value ? (
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
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormTextarea
                                control={form.control}
                                name="address.address"
                                label="Street address"
                                placeholder="e.g 123 example street"
                            />
                        </div>
                        {stationOperation !== StationOperation.LOCAL && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="destinationRegionStationId"
                                    render={({field}) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Destination Region Station</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger
                                                        disabled={stationsLoading || stationsError}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select station"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {stateRegionalStations
                                                            ?.sort(compare)
                                                            .map((station: Station) => (
                                                                <SelectItem
                                                                    key={station.id}
                                                                    value={station.id!}
                                                                >
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
                                <FormField
                                    control={form.control}
                                    name="destinationStationId"
                                    render={({field}) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Destination station</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger
                                                        disabled={stationsError || stationsLoading}
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select station"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {destinationsList
                                                            .sort(compare)
                                                            .map((station: Station) => (
                                                                <SelectItem
                                                                    key={station.id}
                                                                    value={station.id!}
                                                                >
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
                        )}
                    </CardContent>
                    <CardFooter>
                        <div className="w-full flex justify-center gap-10">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    navigate({
                                        to: "/orders/new",
                                        search: {page: "detail", customerId, deliveryDetails},
                                    });
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    form.handleSubmit(onSubmit, () =>
                                        console.log(form.formState.errors)
                                    )();
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}