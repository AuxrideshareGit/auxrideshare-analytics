import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import TransferDelaysTable from './components/TransferDelaysTable';

export const metadata = { title: 'Transfer Delays' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Ride Management" title="Driver Commission Transfer Delays" />
    <TransferDelaysTable />
  </main>;
};

export default Page;
