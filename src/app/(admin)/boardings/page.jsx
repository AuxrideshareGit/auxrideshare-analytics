import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import BoardingsTable from './components/BoardingsTable';

export const metadata = { title: 'Boardings' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Ride Management" title="Boardings" />
    <BoardingsTable />
  </main>;
};

export default Page;
