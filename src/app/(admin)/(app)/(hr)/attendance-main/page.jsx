import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import EmployeeReport from './components/EmployeeReport';
import EmployeeReportTabel from './components/EmployeeReportTabel';
export const metadata = {
  title: 'Main Attendance'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Main Attendance" subtitle="Menu" />
      <EmployeeReport />
      <EmployeeReportTabel />
    </main>;
};
export default Page;