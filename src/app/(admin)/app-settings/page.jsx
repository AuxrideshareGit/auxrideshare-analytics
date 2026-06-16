import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import AppSettings from './components/AppSettings';

export const metadata = { title: 'App Settings' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="Settings" title="App Settings" />
    <AppSettings />
  </main>;
};

export default Page;
