import * as z from "zod";
import {orderSchema} from "@/lib/zodSchemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {DeliveryType, InterStationOperation, OrderType, State, Station, StationOperation} from "@/lib/custom-types.ts";
import {useState} from "react";
import {useLoaderData, useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import FormTextarea from "@/components/form-textarea.tsx";
import {Button} from "@/components/ui/button.tsx";


export function OrderDetailForm({
                                    customerId,
                                    deliveryDetails,
                                }: {
    customerId: string;
    deliveryDetails?: z.infer<typeof orderSchema.shipmentInfoSchema>;
}) {
    const {
        stations, statesLGAs, staffStationId, staffState
    } = useLoaderData({from: '/_authenticated'});
    const form = useForm<z.infer<typeof orderSchema.shipmentInfoSchema>>({
        resolver: zodResolver(orderSchema.shipmentInfoSchema),
        defaultValues: deliveryDetails || {
            orderType: OrderType.REGULAR,
            deliveryType: DeliveryType.STATION_TO_STATION,
            stationOperation: StationOperation.LOCAL,
            interStationOperation: undefined,
            originStationId: staffStationId || '',
            originAddress: undefined,
        },
    });
    const stationOperation = form.watch("stationOperation");
    const deliveryType = form.watch("deliveryType");




    const [state, setState] = useState<State | undefined>(staffState);
    const navigate = useNavigate();

    const stateStations = stations.filter(
        (station: Station) => station.stateId === state?.id
    );
    const onSubmit = async () => {
        await navigate({
            to: "/orders/new",
            search: {
                customerId,
                deliveryDetails: form.getValues(),
                page: "destination",
            },
        });
    };

    return (
        <Form {...form}>
            <form>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">
                            Service Details
                        </CardTitle>
                        <CardDescription>Enter order service information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stationOperation"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Order Station Involvement</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    if (value === StationOperation.LOCAL) {
                                                        form.setValue(
                                                            "deliveryType",
                                                            DeliveryType.STATION_TO_DOOR
                                                        );
                                                        form.setValue("interStationOperation", undefined);
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {field.value ? (
                                                        <SelectValue
                                                            placeholder="Select Coverage"
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        "Select Coverage"
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(StationOperation).map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            {stationOperation === StationOperation.LOCAL ? (
                                ""
                            ) : (
                                <FormField
                                    control={form.control}
                                    name="interStationOperation"
                                    render={({field}) => (
                                        <FormItem className="w-full">
                                            <FormLabel>InterStation Involvement</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        {field.value ? (
                                                            <SelectValue
                                                                placeholder="Select Coverage"
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            "Select Coverage"
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(InterStationOperation).map(
                                                            (type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="orderType"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Order Type (Speed)</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {field.value ? (
                                                        <SelectValue
                                                            placeholder="Select Type"
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        "Select Type"
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(OrderType).map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
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
                                name="deliveryType"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Delivery Type</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    if (
                                                        value !== DeliveryType.PICKUP_TO_DOOR &&
                                                        value !== DeliveryType.PICKUP_TO_STATION
                                                    ) {
                                                        form.setValue("originAddress", undefined);
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {field.value ? (
                                                        <SelectValue
                                                            placeholder="Select Type"
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        "Select Type"
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(DeliveryType).map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-3">
                                <FormLabel>State</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const state = statesLGAs.find(
                                            (state: State) => state.id === +value
                                        );
                                        setState(state);
                                        form.resetField("originStationId");
                                    }}
                                    // defaultValue={+field.value}
                                    value={state?.id as unknown as string}
                                    disabled={!!staffState}
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
                                name="originStationId"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Origin Station</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                                disabled={!!staffStationId}
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
                        {deliveryType === DeliveryType.PICKUP_TO_DOOR ||
                        deliveryType === DeliveryType.PICKUP_TO_STATION ? (
                            <FormTextarea
                                control={form.control}
                                name="originAddress"
                                label="Origin Address"
                            />
                        ) : (
                            ""
                        )}
                    </CardContent>
                    <CardFooter>
                        <div className="w-full flex justify-center gap-10">
                            <Button
                                type="button"
                                onClick={() => {
                                    form.handleSubmit(onSubmit)();
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
