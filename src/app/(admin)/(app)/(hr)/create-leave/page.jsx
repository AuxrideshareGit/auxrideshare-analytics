import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import CreateLeave from './components/CreateLeave';
export const metadata = {
  title: 'Add Leave (HR)'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Add Leave (HR)" subtitle="Menu" />
      <CreateLeave />
    </main>;
};
export default Page;