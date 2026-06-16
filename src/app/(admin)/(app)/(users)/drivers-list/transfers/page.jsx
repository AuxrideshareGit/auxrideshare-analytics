import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import TransferListTabel from '../components/TransferListTabel';

export const metadata = {
  title: 'Driver Transfers'
};

const Page = ({ searchParams }) => {
  const driverName = searchParams?.name;
  const pageTitle = driverName ? `${driverName} Transfer List` : 'Transfers';

  return (
    <main>
      <PageBreadcrumb subtitle="Drivers" title={pageTitle} />
      <TransferListTabel />
    </main>
  );
};

export default Page;
