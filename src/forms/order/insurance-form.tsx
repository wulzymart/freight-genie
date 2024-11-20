import * as z from "zod";
import {orderSchema} from "@/lib/zodSchemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import FormInput from "@/components/form-input.tsx";
import {Button} from "@/components/ui/button.tsx";

export function InsuranceForm({
                                  customerId,
                                  deliveryDetails,
                                  receiver,
                                  item,
                                  insurance,
                              }: {
    customerId: string;
    deliveryDetails: z.infer<typeof orderSchema.shipmentInfoSchema>;
    receiver: z.infer<typeof orderSchema.receiver>;
    item: z.infer<typeof orderSchema.item>;
    insurance?: z.infer<typeof orderSchema.insurance>;
}) {
    const form = useForm<z.infer<typeof orderSchema.insurance>>({
        resolver: zodResolver(orderSchema.insurance),
        defaultValues: insurance || {
            insured: false,
            itemValue: undefined,
        },
    });
    const insured = form.watch("insured");
    const navigate = useNavigate();

    const onSubmit = () => {
        navigate({
            to: "/orders/new",
            search: {
                customerId,
                deliveryDetails,
                receiver,
                item,
                insurance: form.getValues(),
                page: "extras",
            },
        });
    };
    return (
        <Form {...form}>
            <form>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">
                            Insurance (optional)
                        </CardTitle>
                        <CardDescription>Do the items need to be insured</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`grid grid-cols-1 gap-6`}>
                            <FormField
                                control={form.control}
                                name="insured"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (!checked) form.setValue("itemValue", undefined);
                                                    else form.setValue("itemValue", 0);
                                                }}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Insure Order Items</FormLabel>
                                            <FormDescription>
                                                Tick box if items needs to insured, then provide the
                                                declared items value
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            {insured && (
                                <FormInput
                                    control={form.control}
                                    name="itemValue"
                                    label="Declared Value (NGN)"
                                    type="number"
                                />
                            )}
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
                                            page: "items",
                                            customerId,
                                            deliveryDetails,
                                            receiver,
                                            item,
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