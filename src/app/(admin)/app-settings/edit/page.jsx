import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import EditAppSettings from './components/EditAppSettings';

export const metadata = { title: 'Edit App Settings' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="Edit App Settings" />
    <EditAppSettings />
  </main>;
};

export default Page;
