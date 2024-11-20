import * as z from "zod";
import {orderSchema} from "@/lib/zodSchemas.ts";
import {ApiResponseType, Order} from "@/lib/custom-types.ts";
import {useMutation, useSuspenseQuery} from "@tanstack/react-query";
import {axiosInstance} from "@/lib/axios.ts";
import {useNavigate} from "@tanstack/react-router";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import ConfirmPin from "@/components/confirm-pin.tsx";
import {validatePinElementGen} from "@/lib/utils.ts";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import WaybillInvoice from "@/components/order/order-summary.tsx";

export function Pricing({
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
    additionalCharges: z.infer<typeof orderSchema.additionalServices>;
}) {
    const order: Partial<
        Order
    > = {
        customerId,
        orderType: deliveryDetails.orderType,
        originStationId: deliveryDetails.originStationId,
        stationOperation: deliveryDetails.stationOperation,
        destinationStationId: receiver.destinationStationId,
        destinationRegionStationId: receiver.destinationRegionStationId,
        deliveryType: deliveryDetails.deliveryType,
        interStationOperation: deliveryDetails.interStationOperation,
        receiver: {
            firstName: receiver.firstName,
            lastName: receiver.lastName,
            phoneNumber: receiver.phoneNumber,
            address: {
                ...receiver.address,
                stateId: Number(receiver.address.stateId),
            },
        },
        item,
        additionalCharges,
        insurance,
    };


    const {data, isLoading, isError} = useSuspenseQuery({
        queryKey: ["price"],
        staleTime: 1,
        queryFn: async () => {
            const {data}: ApiResponseType = await axiosInstance.post(
                "/vendor/orders/get-price",
                order
            );
            order.price = data?.price;
            return data.price;
        },
    });
    const {mutate} = useMutation({
        mutationFn: async (order: Partial<Order>) => {
            const {data} : {data: ApiResponseType}= await axiosInstance.post(
                "/vendor/orders",
                order
            );
            if (!data.success) throw  new Error(data.message)
            return data
        }
    })
    const {toast} = useToast()
    const navigate = useNavigate();
    const onSubmit = () => {
        mutate(order, {onSuccess: (data: ApiResponseType) => {
            toast({description: data.message})
                navigate({})
            }, onError: (error) => {
            toast({description: error.message, variant: 'destructive'})
            }})
    };
    return isLoading ? (
        <>Loading...</>
    ) : isError ? (
        <>An Error has occurred</>
    ) : (
        <div>
            <div className="flex items-center justify-center gap-4">
                <Table>
                    <TableCaption>Order Charges.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-2xl">Charge</TableHead>
                            <TableHead className="text-2xl text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Freight Price</TableCell>
                            <TableCell className="text-right">N{data.freightPrice}</TableCell>
                        </TableRow>
                        {data.totalAdditionalCharges ? (
                            <TableRow>
                                <TableCell>Additional Charges</TableCell>
                                <TableCell className="text-right">
                                    N{data.totalAdditionalCharges}
                                </TableCell>
                            </TableRow>
                        ) : (
                            ""
                        )}
                        <TableRow>
                            <TableCell>Sub Total</TableCell>
                            <TableCell className="text-right">N{data.subtotal}</TableCell>
                        </TableRow>
                        {data.insurance ? (
                            <TableRow>
                                <TableCell>Insurance</TableCell>
                                <TableCell className="text-right">N{data.insurance}</TableCell>
                            </TableRow>
                        ) : (
                            ""
                        )}

                        <TableRow>
                            <TableCell>VAT</TableCell>
                            <TableCell className="text-right">N{data.vat}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium text-lg">Total</TableCell>
                            <TableCell className="text-right font-medium text-lg">
                                N{data.total}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className="w-full flex justify-center gap-10 mt-10">
                <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                        navigate({
                            to: "/orders/new",
                            search: {
                                page: "extras",
                                customerId,
                                deliveryDetails,
                                receiver,
                                item,
                                insurance,
                                additionalServices: additionalCharges,
                            },
                        });
                    }}
                >
                    Back
                </Button>

                <ConfirmPin
                    id="order-submit"
                    name="Confirm Order Submission"
                    action={() => onSubmit()}
                />
                <Dialog>
                    <DialogTrigger className='w-full'>
                        <Button variant="outline">View Waybill Summary</Button>
                    </DialogTrigger>
                    <DialogContent className="">
                        <WaybillInvoice order={order} />
                    </DialogContent>
                </Dialog>
                <Button
                    type="button"
                    onClick={() => {
                        validatePinElementGen('order-submit')
                    }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
