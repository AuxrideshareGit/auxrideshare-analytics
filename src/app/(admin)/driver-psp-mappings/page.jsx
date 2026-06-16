import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import DriverMappingsPage from './components/DriverMappingsPage';

export const metadata = { title: 'Driver PSP Mappings' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="Driver Mappings" />
    <DriverMappingsPage />
  </main>;
};

export default Page;
