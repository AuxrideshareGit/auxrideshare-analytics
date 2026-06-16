import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import AuditLogsTable from './components/AuditLogsTable';

export const metadata = { title: 'Audit Logs' };

const Page = () => {
  return <main>
    <PageBreadcrumb subtitle="System" title="Audit Log Entries" />
    <div className="card shadow-sm border border-default-200">
      <AuditLogsTable />
    </div>
  </main>;
};

export default Page;
