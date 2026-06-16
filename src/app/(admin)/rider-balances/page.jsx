import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import RiderBalancesTabs from './components/RiderBalancesTabs';

export const metadata = { title: 'Rider Balances' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Accounts" title="Rider Balances" />
    <RiderBalancesTabs />
  </main>;
};

export default Page;
