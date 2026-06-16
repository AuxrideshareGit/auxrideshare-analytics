import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import CancelReasonsTable from './components/CancelReasonsTable';

export const metadata = { title: 'Cancel Reasons' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="Cancel Reasons" />
    <CancelReasonsTable />
  </main>;
};

export default Page;
