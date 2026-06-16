import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import OrderDetails from './components/OrderDetails';
import ShippingDetails from './components/ShippingDetails';
import OrdersSummary from './components/OrdersSummary';
import OrderStatus from './components/OrderStatus';
import DocumentTrackingOrder from './components/DocumentTrackingOrder';
export const metadata = {
  title: 'Order'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Order Overview" subtitle="Menu" />
      <OrderDetails />
      <div className="grid lg:grid-cols-4 grid-cols-1 gap-5 mb-5">
        <div className="lg:col-span-3 col-span-1">
          <ShippingDetails />
          <OrdersSummary />
          <OrderStatus />
        </div>
        <DocumentTrackingOrder />
      </div>
    </main>;
};
export default Page;