import {createFileRoute, Link, useLoaderData} from '@tanstack/react-router'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import OrderSummary from "@/components/order/order-summary.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useRef} from "react";
import {useReactToPrint} from "react-to-print";


export const Route = createFileRoute('/_authenticated/orders/$id/summary')({
  component: Page
})
function Page() {
  const {order} = useLoaderData({from: '/_authenticated/orders/$id'})
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef, documentTitle: `Summary of order-${order.trackingNumber}` });
  return <div>
    <Card className='mt-8'>
      <CardHeader>
        <CardTitle className='font-semibold text-xl text-gray-700 flex justify-between'><p>Order Summary</p><p>
        </p></CardTitle>
      </CardHeader>
      <CardContent className='flex justify-center'>
        <div ref={contentRef} className='grid grid-cols-1 border-2 border-gray-200 shadow-sm p-0 m-0'>

          <OrderSummary/>
        </div>
      </CardContent>
      <CardFooter className='flex justify-center gap-8'>
      <Button variant='secondary' onClick={() => reactToPrintFn()}>Print</Button>
        {!order.paymentInfo&&<Link to = {`/orders/${order.id}/payment`}><Button variant='ghost'>Add Payment</Button></Link>}
      </CardFooter>
    </Card>
  </div>
}
