import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DeviceInfoTable from './components/DeviceInfoTable';

export const metadata = { title: 'Device Information' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="Device Information" />
    <DeviceInfoTable />
  </main>;
};

export default Page;
