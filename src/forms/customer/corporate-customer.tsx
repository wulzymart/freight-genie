import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import FormInput from "@/components/form-input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {ApiResponseType, State, UserRole} from "@/lib/custom-types.ts";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {
    corporateCustomerSchema,
} from "@/lib/zodSchemas.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useMutation} from "@tanstack/react-query";
import {compare, validatePinElementGen} from "@/lib/utils.ts";
import FormTextarea from "@/components/form-textarea.tsx";
import ConfirmPin from "@/components/confirm-pin.tsx";
import {useToast} from "@/hooks/use-toast.ts";
import {useLoaderData, useNavigate} from "@tanstack/react-router";
import {axiosInstance} from "@/lib/axios.ts";

export function CorporateCustomerForm() {
    const form = useForm<z.infer<typeof corporateCustomerSchema>>({
        resolver: zodResolver(corporateCustomerSchema),
        defaultValues: {
            user: {
                username: '',
                email: '',
                role: UserRole.CUSTOMER,
            },
            corporateInfo: {
                businessName: '',
                businessAddress: {
                    stateId:  -1,
                    address: ''
                },
                businessPhone: ''
            },
        }
    })
    const {mutate} = useMutation({
        mutationFn: async () => {
            const {data}: {data:ApiResponseType} = await  axiosInstance.post('/vendor/customers/id/upgrade', form.getValues())
            if (!data.success) throw new Error(data.message);
            return data
        }
    });
    const {toast} = useToast()
    const {
        statesLGAs: states
    } = useLoaderData({from: '/_authenticated'})
    const navigate = useNavigate();
    function handleSubmit() {
        mutate(undefined, {onSuccess: (data) => {
            toast({description: data.message});
            navigate({to: `/customers/corporate/${data.corporateCustomer.id}/refill`})
            }, onError: (error) => {
            toast({description: error.message});
            } });
    }
    return <Card className="w-full">
        <CardHeader></CardHeader>
        <CardContent className="grid gap-4">
            <Form {...form}>
                <form>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            control={form.control}
                            type="email"
                            label="Email"
                            name="user.email"
                            placeholder="e.g user@example.com"
                        />
                        <FormInput
                            control={form.control}
                            type="text"
                            label="Username"
                            name="user.username"
                            placeholder="e.g Conor"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput control={form.control} type='text' name='corporateInfo.businessName' label='Business Name' capitalize={true}/>
                        <FormInput control={form.control} type='text' name='corporateInfo.businessPhone' label='Business Phone'/>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="corporateInfo.businessAddress.stateId"
                            render={({field}) => (
                                <FormItem className="w-full">
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            // defaultValue={+field.value}
                                            value={+field.value as any}
                                        >
                                            <SelectTrigger className="w-full">
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
                                                {states.sort(compare).map((state: State) => (
                                                    <SelectItem key={state.id} value={state.id as any}>
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
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <FormTextarea
                            name="corporateInfo.businessAddress.address"
                            control={form.control}
                            label="Street address"
                            placeholder="e.g 10 Ajayi Street, Ikeja, Lagos"
                        />
                    </div>
                </form>
            </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <ConfirmPin id="corporate-reg" name="Add staff" action={handleSubmit} />
            <Button type="button" onClick={form.handleSubmit(() => validatePinElementGen("corporate-reg"))}>
                Save & Proceed
            </Button>
        </CardFooter>
    </Card>
}
