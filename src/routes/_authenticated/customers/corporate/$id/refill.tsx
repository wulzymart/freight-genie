import {createFileRoute, useNavigate, useRouter} from '@tanstack/react-router'
import {PaymentForm} from "@/forms/payment-form.tsx";
import {useMutation} from "@tanstack/react-query";
import * as z from 'zod'
import {paymentReceiptSchema} from "@/lib/zodSchemas.ts";
import {ApiResponseType} from "@/lib/custom-types.ts";
import {axiosInstance} from "@/lib/axios.ts";
import {useToast} from "@/hooks/use-toast.ts";

function WalletRefillPage(){
  const {id} = Route.useParams()

  const {toast} = useToast()
  const navigate = useNavigate()
  const {mutate} = useMutation({
    mutationKey: [`corporateCustomer-${id}`],
    mutationFn: async (values: z.infer<typeof paymentReceiptSchema>) => {
      const {data}: {data:ApiResponseType} = await  axiosInstance.post(`/vendor/customers/corporate/${id}/wallet-refill`, values)
      if (!data.success) throw new Error(data.message);
      return data
    }
  })
  const router = useRouter()
  function onSubmit (values: z.infer<typeof paymentReceiptSchema>) {
    mutate(values, {onSuccess: async (data) => {
        toast({description: data.message});
        await router.invalidate()
        navigate({to: `/customers/corporate/${id}`})
      }, onError: (error) => {
        toast({description: error.message});
      } })

  }
  return <PaymentForm modalId='wallet-refill' title='Wallet Refill' walletTopUp onSubmit={onSubmit } />
}
export const Route = createFileRoute(
    '/_authenticated/customers/corporate/$id/refill',
)({
  component: WalletRefillPage
})
