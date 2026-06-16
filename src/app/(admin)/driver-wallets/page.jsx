import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DriverWalletsTable from './components/DriverWalletsTable';

export const metadata = { title: 'Driver Wallets' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Ride Management" title="Driver Wallets" />
    <DriverWalletsTable />
  </main>;
};

export default Page;
