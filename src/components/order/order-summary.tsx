import {Customer, CustomerType, ItemType, Order, State, Station, TypePricing} from "@/lib/custom-types";
import {Box, Building, DollarSign, FileText, Globe, Hash, MapPin, Phone, User} from 'lucide-react';
import {useSuspenseQuery} from "@tanstack/react-query";
import {getCustomerById} from "@/lib/queries/customer.ts";
import {getItemTypes} from "@/lib/queries/item-types.ts";
import {useLoaderData} from "@tanstack/react-router";


const WaybillInvoice = ({order}: {order?: Partial<Order>}) => {
  const {stations, statesLGAs} = useLoaderData({from: '/_authenticated'})
  const vendor = useLoaderData({from: '__root__'})
  const loadedData = order? undefined: useLoaderData({from: '/_authenticated/orders/$id'})

  const customerData: {data: Customer} | undefined = order ? useSuspenseQuery(getCustomerById(order.customerId!)): undefined
  let customer =(loadedData?.customer || customerData?.data) as Customer
  order = (order || loadedData?.order) as Order


  const {
    data: itemTypes,
    isError: typesError,
    isLoading: typesLoading,
  } = useSuspenseQuery(getItemTypes)
  const vendorHq= stations.find((s) => s.id === vendor.config?.hqId)
  const vendorHqState = statesLGAs.find((s) => s.id === vendorHq?.stateId)


  const originStation = stations.find((station: Station) => station.id === order!.originStationId!);
  const destinationStation = stations.find((station: Station) => station.id === order!.destinationStationId || order!.destinationRegionStationId );
  const customerState = statesLGAs.find((state: State) => state.id === customer!.address.stateId);
  const receiverState = statesLGAs.find((state: State) => state.id === order!.receiver?.address.stateId);
  if (typesLoading)  return <p>Gathering data...</p>
  if (typesError)  return <p>Error Gathering data...</p>
  const  type: ItemType = itemTypes.find((type: ItemType) => type.name === order.item?.type);
  return (
      <div className="w-[210mm] h-[148mm] bg-white p-2 m-0 font-sans text-sm">
        {/* Header Section */}
        <div className="border-b-2 border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <img src={vendor.logo || '/freight-genie-logo.png'} alt="Company Logo" className="h-12" />
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-800">{vendor.companyName}</h1>
              <p className="text-gray-600 text-xs">{`${vendorHq?.address} ${vendorHqState?.name}`}</p>
              <div className="flex flex-col text-xs text-gray-600">
                {vendor.config?.customerCareLine.split(' ').map((number, index) => (
                    <span key={index}>☎ {number}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Order Information */}
        <div className="grid grid-cols-4 gap-2 mt-2 bg-gray-50 p-3 rounded">
          <div>
            <div className="flex items-center gap-1 mt-0">
              <Hash className="h-4 w-4 text-gray-600" />
              <p className="text-gray-600 text-xs">Tracking Number</p>
            </div>
            <p className="font-bold text-lg">{order.trackingNumber || 'N/A'}</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-gray-600" />
              <p className="text-gray-600 text-xs">Order Category</p>
            </div>
            <p className="font-semibold">{order.orderType}</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4 text-gray-600" />
              <p className="text-gray-600 text-xs">Station Coverage</p>
            </div>
            <p className="font-semibold">{order.stationOperation}</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4 text-gray-600" />
              <p className="text-gray-600 text-xs">Delivery Type</p>
            </div>
            <p className="font-semibold">{order.deliveryType}</p>
          </div>
        </div>

        {/* Secondary Order Details */}
        <div className="grid grid-cols-4 gap-4 mt-1">
          <div>
            <p className="text-gray-600 text-xs">Origin Station</p>
            <p className="font-semibold">{originStation?.name} ({originStation?.nickName})</p>
          </div>
          {destinationStation && <div>
            <p className="text-gray-600 text-xs">Destination Station</p>
            <p className="font-semibold">{destinationStation.name} ({destinationStation.nickName})</p>
          </div>}
        </div>

        {/* Customer & Receiver Information */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <h3 className="font-bold flex items-center gap-2 text-xs">
              <User className="h-4 w-4" />
              Sender Details
            </h3>
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-semibold">{customer.customerType=== CustomerType.INDIVIDUAL ? `${customer.firstname} ${customer.lastname}`: 'BusinessName'}</p>
              <p className="text-xs flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {customer.phoneNumber}
              </p>
              <p className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {customer.address.address}, {customerState?.name}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold flex items-center gap-2 text-xs">
              <User className="h-4 w-4" />
              Receiver Details
            </h3>
            <div className="bg-gray-50 p-2 rounded">
              <p className="font-semibold">{order.receiver?.firstName} {order.receiver?.lastName}</p>
              <p className="text-xs flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {order.receiver?.phoneNumber}
              </p>
              <p className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {order.receiver?.address.address}, {receiverState?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Item Details & Payment Info - Side by Side */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <h3 className="font-bold flex items-center gap-2 text-xs">
              <Box className="h-4 w-4" />
              Item Details
            </h3>
            <div className="grid grid-cols-4 gap-2 mt-1 bg-gray-50 p-2 rounded">
              <div>
                <p className="text-gray-600 text-xs">Item Type</p>
                <p className="font-semibold">{order.item?.type}</p>
              </div>
              {type.pricing === TypePricing.PER_KG && (
                  <>
                    <div>
                      <p className="text-gray-600 text-xs">Weight</p>
                      <p className="font-semibold">{order.item?.weight}KG</p>
                    </div>
                    {(order.item?.height && order.item?.width && order.item?.length) ? <div>
                      <p className="text-gray-600 text-xs">Dimensions</p>
                      <p className="font-semibold">{order.item?.length}x{order.item?.width}x{order.item?.height}cm</p>
                    </div>: ''}
                  </>
              )}
              <div>
                <p className="text-gray-600 text-xs">Category</p>
                <p className="font-semibold">{order.item?.category}</p>
              </div>
              <div className={order.item!.type === 'document' ? "col-span-2" : ""}>
                <p className="text-gray-600 text-xs">Description</p>
                <p className="font-semibold">{order.item?.description.slice(0, 50)}</p>
              </div>
              <div>


                  <div>
                    <div className='flex gap-2'><DollarSign className="h-4 w-4"/>
                      <p className="text-gray-600 text-xs">Payment Status</p></div>
                    <p className="font-semibold">{order.paymentInfo ? 'Paid' : order.payOnDelivery ? 'Pay on delivery' : 'Not Paid'}</p>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Info & Signatures */}
        <div className="mt-4 border-t border-gray-200 pt-2">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <p className="text-xs text-gray-600 mt-1">Processed Date</p>
              <p className="font-semibold">{(order.createdAt? new Date(order.createdAt) : new Date()).toLocaleDateString()}</p>
            </div>
            <div className='mt-10'>
              <p className="text-xs text-gray-800 border-t border-gray-600 pt-1">Staff Signature & Stamp</p>
              <div className="h-8 mt-1"></div>
            </div>
            <div className='mt-10'>
              <p className="text-xs text-gray-800 border-t border-gray-600 pt-1">Customer Signature</p>
              <div className="h-8 mt-1"></div>
            </div>
            <div className='mt-10'>
              <p className="text-xs text-gray-800 border-t border-gray-600 pt-1">Receiver Signature</p>
              <div className="h-8 mt-1"></div>
            </div>
          </div>
        </div>
      </div>
  );
};
export default WaybillInvoice;
