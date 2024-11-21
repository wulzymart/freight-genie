import {createFileRoute, Link, useLoaderData, useNavigate, useRouter} from '@tanstack/react-router'
import {Card, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ApiResponseType, CustomerType, OrderStatus} from "@/lib/custom-types.ts";
import {Wallet} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {PaymentForm} from "@/forms/payment-form.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import * as z from 'zod'
import {paymentReceiptSchema} from "@/lib/zodSchemas.ts";
import {zodSearchValidator} from "@tanstack/router-zod-adapter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {Label} from "@/components/ui/label.tsx";
import {useState} from "react";
import ConfirmPin from "@/components/confirm-pin.tsx";
import {axiosInstance} from "@/lib/axios.ts";
import {useToast} from "@/hooks/use-toast.ts";
import {validatePinElementGen} from "@/lib/utils.ts";


export const Route = createFileRoute('/_authenticated/orders/$id/payment')({
  component: OrderPayment,
  validateSearch: zodSearchValidator(z.object({amount: z.optional(z.number().min(1000, {message: "Payment amount too small"}))}))
})

function OrderPayment() {
  const queryClient = useQueryClient();
  const {order, customer} = useLoaderData({from: '/_authenticated/orders/$id'})
  if (order.paymentInfo) throw new Error('Order has already been paid for')
  const {amount} = Route.useSearch()
  const {mutate: pay} = useMutation({
    mutationKey: [`order-${order.id}`],
    mutationFn: async (values: z.infer<typeof paymentReceiptSchema>) => {
      const {data}: { data:ApiResponseType } = await axiosInstance.post(`/vendor/orders/${order.id}/pay`, values)
      if (!data.success) throw new Error(data.message)
      return data
    }
  })
  const {mutate: setPod} = useMutation({
    mutationKey: [`order-${order.id}`],
    mutationFn: async () => {
      const {data}: { data:ApiResponseType } = await axiosInstance.put(`/vendor/orders/${order.id}/pay-on-delivery`)
      if (!data.success) throw new Error(data.message)
      return data
    }
  })
  const router = useRouter()
  const {toast} = useToast()
  const navigate = useNavigate()
  const [payOnDelivery, setPayOnDelivery] = useState<boolean>(false);
  const onSubmit = async (data: z.infer<typeof paymentReceiptSchema>) => {
    pay(data, {onSuccess: async (data) => {
        toast({description: data.message})
        await queryClient.refetchQueries({queryKey: [`order-${order.id}`]})
        await router.invalidate()
        await navigate({to: `/orders/${order.id}/summary`})
      }, onError: (error) => {
      toast({description: error.message})
      }})
  }
  function handlePod(){
    setPod(undefined, {onSuccess: async (data) => {
        toast({description: data.message})
        await queryClient.refetchQueries({queryKey: [`order-${order.id}`]})
        await router.invalidate()
        await navigate({to: `/orders/${order.id}/summary`})
      }, onError: (error) => {
        toast({description: error.message})
      }})
  }
  return <div>
    <Card className='mt-8'>
      <CardHeader>
        <CardTitle className='font-semibold text-xl text-gray-700 flex justify-between'><p>Payment Page</p><p>
          <span>Order:</span> <i>{order.trackingNumber}</i>
        </p></CardTitle>
      </CardHeader>
      {customer.customerType === CustomerType.CORPORATE &&  <Card><CardHeader className='py-2'>
        <div className='w-full flex items-center justify-end gap-2 font-semibold text-gray-600'><Wallet size={20}/>
          <p>Balance: ₦{customer.corporateCustomer?.walletBalance.toFixed(2)}</p>
        <Link to ={`/customers/corporate/${customer.corporateCustomer!.id}/refill`}><Button variant='secondary' className='hover:bg-gray-400 hover:text-gray-50'>Top-up</Button></Link>
        </div>
      </CardHeader></Card>}
      {[OrderStatus.PENDING , OrderStatus.ACCEPTED].includes(order.status) && !order.paymentInfo && <Card><CardHeader className='py-2'>
        <div className='w-full flex items-center justify-start gap-2 font-semibold text-gray-600'><Wallet size={20}/>
          <p>Pay on Delivery?</p>
          <RadioGroup defaultValue={String(payOnDelivery)} onValueChange={(e) =>
              e === 'true' ? setPayOnDelivery(true) : setPayOnDelivery(false)
          } className='flex gap-4'>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false"/>
              <Label htmlFor="false">No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true"/>
              <Label htmlFor="true">Yes</Label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader></Card>}
      {!payOnDelivery ? <PaymentForm modalId='order-payment' onSubmit={onSubmit} amount={amount}/>: <div className='w-full flex justify-center'><Button onClick={() => {
        if (confirm('Has Customer confirmed payment on delivery?')) validatePinElementGen("payOnDelivery")
      }}>Pay on delivery</Button><ConfirmPin id='payOnDelivery' action={handlePod}/></div>}
    </Card>
  </div>
}
