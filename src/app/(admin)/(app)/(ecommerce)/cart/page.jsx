import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import CartItems from './components/CartItems';
import OrderSummary from './components/OrderSummary';
import Modal from './components/Modal';
export const metadata = {
  title: 'Shopping Cart'
};
const Page = () => {
  return <>
      <main>
        <PageBreadcrumb title="Shopping Cart" subtitle="Menu" />
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-5">
          <CartItems />
          <OrderSummary />
        </div>
      </main>
      <Modal />
    </>;
};
export default Page;