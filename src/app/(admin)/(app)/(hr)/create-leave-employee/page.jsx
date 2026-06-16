import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import AddLeave from './components/AddLeave';
export const metadata = {
  title: 'Add Leave (Employee)'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Add Leave (Employee)" subtitle="Menu" />
      <AddLeave />
    </main>;
};
export default Page;