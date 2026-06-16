import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DriverRidesTable from '../components/DriverRidesTable';

export const metadata = {
  title: 'Driver Ride Requests'
};

const Page = async ({ params }) => {
  const { id } = await params;
  return (
    <main>
      <PageBreadcrumb subtitle="Drivers" title={`Driver #${id} Ride Details`} />
      <DriverRidesTable driverId={id} />
    </main>
  );
};

export default Page;
