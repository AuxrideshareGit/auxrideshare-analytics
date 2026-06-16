import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import RiderOverview from './components/RiderOverview';

export const metadata = {
  title: 'Rider Overview'
};

const Page = async ({ params }) => {
  const { id } = await params;
  return (
    <main>
      <PageBreadcrumb subtitle="Riders" title={`Rider #${id} Overview`} />
      <RiderOverview riderId={id} />
    </main>
  );
};

export default Page;
