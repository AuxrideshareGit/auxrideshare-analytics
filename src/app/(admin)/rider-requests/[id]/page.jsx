import React from 'react';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import RideDetailsView from './components/RideDetailsView';

export const metadata = {
  title: 'Ride Details',
};

const Page = async ({ params }) => {
  const resolvedParams = await params;
  
  return (
    <main>
      <PageBreadcrumb subtitle="Ride Management" title={`Ride Details #${resolvedParams.id}`} />
      <RideDetailsView rideId={resolvedParams.id} />
    </main>
  );
};

export default Page;
