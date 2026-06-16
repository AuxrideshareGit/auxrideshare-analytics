import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import NotificationsTable from './components/NotificationsTable';

export const metadata = { title: 'Notifications' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="Notifications" />
    <NotificationsTable />
  </main>;
};

export default Page;
