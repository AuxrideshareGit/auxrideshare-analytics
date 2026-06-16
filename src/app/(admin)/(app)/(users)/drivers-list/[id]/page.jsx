import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DriverOverview from './components/DriverOverview';

export const metadata = {
  title: 'Driver Overview'
};

const Page = async ({ params }) => {
  const { id } = await params;
  return (
    <main>
      <PageBreadcrumb subtitle="Drivers" title={`Driver #${id} Overview`} />
      <DriverOverview driverId={id} />
    </main>
  );
};

export default Page;
