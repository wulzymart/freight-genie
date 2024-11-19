import * as z from "zod";
import {orderSchema} from "@/lib/zodSchemas.ts";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSuspenseQuery} from "@tanstack/react-query";
import {getAdditionalCharges} from "@/lib/queries/additional-charge.ts";
import {useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MdAdd, MdDelete} from "react-icons/md";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import FormInput from "@/components/form-input.tsx";

export function AdditionalServicesForm({
                                           customerId,
                                           deliveryDetails,
                                           receiver,
                                           item,
                                           additionalCharges,
                                           insurance,
                                       }: {
    customerId: string;
    deliveryDetails: z.infer<typeof orderSchema.shipmentInfoSchema>;
    receiver: z.infer<typeof orderSchema.receiver>;
    item: z.infer<typeof orderSchema.item>;
    insurance: z.infer<typeof orderSchema.insurance>;
    additionalCharges?: z.infer<typeof orderSchema.additionalServices>;
}) {
    const formSchema = z.object({
        services: orderSchema.additionalServices,
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {services: additionalCharges || []},
    });
    const {append, remove, fields} = useFieldArray({
        control: form.control,
        name: "services",
    });
    const selected = form.watch("services");

    const selectedServices = selected.map((service) => service.charge);

    const {
        data: additionalServices,
        isError,
        isLoading,
    } = useSuspenseQuery(getAdditionalCharges);
    const navigate = useNavigate();
    const onSubmit = () => {
        const values = form.getValues("services");

        navigate({
            to: "/orders/new",
            search: {
                customerId,
                deliveryDetails,
                receiver,
                item,
                insurance,
                additionalServices: values,
                page: "pricing",
            },
        });
    };
    return (
        <Form {...form}>
            <form>
                <Card>
                    <CardHeader>
                        <CardTitle></CardTitle>
                        <div className="flex items-center justify-between">
                            <p>Additional Services</p>
                            <Button
                                type="button"
                                onClick={() => append({charge: "", price: 0})}
                            >
                                <MdAdd/>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`grid grid-cols-1 gap-6`}>
                            <div className="w-full h-24 flex justify-center items-center">
                                <p className="text-gray-500 text-lg font-semibold">
                                    No Service Selected
                                </p>
                            </div>
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex gap-6 items-center md:items-end"
                                >
                                    <div className="w-full grid grid-cols-1 md:grid-cols-2 items-end gap-4">
                                        <FormField
                                            name={`services.${index}.charge`}
                                            render={({field}) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Service</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            disabled={isError || isLoading}
                                                            onValueChange={(value) => {
                                                                selectedServices.includes(value)
                                                                    ? alert("Service already selected")
                                                                    : field.onChange(value);
                                                                console.log(field);
                                                            }}
                                                            defaultValue={field.value}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                {field.value ? (
                                                                    <SelectValue
                                                                        placeholder="Select Service"
                                                                        className="w-full"
                                                                    />
                                                                ) : (
                                                                    "Select Service"
                                                                )}
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {additionalServices.map(
                                                                    (additionalCharge: {
                                                                        id: string;
                                                                        charge: string;
                                                                    }) => (
                                                                        <SelectItem
                                                                            key={additionalCharge.id}
                                                                            value={additionalCharge.charge}
                                                                        >
                                                                            {additionalCharge.charge}
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
                                        <FormInput
                                            name={`services.${index}.price`}
                                            type="number"
                                            label="Price"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            remove(index);
                                        }}
                                        type="button"
                                    >
                                        <MdDelete/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="w-full flex justify-center gap-10">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                    navigate({
                                        to: "/orders/new",
                                        search: {
                                            page: "insurance",
                                            customerId,
                                            deliveryDetails,
                                            receiver,
                                            item,
                                            insurance,
                                        },
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