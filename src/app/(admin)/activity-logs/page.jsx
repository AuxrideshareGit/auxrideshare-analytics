import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import ActivityLogsTable from './components/ActivityLogsTable';

export const metadata = { title: 'Activity Logs' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="Activity Logs" />
    <div className="card shadow-sm border border-default-200">
      <ActivityLogsTable />
    </div>
  </main>;
};

export default Page;
