import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DriverBalancesTabs from './components/DriverBalancesTabs';

export const metadata = { title: 'Driver Balances' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Accounts" title="Driver Balances" />
    <DriverBalancesTabs />
  </main>;
};

export default Page;
