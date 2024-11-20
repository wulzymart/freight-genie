import * as z from "zod";
import {paymentReceiptSchema} from "@/lib/zodSchemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import TitleCard from "@/components/page-components/title.tsx";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import FormInput from "@/components/form-input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {PaymentType} from "@/lib/custom-types.ts";
import FormTextarea from "@/components/form-textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import ConfirmPin from "@/components/confirm-pin.tsx";
import {validatePinElementGen} from "@/lib/utils.ts";

export const PaymentForm = ({title, modalId, onSubmit, walletTopUp}: {
    modalId: string,
    onSubmit: (data: z.infer<typeof paymentReceiptSchema>) => any,
    title: string
    walletTopUp?: boolean
}) => {

    const form = useForm<z.infer<typeof paymentReceiptSchema>>({
        resolver: zodResolver(paymentReceiptSchema),
        defaultValues: {
            amount: 0,
            receiptInfo: '',
            paymentType: undefined,
        }
    })
    const amount = form.watch('amount')
    const paymentType = form.watch('paymentType')
    const receiptInfo = form.watch("receiptInfo")

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="mx-auto space-y-8">
                <TitleCard title={title}/>
                <Form {...form}>
                    <form>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Amount Card */}
                            <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>Amount</CardTitle>
                                    <CardDescription>Enter the payment amount</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormInput
                                        control={form.control}
                                        name="amount"
                                        label="Amount"
                                        type="number"
                                        placeholder="Enter amount"
                                        inputClass="w-full"
                                        description="Please enter the payment amount"
                                    />
                                </CardContent>
                            </Card>

                            {/* Payment Type Card */}
                            {amount ? <Card className="md:col-span-1">
                                <CardHeader>
                                    <CardTitle>Payment Type</CardTitle>
                                    <CardDescription>Select your payment method</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name= 'paymentType'
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full disabled:opacity-100">
                                                            {field.value ? (
                                                                field.value.toUpperCase()
                                                            ) : (
                                                                <SelectValue
                                                                    placeholder="Select Type"
                                                                    className="w-full"
                                                                />
                                                            )}
                                                        </SelectTrigger>
                                                        <SelectContent>{
                                                            Object.values(PaymentType).filter((type: PaymentType) => !walletTopUp ? true : type !== PaymentType.WALLET).map((type: PaymentType) =>
                                                            <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                </CardContent>
                            </Card>: ''}

                            {/* Receipt Information Card */}
                            {paymentType && <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Receipt Information</CardTitle>
                                    <CardDescription>Enter details of receipt (receipt number ...) this may be useful to trace the payment.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormTextarea
                                        control={form.control}
                                        name="receiptInfo"
                                        label="Receipt Details"
                                        placeholder="Enter any additional information for the receipt"
                                        textareaClass="w-full min-h-[120px]"
                                    />
                                </CardContent>
                            </Card>}

                            {/* Summary Card */}
                            {receiptInfo && <Card className="md:col-span-2 bg-white">
                                <CardHeader>
                                    <CardTitle>Proceed</CardTitle>
                                </CardHeader>

                                <CardFooter className="flex justify-end space-x-4">
                                    <ConfirmPin id={modalId} action={() => onSubmit(form.getValues())}/>
                                    <Button onClick={form.handleSubmit(() => validatePinElementGen(modalId))}>
                                        Make Payment
                                    </Button>
                                </CardFooter>
                            </Card>}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};
