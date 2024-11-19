import {useToast} from "@/hooks/use-toast.ts";
import {useNavigate} from "@tanstack/react-router";
import {useState} from "react";
import {ApiResponseType, NewCustomerType} from "@/lib/custom-types.ts";
import {axiosInstance} from "@/lib/axios.ts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ngPhoneNumberSchema} from "@/lib/zodSchemas.ts";

export function Prompt() {
    const {toast} = useToast();
    const navigate = useNavigate();
    const [newCustomer, setNewCustomer] = useState<NewCustomerType>("Yes");
    const [phoneNumber, setPhoneNumber] = useState("");
    const getCustomer = async (phoneNumber: string): Promise<ApiResponseType> => {
        const {data}: { data: ApiResponseType } = await axiosInstance.get(
            "/vendor/customers/phone/" + phoneNumber
        );
        return data;
    };
    const handleClick = (newCustomer: NewCustomerType) => {
        if (newCustomer === "Yes") {
            navigate({to: "/customers/add", search: {newOrder: true}});
        } else {
            getCustomer(phoneNumber).then((data) => {
                if (data.success) {
                    navigate({
                        to: "/orders/new",
                        search: {customerId: data.customer.id, page: "detail"},
                    });
                } else {
                    toast({variant: "destructive", description: data.message});
                }
            });
        }
    };
    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl">New Customer</CardTitle>
                <CardDescription>Is this customer new or returning</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div>
                    <Select
                        onValueChange={(e) => setNewCustomer(e as NewCustomerType)}
                        defaultValue={newCustomer}
                        value={newCustomer}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="New Customer?"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    {newCustomer === "No" ? (
                        <>
                            <Label>Customer Phone</Label>
                            <Input
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                value={phoneNumber}
                                type="text"
                                placeholder="+2348123456895"
                            />
                        </>
                    ) : (
                        ""
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    type="button"
                    disabled={
                        newCustomer === "No" &&
                        !ngPhoneNumberSchema.safeParse(phoneNumber).success
                    }
                    className="w-full"
                    onClick={() => handleClick(newCustomer)}
                >
                    Continue
                </Button>
            </CardFooter>
        </Card>
    );
}