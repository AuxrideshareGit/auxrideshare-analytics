import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import OtpsTable from './components/OtpsTable';

export const metadata = { title: 'OTPs' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="OTPs" />
    <OtpsTable />
  </main>;
};

export default Page;
