import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import CouponCodesTable from './components/CouponCodesTable';

export const metadata = { title: 'Coupon Codes' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="Coupon Codes" />
    <CouponCodesTable />
  </main>;
};

export default Page;
