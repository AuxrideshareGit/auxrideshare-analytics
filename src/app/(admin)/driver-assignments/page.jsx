import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DriverAssignmentsTable from './components/DriverAssignmentsTable';

export const metadata = { title: 'Driver Assignments' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Ride Management" title="Driver Assignments" />
    <DriverAssignmentsTable />
  </main>;
};

export default Page;
