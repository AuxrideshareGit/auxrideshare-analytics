import PageBreadcrumb from '@/components/PageBreadcrumb';
import React from 'react';
export const metadata = {
  title: 'Starter'
};
const Page = () => {
  return <main>
      <PageBreadcrumb title="Starter" subtitle="Menu" />
      <div className="card h-40"></div>
    </main>;
};
export default Page;