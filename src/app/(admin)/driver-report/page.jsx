import React from 'react';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import DriverReportTable from './components/DriverReportTable';

export const metadata = { title: 'Driver Report' };

const DriverReportPage = () => {
  return (
    <main>
      <PageBreadcrumb title="Driver Report" subtitle="Reports" />
      <div className="p-4 md:p-6">
        <DriverReportTable />
      </div>
    </main>
  );
};

export default DriverReportPage;
