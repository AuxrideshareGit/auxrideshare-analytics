import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import LeaveCard from './components/LeaveCard';
import EmpLeave from './components/EmpLeave';
export const metadata = {
  title: 'Leave Manage (Employee)'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Leave Manage (Employee)" subtitle="Menu" />
      <LeaveCard />
      <EmpLeave />
    </main>;
};
export default Page;