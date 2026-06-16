import React from 'react';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import RidePeakTimes from './components/RidePeakTimes';

export const metadata = {
  title: 'Ride Peak Times | Reports'
};

const Page = () => {
  return (
    <main>
      <PageBreadcrumb subtitle="Reports" title="Ride Peak Times" />
      <RidePeakTimes />
    </main>
  );
};

export default Page;
