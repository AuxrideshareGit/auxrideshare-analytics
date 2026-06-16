import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import ErrorLogsTable from './components/ErrorLogsTable';

export const metadata = { title: 'Error Logs' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="Error Logs" />
    <div className="card shadow-sm border border-default-200">
      <ErrorLogsTable />
    </div>
  </main>;
};

export default Page;
