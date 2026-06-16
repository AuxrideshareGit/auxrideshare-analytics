import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import RiderRequestsTable from './components/RiderRequestsTable';

export const metadata = {
  title: 'Rider Requests'
};

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Ride Management" title="Rider Requests" />
    <RiderRequestsTable />
  </main>;
};

export default Page;
