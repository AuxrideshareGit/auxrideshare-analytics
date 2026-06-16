import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import RideStatsTable from './components/RideStatsTable';

export const metadata = { title: 'Ride Stats' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Reports" title="Ride Stats" />
    <RideStatsTable />
  </main>;
};

export default Page;
