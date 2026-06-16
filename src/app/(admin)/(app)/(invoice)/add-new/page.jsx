import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import AddNew from './components/AddNew';
export const metdata = {
  title: 'Add New'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Add New" subtitle="Menu" />
      <AddNew />
    </main>;
};
export default Page;