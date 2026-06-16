import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import VehiclesTable from './components/VehiclesTable';

export const metadata = { title: 'Vehicles' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="Vehicles" />
    <VehiclesTable />
  </main>;
};

export default Page;
