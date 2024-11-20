import {createFileRoute, useLoaderData, useNavigate} from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Building2, User, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import TitleCard from "@/components/page-components/title.tsx";

const CorporateCustomerOverview = () => {
  const corporateCustomer = useLoaderData({from: '/_authenticated/customers/corporate/$id'})
  console.log(corporateCustomer)
  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const navigate = useNavigate();

  return (
      <>
        <TitleCard title='Corporate Customer Overiview'
                   description='Overview of corporate customer details, orders and transactions'/>
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          {/* Wallet Balance Section */}
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Wallet className="mr-2 h-6 w-6 text-muted-foreground"/>
                <span className="text-lg font-semibold mr-2">Wallet Balance:</span>
                <span className="text-2xl font-bold text-primary">
              ₦{corporateCustomer.walletBalance.toLocaleString()}
            </span>
              </div>
              <Button size="sm" onClick={() => navigate({to: `/customers/corporate/${corporateCustomer.id}/refill`})}>
                <Wallet className="mr-2 h-4 w-4"/> Refill Wallet
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Business Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <Building2 className="mr-2 h-6 w-6 text-muted-foreground"/>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">

                <div className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-muted-foreground"/>
                  <span className="font-medium">{corporateCustomer.businessName}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground"/>
                  <span>{corporateCustomer.businessAddress.address}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-muted-foreground"/>
                  <span>{corporateCustomer.businessPhone}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <span>
                  Created: {formatDate(corporateCustomer.createdAt)}
                </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center">
                  <User className="mr-2 h-6 w-6 text-muted-foreground"/>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <span className="font-medium">
                  {corporateCustomer.customerInfo.firstname} {corporateCustomer.customerInfo.lastname}
                </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <span>{corporateCustomer.customerInfo.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <span>{corporateCustomer.customerInfo.phoneNumber}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <span>{corporateCustomer.customerInfo.address.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground"/>
                    <span>
                  Created: {formatDate(corporateCustomer.customerInfo.createdAt)}
                </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
  );
};

export const Route = createFileRoute(
    '/_authenticated/customers/corporate/$id/',
)({
  component: CorporateCustomerOverview,
})
