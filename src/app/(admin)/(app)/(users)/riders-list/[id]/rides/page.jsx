import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import RiderRidesTable from '../components/RiderRidesTable';

export const metadata = {
  title: 'Rider Ride Requests'
};

const Page = async ({ params }) => {
  const { id } = await params;
  return (
    <main>
      <PageBreadcrumb subtitle="Riders" title={`Rider #${id} Ride Details`} />
      <RiderRidesTable riderId={id} />
    </main>
  );
};

export default Page;
