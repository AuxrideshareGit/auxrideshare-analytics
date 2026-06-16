import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
import Notes from './components/Notes';
export const metadata = {
  title: 'Notes'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Notes" subtitle="Menu" />
      <Notes />
    </main>;
};
export default Page;