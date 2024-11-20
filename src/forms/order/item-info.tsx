import * as z from "zod";
import {itemCategorySchema, itemTypeSchema, orderSchema} from "@/lib/zodSchemas.ts";
import {useSuspenseQuery} from "@tanstack/react-query";
import {getItemCategories} from "@/lib/queries/item-categories.ts";
import {getItemTypes} from "@/lib/queries/item-types.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useNavigate} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {compare} from "@/lib/utils.ts";
import {TypePricing} from "@/lib/custom-types.ts";
import FormInput from "@/components/form-input.tsx";
import FormTextarea from "@/components/form-textarea.tsx";
import {Button} from "@/components/ui/button.tsx";

export function ItemForm({
                             customerId,
                             deliveryDetails,
                             receiver,
                             item,
                         }: {
    customerId: string;
    deliveryDetails: z.infer<typeof orderSchema.shipmentInfoSchema>;
    receiver: z.infer<typeof orderSchema.receiver>;
    item?: z.infer<typeof orderSchema.item>;
}) {
    const {
        data: itemCategories,
        isError: categoriesError,
        isLoading: categoriesLoading,
    } = useSuspenseQuery(getItemCategories);
    const {
        data: itemTypes,
        isError: typesError,
        isLoading: typesLoading,
    } = useSuspenseQuery(getItemTypes);
    const form = useForm<z.infer<typeof orderSchema.item>>({
        resolver: zodResolver(orderSchema.item),
        defaultValues: item || {
            category: "",
            type: "",
            condition: "",
            description: "",
            quantity: 1,
            weight: undefined,
            length: undefined,
            width: undefined,
            height: undefined,
        },
    });

    const navigate = useNavigate();
    const type = form.watch("type");
    const selectedType: z.infer<typeof itemTypeSchema> & { id: string } =
        itemTypes.find(
            (itemType: z.infer<typeof itemTypeSchema> & { id: string }) =>
                itemType.name === type
        );

    const onSubmit = () => {
        navigate({
            to: "/orders/new",
            search: {
                customerId,
                deliveryDetails,
                receiver,
                item: form.getValues(),
                page: "insurance",
            },
        });
    };
    return (
        <Form {...form}>
            <form>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Item Details</CardTitle>
                        <CardDescription>
                            Enter details of items to be shipped
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
                            <FormField
                                control={form.control}
                                name="category"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Shipment category</FormLabel>
                                        <FormControl>
                                            <Select
                                                disabled={categoriesLoading || categoriesError}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {field.value ? (
                                                        <SelectValue
                                                            placeholder="Select category"
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        "Select category"
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {itemCategories.sort(compare).map(
                                                        (
                                                            category: z.infer<typeof itemCategorySchema> & {
                                                                id: string;
                                                            }
                                                        ) => (
                                                            <SelectItem
                                                                key={category.id}
                                                                value={category.name}
                                                            >
                                                                {category.name}
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
                            <FormField
                                control={form.control}
                                name="type"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Item type</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    const selectedType: z.infer<typeof itemTypeSchema> & {
                                                        id: string
                                                    } = itemTypes.find(
                                                        (itemType: z.infer<typeof itemTypeSchema> & { id: string }) =>
                                                            itemType.name === value
                                                    )
                                                    if (selectedType.pricing === TypePricing.FIXED) {
                                                        console.log('called')
                                                        form.setValue("weight", undefined);
                                                        form.setValue('height', undefined);
                                                        form.setValue('length', undefined);
                                                        form.setValue('width', undefined);
                                                    } else {
                                                        form.setValue("weight", selectedType.min || 1);
                                                    }
                                                }}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger
                                                    disabled={typesError || typesLoading}
                                                    className="w-full"
                                                >
                                                    {field.value ? (
                                                        <SelectValue
                                                            placeholder="Select type"
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        "Select type"
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {itemTypes.sort(compare).map(
                                                        (
                                                            itemType: z.infer<typeof itemTypeSchema> & {
                                                                id: string;
                                                            }
                                                        ) => (
                                                            <SelectItem
                                                                key={itemType.id}
                                                                value={itemType.name}
                                                            >
                                                                {itemType.name}
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
                            <FormField
                                control={form.control}
                                name="condition"
                                render={({field}) => (
                                    <FormItem className="w-full">
                                        <FormLabel>Item Condition</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    {field.value ? (
                                                        <SelectValue placeholder="Select condition"/>
                                                    ) : (
                                                        "Select condition"
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="New">Brand New</SelectItem>
                                                    <SelectItem value="Good">Good</SelectItem>
                                                    <SelectItem value="Defected">Defected</SelectItem>
                                                    <SelectItem value="Damaged">Damaged</SelectItem>
                                                    <SelectItem value="Rotten">Rotten</SelectItem>
                                                    <SelectItem value="Bad">Bad</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <FormInput
                                control={form.control}
                                name="quantity"
                                label="Quantity"
                                type="number"
                            />
                            {selectedType?.pricing === TypePricing.PER_KG && (
                                <FormInput
                                    control={form.control}
                                    type="number"
                                    label="Weight"
                                    name="weight"
                                    min = {selectedType.min}
                                    max = {selectedType.limit}
                                />
                            )}
                        </div>
                        {selectedType?.pricing === TypePricing.PER_KG && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <FormInput
                                    control={form.control}
                                    name="length"
                                    label="Length in centimeters"
                                    type="number"
                                />

                                <FormInput
                                    control={form.control}
                                    type="number"
                                    label="Width in centimeters"
                                    name="width"
                                />
                                <FormInput
                                    control={form.control}
                                    type="number"
                                    label="Height in centimeters"
                                    name="height"
                                />

                            </div>
                        )}
                        <FormTextarea
                            control={form.control}
                            name="description"
                            label="Item description"
                            placeholder="e.g HP laptop in sealed carton..."
                        />
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
                                            page: "destination",
                                            customerId,
                                            deliveryDetails,
                                            receiver,
                                        },
                                    });
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    const weight = form.getValues().weight
                                    if (selectedType!.pricing === TypePricing.PER_KG && weight) {

                                        if ((selectedType.limit && (weight > selectedType.limit!) || (selectedType.min && weight < selectedType.min!))) {
                                            return alert('Item weight and Item type are not compatible, Please change the type')
                                        }
                                    }
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
