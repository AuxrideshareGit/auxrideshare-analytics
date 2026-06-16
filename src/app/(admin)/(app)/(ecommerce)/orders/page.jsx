import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import OrderDetails from './components/OrderDetails';
import OrderOverView from './components/OrderOverView';
import OrderDetailTable from './components/OrderDetailTabel';
export const metadata = {
  title: 'Orders'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Orders List" subtitle="Orders" />
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-5 mb-5">
        <OrderDetails />
        <OrderOverView />
      </div>
      <OrderDetailTable />
    </main>;
};
export default Page;