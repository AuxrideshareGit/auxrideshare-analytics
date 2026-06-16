import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import CitiesTable from './components/CitiesTable';

export const metadata = { title: 'Cities' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="Cities" />
    <CitiesTable />
  </main>;
};

export default Page;
